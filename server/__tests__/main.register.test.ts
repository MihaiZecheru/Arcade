import { uuid_regex } from '../src/models/ID';
import router from '../src/routes/router';
import Database, { TEntry } from '../mdb_local/index';
import { USER_STARTING_BALANCE } from '../src/models/user';
import { describe, afterEach, test, expect } from '@jest/globals';
import { IUser, UserID } from '../src/models/user';

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

describe('Test the register function -- register a user to the database', () => {
  const req = { body: { username: 'tester', password: 'test', email: 'test@gmail.com', birthday: '01/01/1980'} };
  const res = { text: '', send: (x) => { res.text = x }, statusCode: null, status: (x) => { res.statusCode = x; return res; } };

  afterEach(() => {    
    Database.delete_where("Users", "user_id", res.text)
  });

  test('register user and return uuid', async () => {
    await router.main.register(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(uuid_regex);

    const user = Database.get_where("Users", "user_id", res.text)[0];

    expect(user.user_id).toMatch(res.text);
    expect(user.username).toBe(req.body.username);
    expect(user.password).toBe(req.body.password);
    expect(user.balance).toBe(USER_STARTING_BALANCE);
    expect(user.email).toBe(req.body.email);
    expect(user.birthday).toBe(req.body.birthday);
    expect(user.joined).toBeDefined();
  });
});