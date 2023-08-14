import Database, { TEntriesFilter, TEntry } from "../../mdb_local/index";
import uuid, { ID } from "./ID";

export type UserID = ID;

export interface IUser {
  user_id: string;
  username: string;
  password: string;
  balance: number;
  email: string;
  birthday: string;
  joined: string;
}

export default class User implements IUser {
  public user_id: UserID;
  public username: string;
  public password: string;
  public balance: number;
  public email: string;
  public birthday: string;
  public joined: string;

  constructor({ user_id, username, password, balance, email, birthday, joined }: IUser) {
    this.user_id = user_id as UserID;
    this.username = username;
    this.password = password;
    this.balance = balance;
    this.email = email;
    this.birthday = birthday;
    this.joined = joined;
  }

  public increase_balance(amount: number) {
    this.balance += amount;
  }

  public decrease_balance(amount: number) {
    this.balance -= amount;
  }

  public save() {
    Database.patch_where("Users", "user_id", this.user_id, {
      username: this.username,
      password: this.password,
      balance: this.balance.toString(),
      email: this.email
    });
  }
  
  public static async generate_id(): Promise<string> {
    while (true) {
      const user_id = uuid();
      // check if ID is already in use
      if (await Database.get_where("Users", "user_id", user_id).length === 0) return user_id;
    }
  }

  public static async get_user(user_id: UserID): Promise<User> {
    const user: Array<IUser> = await Database.get_where<IUser>("Users", "user_id", user_id);
    if (user.length === 0) throw new Error(`User ${user_id} not found`);
    return new User(user[0] as IUser);
  }
}