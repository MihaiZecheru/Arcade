namespace RockPaperScissorsCLI;

public class RockPaperScissors
{
    public static void Main(string[] args)
    {
        string UserID = ArcadeLib.Auth.Login();
        Console.Clear();
        Console.WriteLine(UserID);
        Console.ReadKey();
    }
}