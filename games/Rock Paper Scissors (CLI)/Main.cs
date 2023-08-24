using ArcadeLib;

namespace RockPaperScissorsCLI;

public static class RockPaperScissors
{
    /// <summary>
    /// The user playing the game
    /// </summary>
    private static ArcadeUser User;

    /// <summary>
    /// For CPU moves
    /// </summary>
    private static readonly Random random = new Random();

    public static void Main(string[] args)
    {
        ArcadeLib.Auth.Login(out User);
        ArcadeLib.Misc.WaitOnExit();
    }
}