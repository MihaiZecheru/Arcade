import Database, { TEntry } from '../mdb_local';
import { IUser, UserID } from '../src/models/user';
import withdraw_money_from_bank from '../src/routes/money/withdraw_money_from_bank';
import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';

beforeEach(() => {
  Database.connect();
  Database.set_table_parse_function("Users", (entry: TEntry): IUser => {
    let user: IUser = {} as IUser;
    user.id = entry.user_id as UserID;
    user.username = entry.username;
    user.password = entry.password;
    user.wallet_balance = parseInt(entry.wallet_balance);
    user.bank_balance = parseInt(entry.bank_balance);
    user.email = entry.email;
    user.birthday = entry.birthday;
    user.joined = entry.joined;
    return user;
  });
});

afterEach(() => {
  Database.disconnect();
});

describe('Test the withdraw_money_from_bank function', () => {
  const req = { params: { user_id: "aa4d7f07-b82a-4b3b-bbf3-382d431b907b" }, body: { amount: 0 } };
  const res = { text: '', send: (x: any) => { res.text = x }, statusCode: null, status: (x: any) => { res.statusCode = x; return res; } };
  
  test('withdraw 27 of the 1000$ from the bank to the wallet', () => {
    req.body.amount = 27;
    withdraw_money_from_bank(req, res)
    expect(res.statusCode).toBe(200);
    // test user has 1000 in bank and 250 in wallet
    const user: IUser = Database.get_unique_where<IUser>("Users", "user_id", req.params.user_id)!;
    expect(user.bank_balance).toBe(1000 - 27);
    expect(user.wallet_balance).toBe(250 + 27);
    
    // cleanup
    Database.patch_where("Users", "user_id", req.params.user_id, {
      wallet_balance: "250",
      bank_balance: "1000"
    });
  });

  test('withdraw 1000$ (the amount the test user has in the bank) from the bank to the wallet', () => {
    req.body.amount = 1000;
    withdraw_money_from_bank(req, res);
    expect(res.statusCode).toBe(200);
    // test user has 1000 in bank and 250 in wallet
    const user: IUser = Database.get_unique_where<IUser>("Users", "user_id", req.params.user_id)!;
    expect(user.bank_balance).toBe(0);
    expect(user.wallet_balance).toBe(250 + 1000);

    // cleanup
    Database.patch_where("Users", "user_id", req.params.user_id, {
      wallet_balance: "250",
      bank_balance: "1000"
    });
  });

  test('withdraw 1001$ (more than the amount the test user has in the bank) from the bank to the wallet', () => {
    req.body.amount = 1001;
    withdraw_money_from_bank(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.text).toBe('Insufficient funds');
  });

  test('withdraw 0$ from the bank (error)', () => {
    req.body.amount = 0;
    withdraw_money_from_bank(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.text).toBe('Amount must be positive');
  });

  test('withdraw -1$ from the bank (error)', () => {
    req.body.amount = -1;
    withdraw_money_from_bank(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.text).toBe('Amount must be positive');
  });

  test('invalid user_id should return error', () => {
    withdraw_money_from_bank({ params: { user_id: "invalid uuid" } }, res);
    expect(res.statusCode).toBe(400);
    expect(res.text).toBe('Invalid user_id');
  });

  test('non-existant user_id should return error', () => {
    withdraw_money_from_bank({ params: { user_id: "bb4d7f07-b82a-4b3b-bbf3-382d431b907b" } }, res);
    expect(res.statusCode).toBe(400);
    expect(res.text).toBe('User not found');
  });
});