import router from '../src/routes/router';
import Database, { TEntry } from '../mdb_local/index';
import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { IUser, UserID } from '../src/models/user';

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

describe('Test the main.get_user_by_id function', () => {
  const user_id: UserID = 'aa4d7f07-b82a-4b3b-bbf3-382d431b907b';
  const expected_user: IUser = {
    id: user_id,
    username: "tester",
    password: "test",
    wallet_balance: 0,
    bank_balance: 250,
    email: "test@example.com",
    birthday: "01/01/1980",
    joined: "01/01/1980"
  };

  const req = { params: { user_id } };
  const res = { data: null, send: (x: any) => { res.data = x }, statusCode: null, status: (x: any) => { res.statusCode = x; return res; } };

  test('retrieve user by ID successfully', () => {
    router.main.get_user_by_id(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.data).toBeDefined();
    expect(res.data).toEqual(expected_user);
  });

  test('retrieve non-existing user - should throw error', () => {
    router.main.get_user_by_id({ params: { user_id: "fake user id" } }, res);
    expect(res.statusCode).toBe(400);
    expect(res.data).toBe('User not found');
  });
});
