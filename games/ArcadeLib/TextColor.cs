using Spectre.Console;

namespace ArcadeLib;

/// <summary>
/// Make coloring text easier
/// </summary>
public static class TextColor
{
    /// <summary>
    /// The color blue
    /// </summary>
    private static readonly Style BLUE = new Style(ConsoleColor.Blue);

    /// <summary>
    /// The color gold
    /// </summary>
    private static readonly Style GOLD = new Style(Color.Gold1);

    /// <summary>
    /// Color the given <paramref name="text"/> blue
    /// </summary>
    /// <param name="text">The text to color blue</param>
    /// <returns>A <see cref="Spectre.Console.Text"/> object</returns>
    public static Spectre.Console.Text Blue(string text)
    {
        return new Text(text, BLUE);
    }

    /// <summary>
    /// Color the given <paramref name="text"/> gold
    /// </summary>
    /// <param name="text">The text to color gold</param>
    /// <returns>A <see cref="Spectre.Console.Text"/> object</returns>
    public static Spectre.Console.Text Gold(string text)
    {
        return new Text(text, GOLD);
    }
}
