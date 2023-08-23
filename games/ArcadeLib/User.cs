namespace ArcadeLib;

public class User
{
    /// <summary>
    /// The user's ID
    /// </summary>
    public ArcadeLib.UserID ID { get; }

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
    public int Balance { get; set; }

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

}
