import Database from "../../mdb_local/index";
import uuid, { ID } from "./ID";

export type UserID = ID;
export const USER_STARTING_BANK_BALANCE = 250;

export interface IUser {
  id: UserID;
  username: string;
  password: string;
  wallet_balance: number; // int
  bank_balance: number; // int
  email: string;
  birthday: string;
  joined: string;
}

export default class User implements IUser {
  public id: UserID;
  public username: string;
  public password: string;
  public wallet_balance: number; // int
  public bank_balance: number; // int
  public email: string;
  public birthday: string;
  public joined: string;

  /**
   * The user's total balance, which is the sum of their wallet and bank balances
   */
  public get total_balance(): number {
    return this.wallet_balance + this.bank_balance;
  }

  constructor({ id: user_id, username, password, wallet_balance, bank_balance, email, birthday, joined }: IUser) {
    this.id = user_id as UserID;
    this.username = username;
    this.password = password;
    this.wallet_balance = wallet_balance;
    this.bank_balance = bank_balance;
    this.email = email;
    this.birthday = birthday;
    this.joined = joined;
  }

  /**
   * Increase the user's wallet balance by the given amount
   * @param amount The amount to increase the balance by
   */
  public increase_wallet_balance(amount: number) {
    this.wallet_balance += amount;
    this.save();
  }
  
  /**
   * Increase the user's bank balance by the given amount
   * @param amount The amount to increase the balance by
   */
  public increase_bank_balance(amount: number) {
    this.bank_balance += amount;
    this.save();
  }

  /**
   * Decrease the user's wallet balance by the given amount
   * @param amount The amount to decrease the balance by
   * @error Insufficient funds
   * @error Invalid amount
   */
  public decrease_wallet_balance(amount: number) {
    if (this.wallet_balance < 0) throw new Error("Invalid amount - must be positive");
    if (this.wallet_balance < amount) throw new Error("Insufficient funds");
    this.wallet_balance -= amount;
    this.save();
  }

  /**
   * Decrease the user's bank balance by the given amount
   * @param amount The amount to decrease the balance by
   * @error Insufficient funds
   * @error Invalid amount
   */
  public decrease_bank_balance(amount: number) {
    if (this.bank_balance < 0) throw new Error("Invalid amount - must be positive");
    if (this.bank_balance < amount) throw new Error("Insufficient funds");
    this.bank_balance -= amount;
    this.save();
  }

  /**
   * withdraw money from the user's bank to their wallet
   * @param amount The amount to withdraw
   * @error Insufficient funds
   * @error Invalid amount
   */
  public withdraw_money_from_bank(amount: number) {
    this.decrease_bank_balance(amount);
    this.increase_wallet_balance(amount);
    this.save();
  }
  
  /**
   * deposit money from the user's wallet to their bank
   * @param amount The amount to deposit
   * @error Insufficient funds
   * @error Invalid amount
   */
  public deposit_money_to_bank(amount: number) {
    this.decrease_wallet_balance(amount);
    this.increase_bank_balance(amount);
    this.save();
  }

  /**
   * Save any changes to the user in the database
   */
  public save() {
    Database.patch_where("Users", "user_id", this.id, {
      username: this.username,
      password: this.password,
      wallet_balance: this.wallet_balance.toString(),
      bank_balance: this.bank_balance.toString(),
      email: this.email
    });
  }
  
  /**
   * Generate a unique user ID
   * @returns A unique user ID
   */
  public static generate_id(): string {
    while (true) {
      const user_id = uuid();
      // check if ID is already in use
      if (Database.get_where("Users", "user_id", user_id).length === 0) return user_id;
    }
  }

  /**
   * Get a user from the database
   * @param user_id The ID of the user to get
   * @returns The user with the given ID
   * @error User not found
   */
  public static get_user(user_id: UserID): User {
    const user: Array<IUser> = Database.get_where<IUser>("Users", "user_id", user_id);
    if (user.length === 0) throw new Error(`User '${user_id}' not found`);
    return new User(user[0] as IUser);
  }
}
