using System.Net.Mail;
using System.Text.RegularExpressions;

namespace ArcadeLib;

public class UUID
{
    /// <summary>
    /// Pattern: xxxxxxxx-xxxx-4xxx-xxxx-xxxxxxxxxxxx
    /// <br/><br/>
    /// Used to validate the UserID
    /// </summary>
    private static readonly Regex validator = new Regex(@"\A.{8}-.{4}-4.{3}-.{4}-.{12}\Z");

    /// <summary>
    /// UserID
    /// </summary>
    private string _value;
    
    /// <summary>
    /// Validate the given <paramref name="value"/> as a UserID
    /// </summary>
    /// <param name="value">The value to validate</param>
    /// <returns>Boolean indicating whether the given <paramref name="value"/> was a valid UserID</returns>
    private static bool IsValidUserID(string value)
    {
        return validator.IsMatch(value);
    }

    /// <summary>
    /// Initialize a new UserID
    /// </summary>
    /// <param name="value">The ID</param>
    /// <exception cref="ArgumentException">Invalid ID</exception>
    public UUID(string value)
    {
        if (!IsValidUserID(value))
            throw new ArgumentException("Invalid UserID", nameof(value));
        _value = value;
    }

    /// <summary>
    /// Implicitly treat as UserID
    /// </summary>
    public static implicit operator UUID(string value)
    {
        return value == null ? null : new UUID(value);
    }
    
    /// <summary>
    /// Explicity treat as string
    /// </summary>
    public static explicit operator string(UUID UserID)
    {
        return UserID._value;
    }

    /// <inheritdoc/>
    public override string ToString()
    {
        return _value;
    }
}
