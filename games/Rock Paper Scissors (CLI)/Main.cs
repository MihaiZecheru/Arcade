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
        ArcadeLib.MenuOption choice = ArcadeLib.GameLoop.MainMenu("Rock Paper Scissors");
        
        if (choice == ArcadeLib.MenuOption.PLAY_SOLO)
        {
            int bet = ArcadeLib.GameLoop.PlaceBet();
            PlayCPU(bet);
        }
        else if (choice == ArcadeLib.MenuOption.PLAY_MULTIPLAYER)
        {
            // No need to ask for bet because the room comes with a bet already set
            ArcadeLib.Rooms.RockPaperScissorsRoom room = ArcadeLib.GameLoop.RoomMenuGetRoom();
            PlayMultiplayer(room);
        }
    }

    public static void PlayCPU(int bet)
    {

    }

    public static void PlayMultiplayer(ArcadeLib.Rooms.RockPaperScissorsRoom room)
    {

    }
}