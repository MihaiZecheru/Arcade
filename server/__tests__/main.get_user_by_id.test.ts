import router from '../src/routes/router';
import Database, { TEntry } from '../mdb_local/index';
import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { IUser, UserID } from '../src/models/user';

beforeEach(() => {
  Database.connect();
  Database.set_table_parse_function("Users", (entry: TEntry): IUser => {
    let user: IUser = {} as IUser;
    user.user_id = entry.user_id as UserID;
    user.username = entry.username;
    user.password = entry.password;
    user.balance = parseInt(entry.balance);
    user.email = entry.email;
    user.birthday = entry.birthday;
    user.joined = entry.joined;
    return user;
  });
});

afterEach(() => {
  Database.disconnect();
});

describe('Test the get_user_by_id function', () => {
  const user_id: UserID = 'aa4d7f07-b82a-4b3b-bbf3-382d431b907b';
  const expected_user: IUser = {
    user_id,
    username: "tester",
    password: "test",
    balance: 250,
    email: "test@gmail.com",
    birthday: "01/01/1980",
    joined: "01/01/1980"
  };

  const req = { params: { user_id } };
  const res = { data: null, send: (x: any) => { res.data = x }, statusCode: null, status: (x: any) => { res.statusCode = x; return res; } };

  beforeEach(() => {
    res.data = null;
  });

  test('retrieve user by ID', async () => {
    await router.main.get_user_by_id(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.data).toBeDefined();
    expect(res.data).toEqual(expected_user);
  });

  test('retrieve non-existing user', async () => {
    await router.main.get_user_by_id({ params: { user_id: "fake user id" } }, res);
    expect(res.statusCode).toBe(400);
    expect(res.data).toBe('User not found');
  });
});
