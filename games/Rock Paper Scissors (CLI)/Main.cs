using ArcadeLib;

namespace RockPaperScissorsCLI;

public class RockPaperScissors
{
    public static void Main(string[] args)
    {
        ArcadeLib.UserID UserID = ArcadeLib.Auth.LoginPrompt();
        ArcadeUser user = ArcadeServerAPI.GetArcadeUserSync(UserID);

        Console.Clear();
        Console.WriteLine(user);
        Console.ReadKey();
    }
}