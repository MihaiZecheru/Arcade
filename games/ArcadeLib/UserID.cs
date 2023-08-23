using System.Net.Mail;
using System.Text.RegularExpressions;

namespace ArcadeLib;

internal class UserID
{
    /// <summary>
    /// Pattern: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    /// <br/><br/>
    /// Used to validate the UserID
    /// </summary>
    private static readonly Regex validator = new Regex(@"^{8}-{4}-4{3}-y{3}-{12}$");

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
    public UserID(string value)
    {
        if (!IsValidUserID(value))
            throw new ArgumentException("Invalid UserID", nameof(value));
        _value = value;
    }

    /// <inheritdoc/>
    public static implicit operator UserID(string value)
    {
        return value == null ? null : new UserID(value);
    }

    /// <inheritdoc/>
    public override string ToString()
    {
        return _value;
    }
}
