using ArcadeLib;

namespace RockPaperScissorsCLI;

public class RockPaperScissors
{
    public static void Main(string[] args)
    {
        ArcadeLib.UserID User_ID = ArcadeLib.Auth.LoginPrompt();
        ArcadeUser user = ArcadeServerAPI.GetArcadeUserSync(User_ID);

        Console.Clear();
        Console.WriteLine(user);
        Console.ReadKey();
    }
}