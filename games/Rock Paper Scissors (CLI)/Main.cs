using ArcadeLib;

namespace RockPaperScissorsCLI;

public static class RockPaperScissors
{
    /// <summary>
    /// The user playing the game
    /// </summary>
    private static ArcadeUser User { get; set; }

    /// <summary>
    /// For CPU moves
    /// </summary>
    private static readonly Random random = new Random();

    public static void Main(string[] args)
    {
        ArcadeLib.UserID User_ID = ArcadeLib.Auth.LoginPrompt();
        User = ArcadeServerAPI.GetArcadeUserSync(User_ID);
        ArcadeLib.Auth.LoginComplete(User.Username);


        ArcadeLib.Misc.WaitOnExit();
    }
}