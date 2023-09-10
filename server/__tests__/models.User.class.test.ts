import Database, { TEntry } from '../mdb_local';
import User, { IUser, UserID } from '../src/models/user';
import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';

describe('Test the User class methods', () => {
  Database.connect();
  Database.set_table_parse_function("Users", (entry: TEntry): IUser => {
    return {
      user_id: entry.user_id as UserID,
      username: entry.username,
      password: entry.password,
      balance: parseInt(entry.balance),
      email: entry.email,
      birthday: entry.birthday,
      joined: entry.joined,
    };
});

  const user_id = 'aa4d7f07-b82a-4b3b-bbf3-382d431b907b';
  const test_user: IUser = Database.get_unique_where<IUser>('Users', 'user_id', user_id);
  let user = new User(test_user);

  beforeEach(() => {
    user = new User(test_user);
  });

  afterEach(() => {
    new User(test_user).save(); // reset user in database
  });

  test('increase_balance method', () => {
    const user = new User(test_user);
    user.increase_balance(100);
    expect(user.balance).toBe(250 + 100);
  });

  test('decrease_balance method with sufficient balance', () => {
    const user = new User(test_user);
    user.decrease_balance(100);
    expect(user.balance).toBe(250 - 100);
  });

  test('decrease_balance method with insufficient balance', () => {
    const user = new User(test_user);
    expect(() => user.decrease_balance(10000)).toThrow('Insufficient token balance');
  });

  test('save method', () => {
    const user = new User(test_user);
    user.username = "different username";
    user.save();
    const updated_user = Database.get_unique_where<IUser>('Users', 'user_id', user_id);
    expect(updated_user.username).toBe("different username");
  });

  test('generate_id method', () => {
    const uuid = User.generate_id();
    expect(uuid).toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}/);
  });

  test('get_user method with existing user', () => {
    const user = User.get_user(user_id);
    expect(user).toBeInstanceOf(User);
  });

  test('get_user method with non-existing user', () => {
    // @ts-ignore - error with 'fake user-id' string not matching UserID type
    expect(() => User.get_user('fake user-id')).toThrow("User 'fake user-id' not found");
  });
});
