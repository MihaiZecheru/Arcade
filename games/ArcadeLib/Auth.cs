using Newtonsoft.Json;
using Spectre.Console;
using System.Diagnostics;
using System.Text;

namespace Arcade;

public class DotLine
{
    public DotLine(ConsoleColor color = ConsoleColor.White)
    {
        AnsiConsole.Write(
            new Text(
                new string('-', Console.BufferWidth) + '\n',
                new Style(color)
            )
        );
    }
}

public static class Auth
{
    private static readonly string ArcadeURL = "http://localhost:3000";
    private static readonly HttpClient client = new HttpClient();
    
    private static readonly FigletText header = new FigletText("Login To Arcade").Centered().Color(ConsoleColor.Blue);
    private static readonly Style BLUE = new Style(ConsoleColor.Blue);
    private static readonly Style GOLD = new Style(Color.Gold1);

    private static bool CursorAtUsername = true;
    private static List<char> Username = new List<char>();
    private static List<char> Password = new List<char>();

    public static string Login()
    {
        UpdateDisplay();
        SetCursorAtUsernamePrompt();
        return MainLoop();
    }

    private static void UpdateDisplay(int cleft = -1)
    {
        Console.Clear();
        AnsiConsole.Write(header);
        Console.Write('\n');
        new DotLine(ConsoleColor.Blue);

        AnsiConsole.Write(new Text("\nUsername: ", BLUE));
        AnsiConsole.Write(new Text(GetUsername() + '\n', GOLD));
        AnsiConsole.Write(new Text("\nPassword: ", BLUE));
        AnsiConsole.Write(new Text(new string('*', Password.Count) + "\n\n", GOLD));

        new DotLine(ConsoleColor.Blue);
        AnsiConsole.Write(
            new Text(
                "\n* Press Enter to login\n" +
                "* Press Tab to switch between fields\n" +
                "* Press Ctrl+R to register if you are new!",
            GOLD)
        );

        if (CursorAtUsername) SetCursorAtUsernamePrompt(cleft);
        else SetCursorAtPasswordPrompt(cleft);
    }

    private static void SetCursorAtUsernamePrompt(int cleft = -1)
    {
        if (cleft == -1) cleft = 10 + Username.Count;
        CursorAtUsername = true;
        Console.SetCursorPosition(cleft, 9);
    }

    private static void SetCursorAtPasswordPrompt(int cleft = -1)
    {
        if (cleft == -1) cleft = 10 + Password.Count;
        CursorAtUsername = false;
        Console.SetCursorPosition(cleft, 11);
    }

    public static string MainLoop()
    {
        while (true)
        {
            ConsoleKeyInfo keyinfo = Console.ReadKey(true);
            bool ctrl = keyinfo.Modifiers == ConsoleModifiers.Control;

            switch (keyinfo.Key)
            {
                case ConsoleKey.Enter:
                    bool login = false;

                    if (CursorAtUsername)
                    {
                        if (Password.Count == 0) SetCursorAtPasswordPrompt();
                        else login = true;
                    }
                    else
                    {
                        if (Password.Count == 0)
                        {
                            SetCursorAtPasswordPrompt(); // do nothing if password is empty
                            break;
                        }
                        else if (Username.Count == 0)
                        {
                            SetCursorAtUsernamePrompt(); // go to username if username is empty
                            break;
                        }
                        else
                        {
                            login = true;
                        }
                    }

                    if (login)
                    {
                        string UserID = AttemptLogin(GetUsername().Trim(), GetPassword()).GetAwaiter().GetResult();
                        
                        // If invalid
                        if (UserID == "User not found" || UserID == "Incorrect password")
                        {
                            // reset screen
                            ShowError("Invalid username or password");
                            Username = new List<char>();
                            Password = new List<char>();
                            UpdateDisplay();
                        }
                        else
                        {
                            // If valid
                            return UserID;
                        }
                    }
                    
                    break;

                case ConsoleKey.Tab:
                    if (CursorAtUsername)
                    {
                        SetCursorAtPasswordPrompt();
                    }
                    else
                    {
                        SetCursorAtUsernamePrompt();
                    }
                    break;

                case ConsoleKey.DownArrow:
                    if (CursorAtUsername)
                    {
                        SetCursorAtPasswordPrompt();
                    }
                    break;

                case ConsoleKey.UpArrow:
                    if (!CursorAtUsername)
                    {
                        SetCursorAtUsernamePrompt();
                    }
                    break;

                case ConsoleKey.LeftArrow:
                    if (ctrl)
                    {
                        // Go to start of line
                        Console.CursorLeft = 10;
                    }

                    if (CursorAtUsername)
                    {
                        if (Console.CursorLeft <= 10) break;
                    }
                    else
                    {
                        if (Console.CursorLeft <= 10) break;
                    }
                    
                    Console.CursorLeft--;

                    break;

                case ConsoleKey.RightArrow:
                    if (ctrl)
                    {
                        // Go to end of line
                        if (CursorAtUsername)
                        {
                            Console.CursorLeft = 10 + Username.Count;
                        }
                        else
                        {
                            Console.CursorLeft = 10 + Password.Count;
                        }
                    }

                    if (CursorAtUsername)
                    {
                        if (Console.CursorLeft >= 10 + Username.Count) break;
                    }
                    else
                    {
                        if (Console.CursorLeft >= 10 + Password.Count) break;
                    }

                    Console.CursorLeft++;
                    break;

                case ConsoleKey.Backspace:
                    if (CursorAtUsername)
                    {
                        if (Username.Count > 0 && Console.CursorLeft > 10)
                        {
                            if (ctrl)
                            {
                                Username.RemoveRange(0, Console.CursorLeft - 10);
                                UpdateDisplay(10);
                            }
                            else
                            {
                                Username.RemoveAt(Console.CursorLeft - 11);
                                UpdateDisplay(Console.CursorLeft - 1);
                            }
                        }
                    }
                    else
                    {
                        if (Password.Count > 0 && Console.CursorLeft > 10)
                        {
                            if (ctrl)
                            {
                                Password.RemoveRange(0, Console.CursorLeft - 10);
                                UpdateDisplay(10);
                            }
                            else
                            {
                                Password.RemoveAt(Console.CursorLeft - 11);
                                UpdateDisplay(Console.CursorLeft - 1);
                            }
                        }
                    }

                    break;

                // Register
                case ConsoleKey.R:
                    if (ctrl)
                    {
                        Register();
                        Username = new List<char>();
                        Password = new List<char>();
                        UpdateDisplay();
                        break;
                    }
                    else
                    {
                        goto default;
                    }

                default:
                    if (keyinfo.Key == ConsoleKey.Tab) break;

                    if (CursorAtUsername)
                    {
                        Username.Insert(Console.CursorLeft - 10, keyinfo.KeyChar);
                    }
                    else
                    {
                        Password.Insert(Console.CursorLeft - 10, keyinfo.KeyChar);
                    }

                    UpdateDisplay(Console.CursorLeft + 1);
                    break;
            }
        }
    }

    private static string GetUsername()
    {
        string u = "";
        Username.ForEach(c => u += c);
        return u;
    }

    private static string GetPassword()
    {
        string p = "";
        Password.ForEach(c => p += c);
        return p;
    }

    private static async Task<string> AttemptLogin(string username, string password)
    {
        string url = $"{ArcadeURL}/api/login";

        var values = new { username, password };
        var json = JsonConvert.SerializeObject(values);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await client.PostAsync(url, content);
        return await response.Content.ReadAsStringAsync();
    }

    private static void Register()
    {
        Process.Start($"{ArcadeURL}/register");
    }

    private static void ShowError(string errorMessage)
    {
        Console.CursorVisible = false;
        Console.Clear();
        new DotLine();
        AnsiConsole.Write(new Text(errorMessage, new Style(ConsoleColor.Red)).Centered());
        new DotLine();

        Console.ReadKey(true);
        Console.CursorVisible = true;
    }
}