using ArcadeLib;
using ArcadeLib.Rooms;

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
        GameLoop();
        ArcadeLib.Misc.WaitOnExit();
    }

    public static void GameLoop()
    {
        ArcadeLib.MenuOption choice = ArcadeLib.PreGame.MainMenu("Rock Paper Scissors");
        
        if (choice == ArcadeLib.MenuOption.PLAY_SOLO)
        {
            int bet = ArcadeLib.PreGame.PlaceBet();
            PlayCPU(bet);
        }
        else if (choice == ArcadeLib.MenuOption.PLAY_MULTIPLAYER)
        {
            // No need to ask for bet because the room comes with a bet already set
            // Note: the user can create a new room from this menu
            ArcadeLib.UUID room_id = ArcadeLib.PreGame.SelectRoom("rps").GetAwaiter().GetResult()
            PlayMultiplayer(room_id);
        }
    }

    public static void PlayCPU(int bet)
    {

    }

    public static void PlayMultiplayer(ArcadeLib.UUID room_id)
    {
        Console.WriteLine(room_id);
    }
}