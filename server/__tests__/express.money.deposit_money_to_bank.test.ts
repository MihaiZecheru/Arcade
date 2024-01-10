import Database, { TEntry } from '../mdb_local';
import { IUser, UserID } from '../src/models/user';
import deposit_money_to_bank from '../src/routes/money/deposit_money_to_bank';
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

describe('Test the deposit_money_to_bank function', () => {
  const req = { params: { user_id: "aa4d7f07-b82a-4b3b-bbf3-382d431b907b" }, body: { amount: 0 } };
  const res = { text: '', send: (x: any) => { res.text = x }, statusCode: null, status: (x: any) => { res.statusCode = x; return res; } };
  
  test('deposit 12 of the 250$ in the wallet to the bank', () => {
    req.body.amount = 12;
    deposit_money_to_bank(req, res)
    expect(res.statusCode).toBe(200);
    // test user has 1000 in bank and 250 in wallet
    const user: IUser = Database.get_unique_where<IUser>("Users", "user_id", req.params.user_id)!;
    expect(user.bank_balance).toBe(1000 + 12);
    expect(user.wallet_balance).toBe(250 - 12);
    
    // cleanup
    Database.patch_where("Users", "user_id", req.params.user_id, {
      wallet_balance: "250",
      bank_balance: "1000"
    });
  });

  test('deposit 250$ (the amount the test user has in the wallet) to the bank', () => {
    req.body.amount = 250;
    deposit_money_to_bank(req, res)
    expect(res.statusCode).toBe(200);
    // test user has 1000 in bank and 250 in wallet
    const user: IUser = Database.get_unique_where<IUser>("Users", "user_id", req.params.user_id)!;
    expect(user.bank_balance).toBe(1000 + 250);
    expect(user.wallet_balance).toBe(0);

    // cleanup
    Database.patch_where("Users", "user_id", req.params.user_id, {
      wallet_balance: "250",
      bank_balance: "1000"
    });
  });

  test('deposit 251$ (more than the amount the test user has in the wallet) to the bank', () => {
    req.body.amount = 251;
    deposit_money_to_bank(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.text).toBe('Insufficient funds');
  });

  test('deposit 0$ to the bank (error)', () => {
    req.body.amount = 0;
    deposit_money_to_bank(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.text).toBe('Amount must be positive');
  });

  test('deposit -1$ to the bank (error)', () => {
    req.body.amount = -1;
    deposit_money_to_bank(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.text).toBe('Amount must be positive');
  });

  test('invalid user_id should return error', () => {
    deposit_money_to_bank({ params: { user_id: "invalid uuid" } }, res);
    expect(res.statusCode).toBe(400);
    expect(res.text).toBe('Invalid user_id');
  });

  test('non-existant user_id should return error', () => {
    deposit_money_to_bank({ params: { user_id: "bb4d7f07-b82a-4b3b-bbf3-382d431b907b" } }, res);
    expect(res.statusCode).toBe(400);
    expect(res.text).toBe('User not found');
  });
});