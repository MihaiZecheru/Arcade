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
    public static readonly ConsoleColor BlueColor = ConsoleColor.Blue;

    /// <summary>
    /// The color gold
    /// </summary>
    public static readonly ConsoleColor GoldColor = Color.Gold1;

    /// <summary>
    /// The color blue as a <see cref="Spectre.Console.Style"/>
    /// </summary>
    private static readonly Style BLUE = new Style(BlueColor);

    /// <summary>
    /// The color gold as a <see cref="Spectre.Console.Style"/>
    /// </summary>
    private static readonly Style GOLD = new Style(GoldColor);

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
