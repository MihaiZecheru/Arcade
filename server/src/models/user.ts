import Database from "../../mdb_local/index";

function uuid(): string {
  const _uuid: string = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });

  // do not allow uuid to begin with a number
  if (/[0-9]/g.test(_uuid[0])) {
    return uuid();
  }
  
  return _uuid;
}

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
  public user_id: string;
  public username: string;
  public password: string;
  public balance: number;
  public email: string;
  public birthday: string;
  public joined: string;

  constructor({ user_id, username, password, balance, email, birthday, joined }: IUser) {
    this.user_id = user_id;
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
}