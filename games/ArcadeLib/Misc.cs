using Spectre.Console;

namespace ArcadeLib;

/// <summary>
/// Miscellaneous methods
/// </summary>
public static class Misc
{
    /// <summary>
    /// Launch the exit sequence for an Arcade game -- clear the console and wait for the enter key to be pressed
    /// </summary>
    public static void WaitOnExit()
    {
        Console.Clear();
        AnsiConsole.Write(TextColor.Gold("* Press ENTER to exit *").Centered());

        while (true)
        {
            ConsoleKeyInfo keyinfo = Console.ReadKey(true);
            if (keyinfo.Key == ConsoleKey.Enter) break;
        }
    }
}
