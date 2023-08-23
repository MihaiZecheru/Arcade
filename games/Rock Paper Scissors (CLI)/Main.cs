namespace RockPaperScissorsCLI;

public class RockPaperScissors
{
    public static void Main(string[] args)
    {
        ArcadeLib.UserID UserID = ArcadeLib.Auth.LoginPrompt();
        
        Console.Clear();
        Console.WriteLine(UserID);
        Console.ReadKey();
    }
}