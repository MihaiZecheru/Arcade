using Spectre.Console;

namespace ArcadeLib;

/// <summary>
/// Create a dotted line that spans the console horizontally
/// </summary>
public class DotLine
{
    /// <summary>
    /// Create a dotted line that spans the console horizontally
    /// </summary>
    /// <param name="color">The color to make the line</param>
    public DotLine(ConsoleColor color = ConsoleColor.White)
    {
        AnsiConsole.Write(
            new Text(new string('-', Console.BufferWidth) + '\n', new Style(color))
        );
    }
}