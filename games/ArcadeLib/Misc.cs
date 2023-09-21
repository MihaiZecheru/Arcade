using Spectre.Console;

namespace ArcadeLib;

/// <summary>
/// Miscellaneous methods
/// </summary>
public static class Misc
{
    /// <summary>
    /// Hide the cursor in the console window
    /// </summary>
    public static void ShowCursor()
    {
        Console.CursorVisible = true;
    }

    /// <summary>
    /// Hide the cursorin the console window
    /// </summary>
    public static void HideCursor()
    {
        Console.CursorVisible = false;
    }

    /// <summary>
    /// Toggle cursor visibility in the console window
    /// </summary>
    public static void ToggleCursor()
    {
        Console.CursorVisible = !Console.CursorVisible;
    }

    /// <summary>
    /// Launch the exit sequence for an Arcade game -- clear the console and wait for the enter key to be pressed
    /// </summary>
    public static void WaitOnExit()
    {
        Console.Clear();
        AnsiConsole.Write(TextColor.Gold("* Press ENTER to exit *").Centered());

        HideCursor();
        while (true)
        {
            ConsoleKeyInfo keyinfo = Console.ReadKey(true);
            if (keyinfo.Key == ConsoleKey.Enter) break;
        }
        ShowCursor();
    }

    /// <summary>
    /// Set a delay for <paramref name="ms"/> milliseconds, with the option to break out of the delay on Enter keypress
    /// </summary>
    /// <param name="ms">The amount of milliseconds to delay for</param>
    public static void DelayWithBreak(int ms)
    {
        if (ms < 10) throw new Exception("Delay must be at least 10 milliseconds");

        DateTime startTime = DateTime.Now;
        while ((DateTime.Now - startTime).TotalMilliseconds < ms)
        {
            if (Console.KeyAvailable)
            {
                // Break out of the delay on Enter keypress
                if (Console.ReadKey(true).Key == ConsoleKey.Enter) break;
            }

            Thread.Sleep(10);
        }
    }
}
