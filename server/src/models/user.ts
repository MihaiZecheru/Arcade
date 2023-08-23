import Database from "../../mdb_local/index";
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

  /**
   * Increase the user's balance by the given amount
   * @param amount The amount to increase the balance by
   */
  public increase_balance(amount: number) {
    this.balance += amount;
  }

  /**
   * Decrease the user's balance by the given amount
   * @param amount The amount to decrease the balance by
   */
  public decrease_balance(amount: number) {
    if (this.balance < amount) throw new Error("Insufficient token balance");
    this.balance -= amount;
  }

  /**
   * Save any changes to the user in the database
   */
  public save() {
    Database.patch_where("Users", "user_id", this.user_id, {
      username: this.username,
      password: this.password,
      balance: this.balance.toString(),
      email: this.email
    });
  }
  
  /**
   * Generate a unique user ID
   * @returns A unique user ID
   */
  public static async generate_id(): Promise<string> {
    while (true) {
      const user_id = uuid();
      // check if ID is already in use
      if (await Database.get_where("Users", "user_id", user_id).length === 0) return user_id;
    }
  }

  /**
   * Get a user from the database
   * @param user_id The ID of the user to get
   * @returns The user with the given ID
   */
  public static async get_user(user_id: UserID): Promise<User> {
    const user: Array<IUser> = await Database.get_where<IUser>("Users", "user_id", user_id);
    if (user.length === 0) throw new Error(`User ${user_id} not found`);
    return new User(user[0] as IUser);
  }
}