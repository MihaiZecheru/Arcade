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

describe('Test the main.login function -- log the user into the database', () => {
  const req = { body: { username: "tester", password: "test" } };
  const res = { text: '', send: (x: any) => { res.text = x }, statusCode: null, status: (x: any) => { res.statusCode = x; return res; } };
  const user_id: UserID = "aa4d7f07-b82a-4b3b-bbf3-382d431b907b";

  test('login successfully with correct credentials', () => {
    router.main.login(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe(user_id);
  });

  test('login with incorrect password - should throw error', () => {
    router.main.login({ body: { username: req.body.username, password: 'wrong password' } }, res);
    expect(res.statusCode).toBe(400);
    expect(res.text).toBe('Incorrect password');
  });

  test('login with non-existing user - should throw error', () => {
    router.main.login({ body: { username: 'wrong username', password: req.body.password } }, res);
    expect(res.statusCode).toBe(400);
    expect(res.text).toBe('User not found');
  });

  test('login with too many fields - should throw error', () => {
    router.main.login({ body: { username: req.body.username, password: req.body.password, extra: 'field' } }, res);
    expect(res.statusCode).toBe(400);
    expect(res.text).toBe('Too many fields in data');
  });
});
