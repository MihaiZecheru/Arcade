using Arcade;

namespace RockPaperScissorsCLI;

public class RockPaperScissors
{
    public static void Main(string[] args)
    {
        string UserID = Arcade.Auth.Login();
        Console.Clear();
        Console.WriteLine(UserID);
        Console.ReadKey();
    }
}