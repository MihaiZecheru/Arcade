import Database from '../mdb_local';
import User, { IUser } from '../src/models/user';
import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';

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

describe('Test the User class methods', () => {
  const user_id = 'aa4d7f07-b82a-4b3b-bbf3-382d431b907b';
  const test_user: IUser = Database.get_where<IUser>('Users', 'user_id', user_id, true) as IUser;

  test('increase_balance method', () => {
    const user = new User(test_user);
    user.increase_balance(100);
    expect(user.balance).toBe(600);
  });

  test('decrease_balance method with sufficient balance', () => {
    const user = new User(test_user);
    user.decrease_balance(100);
    expect(user.balance).toBe(400);
  });

  test('decrease_balance method with insufficient balance', () => {
    const user = new User(test_user);
    expect(() => user.decrease_balance(600)).toThrow('Insufficient token balance');
  });

  test('save method', () => {
    const user = new User(test_user);
    // TODO:
  });

  test('generate_id method', async () => {
    const uuid = await User.generate_id();
    expect(uuid).toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}/);
  });

  test('get_user method with existing user', async () => {
    const user = await User.get_user(user_id);
    expect(user).toBeInstanceOf(User);
  });

  test('get_user method with non-existing user', async () => {
    // @ts-ignore
    const user = await User.get_user('non-existing-user-id');
    expect(user).toBeNull();
  });
});
