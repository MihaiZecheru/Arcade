namespace ArcadeLib;

public class ArcadeUser
{
    /// <summary>
    /// The user's ID
    /// </summary>
    public ArcadeLib.UUID ID { get; }

    /// <summary>
    /// The user's username
    /// </summary>
    public string Username { get; }

    /// <summary>
    /// The user's password
    /// </summary>
    public string Password { get; }
    
    /// <summary>
    /// The amount of tokens the user has
    /// </summary>
    private int _balance;

    /// <summary>
    /// The user's email address
    /// </summary>
    public string Email { get; }

    /// <summary>
    /// The user's birthday
    /// </summary>
    public string Birthday { get; }

    /// <summary>
    /// The date the user joined Arcade
    /// </summary>
    public string Joined { get; }

    /// <summary>
    /// Initialize an existing user
    /// </summary>
    public ArcadeUser(ArcadeLib.UUID user_id, string username, string password, int balance, string email, string birthday, string joined)
    {
        this.ID = user_id;
        this.Username = username;
        this.Password = password;
        this._balance = balance;
        this.Email = email;
        this.Birthday = birthday;
        this.Joined = joined;
    }

    /// <summary>
    /// Get the user's token balance
    /// </summary>
    public int GetBalance()
    {
        return _balance;
    }

    /// <summary>
    /// Add tokens to the user's balance
    /// </summary>
    /// <param name="amount">The amount of tokens to add</param>
    /// <returns>The user's new balance</returns>
    public int IncreaseBalance(int amount)
    {
        _balance += amount;
        return _balance;
    }

    /// <summary>
    /// Deduct tokens from the user's balance
    /// </summary>
    /// <param name="amount">The amount of tokens to deduct</param>
    /// <returns>The user's new balance</returns>
    /// <exception cref="Exception">Insufficient token balance</exception>
    public int DecreaseBalance(int amount)
    {
        if (_balance < amount)
            throw new Exception("Insufficient token balance");

        _balance -= amount;
        return _balance;
    }

    /// <inheritdoc/>
    public override string ToString()
    {
        return $"ID: {ID}\nUsername: {Username}\nPassword: {Password}\nBalance: {_balance}\nEmail: {Email}\nBirthday: {Birthday}\nJoined: {Joined}";
    }
}
