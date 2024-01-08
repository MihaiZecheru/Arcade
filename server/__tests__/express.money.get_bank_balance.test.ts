import Database, { TEntry } from '../mdb_local';
import { IUser, UserID } from '../src/models/user';
import get_bank_balance from '../src/routes/money/get_bank_balance';
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

describe('Test the get_bank_balance function', () => {
  const req = { params: { user_id: "aa4d7f07-b82a-4b3b-bbf3-382d431b907b" } };
  const res = { text: '', send: (x: any) => { res.text = x }, statusCode: null, status: (x: any) => { res.statusCode = x; return res; } };
  
  test('valid user_id should return 1250', () => {
    get_bank_balance(req, res)
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe(1000); // test user has 1000 in bank and 250 in wallet
  });

  test('invalid user_id should return error', () => {
    get_bank_balance({ params: { user_id: "invalid uuid" } }, res);
    expect(res.statusCode).toBe(400);
    expect(res.text).toBe('Invalid user_id');
  });

  test('non-existant user_id should return error', () => {
    get_bank_balance({ params: { user_id: "bb4d7f07-b82a-4b3b-bbf3-382d431b907b" } }, res);
    expect(res.statusCode).toBe(400);
    expect(res.text).toBe('User not found');
  });
});