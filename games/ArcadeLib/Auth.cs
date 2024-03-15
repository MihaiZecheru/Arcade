using Spectre.Console;
using System.Diagnostics;
using System.Net;
using System.Net.Sockets;
using System.Reflection;
using System.Text;
using System.Windows;
using System.IO;

namespace ArcadeLib;

/// <summary>
/// User authentification - login screen
/// </summary>
public static class Auth
{
    /// <summary>
    /// Header for the login screen
    /// </summary>
    private static readonly FigletText header = new FigletText("Login To Arcade").Centered().Color(ConsoleColor.Blue);

    /// <summary>
    /// Indicates whether or not the cursor is currently at the username prompt
    /// </summary>
    private static bool CursorAtUsername = true;

    /// <summary>
    /// Used to keep track of the characters the user has entered in the username field
    /// </summary>
    private static List<char> Username = new List<char>();

    /// <summary>
    /// Used to keep track of the characters the user has entered in the password field
    /// </summary>
    private static List<char> Password = new List<char>();

    /// <summary>
    /// Return the user's login information (username and password) if there is a saved login that is valid. To be valid, the login must have been saved on the same day
    /// </summary>
    /// <returns>A <see cref="Tuple{T1, T2}"/> containing the user's saved username and password</returns>
    public static Tuple<string, string>? TryGetLoginInfo()
    {
        if (!File.Exists("user-login.txt")) return null; // no saved login info if the file does not exist
        string[] raw_user = File.ReadAllLines("user-login.txt");
        string username = raw_user[0].Split(':')[1];
        string password = raw_user[1].Split(':')[1];
        string login_date = raw_user[2].Split(':')[1];
        // the login is not valid if it was saved on a different day
        if (login_date != DateTime.Now.ToString("MM/dd/yyyy")) return null;
        return new Tuple<string, string>(username, password);
    }

    /// <summary>
    /// Save the user's login info to a file to prevent having to login every time the user wants to play. The login should be valid only for the day it was saved
    /// </summary>
    /// <param name="user">The user to save</param>
    public static void SaveUserLogin(ArcadeLib.ArcadeUser user)
    {
        File.WriteAllText("user-login.txt", $"username:{user.Username}\npassword:{user.Password}\nlogin_date:{DateTime.Now.ToString("MM/dd/yyyy")}");
    }

    /// <summary>
    /// Open a new console window and run the LoginPopup app, which will prompt the user to login and return the user's UUID by writing it to the output stream.
    /// The UUID is then read from the output stream and returned from this function. Use this function to prompt the user to login in a new window,
    /// for example from a GUI/WPF game window that doesn't have a console
    /// </summary>
    /// <returns>The logged-in user's UUID</returns>
    public static ArcadeLib.UUID? LoginOnNewConsoleWindow()
    {
        try
        {
            IPAddress ipAddress = IPAddress.Parse("127.0.0.1");
            TcpListener server = new TcpListener(ipAddress, 3056);
            server.Start();

            // Get the directory where the assembly called this function is located
            string assemblyPath = Assembly.GetExecutingAssembly().Location;
            string assemblyDirectory = Path.GetDirectoryName(assemblyPath)!;
            string loginPromptAppPath = @"Z:\main\programming\Arcade\games\LoginClient\bin\Debug\net6.0\LoginClient.exe";

            if (!File.Exists(loginPromptAppPath)) return null;

            ProcessStartInfo startInfo = new ProcessStartInfo(loginPromptAppPath);
            startInfo.UseShellExecute = false;

            using (Process process = Process.Start(startInfo))
            {
                if (process == null) return null; // Error

                // Connect to the client
                TcpClient client = server.AcceptTcpClient();
                NetworkStream stream = client.GetStream();

                // Receive the message from the client
                byte[] data = new byte[256];
                StringBuilder receivedData = new StringBuilder();
                int bytes = 0;
                do
                {
                    bytes = stream.Read(data, 0, data.Length);
                    receivedData.Append(Encoding.ASCII.GetString(data, 0, bytes));
                } while (stream.DataAvailable);

                client.Close();
                return new ArcadeLib.UUID(receivedData.ToString());
            }
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// Handle the entire login process in the current console window and return the logged-in <see cref="ArcadeLib.ArcadeUser"/>
    /// <br/><br/>
    /// This method calls all three login-related functions and cleans up after itself by clearing the console to end the login process
    /// </summary>
    /// <returns>The logged-in <see cref="ArcadeLib.ArcadeUser"/></returns>
    public static ArcadeLib.ArcadeUser ShowLogin()
    {
        Tuple<string, string>? _result = TryGetLoginInfo();
        if (_result != null)
        {
            string username = _result.Item1;
            string password = _result.Item2;
            ArcadeLib.UUID _user_id = ArcadeServerAPI.Login(username, password);
            return ArcadeServerAPI.GetArcadeUser(_user_id);
        }

        ArcadeLib.UUID UserID = ArcadeLib.Auth.LoginPrompt();
        ArcadeLib.ArcadeUser user = ArcadeServerAPI.GetArcadeUser(UserID);
        ArcadeLib.Auth.LoginComplete(user.Username);
        ArcadeLib.Auth.SaveUserLogin(user);
        return user;
    }

    /// <summary>
    /// Handle the entire login process in the current console window and set the "out" variable <paramref name="user"/> to the logged-in <see cref="ArcadeLib.ArcadeUser"/>
    /// <br/><br/>
    /// This method calls all three login-related functions and cleans up after itself by clearing the console to end the login process
    /// </summary>
    /// <param name="user">The variable to save the user to</param>
    public static void ShowLogin(out ArcadeLib.ArcadeUser user)
    {
        Tuple<string, string>? saved_login = TryGetLoginInfo();
        
        // Ask the user to login. He must input his username and password
        if (saved_login == null)
        {
            ArcadeLib.UUID UserID = ArcadeLib.Auth.LoginPrompt();
            user = ArcadeServerAPI.GetArcadeUser(UserID); // set the "out" variable to the logged-in user
            ArcadeLib.Auth.LoginComplete(user.Username);
            ArcadeLib.Auth.SaveUserLogin(user);
        }
        // Get the users saved login info and log him in
        else
        {
            string username = saved_login.Item1;
            string password = saved_login.Item2;
            ArcadeLib.UUID _user_id = ArcadeServerAPI.Login(username, password);
            user = ArcadeServerAPI.GetArcadeUser(_user_id); // set the "out" variable to the logged-in user
        }
    }

    /// <summary>
    /// Prompt the user for his login
    /// </summary>
    /// <returns>The user's ID</returns>
    public static ArcadeLib.UUID LoginPrompt()
    {
        UpdateDisplay();
        SetCursorAtUsernamePrompt();
        return AuthLoop(); // Returns the user's ID
    }

    /// <summary>
    /// Update the screen -- will show the characters the user has entered. 
    /// To be called each time the user makes a change to what he's entered
    /// </summary>
    /// <param name="cleft">What to set Console.CursorLeft to, will default to 10, which is at the beginning of the username/password prompt</param>
    private static void UpdateDisplay(int cleft = -1)
    {
        Console.Clear();
        AnsiConsole.Write(header);
        Console.Write('\n');
        new DotLine(ConsoleColor.Blue);

        AnsiConsole.Write(TextColor.Blue("\nUsername: "));
        AnsiConsole.Write(TextColor.Gold(GetUsername() + '\n'));
        AnsiConsole.Write(TextColor.Blue("\nPassword: "));
        AnsiConsole.Write(TextColor.Gold(new string('*', Password.Count) + "\n\n"));

        new DotLine(TextColor.BlueColor);
        AnsiConsole.Write(
            TextColor.Gold("\n" +
                "* Press Enter to login\n" +
                "* Press Tab to switch between fields\n" +
                "* Press Ctrl+R to register if you are new!"
            )
        );

        if (CursorAtUsername) SetCursorAtUsernamePrompt(cleft);
        else SetCursorAtPasswordPrompt(cleft);
    }

    /// <summary>
    /// Set the cursor on the line with the username prompt
    /// </summary>
    /// <param name="cleft">What to set Console.CursorLeft to, will default to 10, which is at the beginning of the username/password prompt</param>
    private static void SetCursorAtUsernamePrompt(int cleft = -1)
    {
        if (cleft == -1) cleft = 10 + Username.Count;
        CursorAtUsername = true;
        Console.SetCursorPosition(cleft, 9);
    }

    /// <summary>
    /// Set the cursor on the line with the password prompt
    /// </summary>
    /// <param name="cleft">What to set Console.CursorLeft to, will default to 10, which is at the beginning of the username/password prompt</param>
    private static void SetCursorAtPasswordPrompt(int cleft = -1)
    {
        if (cleft == -1) cleft = 10 + Password.Count;
        CursorAtUsername = false;
        Console.SetCursorPosition(cleft, 11);
    }

    /// <summary>
    /// The 'MainLoop' for the login screen -- will capture key events and update the screen accordingly
    /// </summary>
    /// <returns>The logged-in user's ID</returns>
    private static ArcadeLib.UUID AuthLoop()
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
                        try
                        {
                            ArcadeLib.UUID UserID = ArcadeServerAPI.Login(GetUsername().Trim(), GetPassword());
                            return UserID; // If the login was successful, return the UserID
                        }
                        catch (Exception e)
                        {
                            // If the server is not online, exit the program
                            if (e.Message.StartsWith("No connection could be made because the target machine actively refused it."))
                            {
                                ShowError("Could not connect to the server - the server may be offline");
                                Environment.Exit(0);
                            }

                            // If the login was invalid, reset the screen
                            ShowError("Invalid username or password");
                            Username = new List<char>();
                            Password = new List<char>();
                            SetCursorAtUsernamePrompt();
                            UpdateDisplay();
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

    /// <summary>
    /// Get the inputted username as a string from <see cref="Username"/> char array
    /// </summary>
    /// <returns>The inputted username as a string</returns>
    private static string GetUsername()
    {
        return new string(Username.ToArray());
    }

    /// <summary>
    /// Get the inputted password as a string from <see cref="Password"/> char array
    /// </summary>
    /// <returns>The inputted password as a string</returns>
    private static string GetPassword()
    {
        return new string(Password.ToArray());
    }

    /// <summary>
    /// Send the user to the registration page on the website. The user cannot register from the console.
    /// </summary>
    private static void Register()
    {
        Process.Start("http://localhost:3000/register");
    }

    /// <summary>
    /// Display an error message -- usually used if the user's login was invalid
    /// </summary>
    /// <param name="errorMessage">The error message to display</param>
    private static void ShowError(string errorMessage)
    {
        Misc.HideCursor();
        Console.Clear();
        new DotLine();
        AnsiConsole.Write(new Text(errorMessage, new Spectre.Console.Style(ConsoleColor.Red)).Centered());
        new DotLine();

        Console.ReadKey(true);
        Misc.ShowCursor();
    }

    /// <summary>
    /// Welcome the user once the login is complete and clear the screen when finished to prepare for the game
    /// </summary>
    /// <param name="username">The name of the user that has logged in</param>
    private static void LoginComplete(string username)
    {
        // Welcome the user
        Console.Clear();
        new DotLine(ArcadeLib.TextColor.BlueColor);
        AnsiConsole.Write(ArcadeLib.TextColor.Gold($"Welcome, {username}").Centered());
        new DotLine(ArcadeLib.TextColor.BlueColor);
        
        // Clear the used variables so the user's login information is not stored
        Password = null;
        Username = null;

        // Display the welcome message for 1.5 seconds before clearing. The welcome message will close if the user presses the enter key
        ArcadeLib.Misc.DelayWithBreak(1500);
        Console.Clear(); // Cleanup: the screen will be ready for the game to begin
    }

    /// <summary>
    /// Handle the login process for WPF applications/games. This method will check if the user has a saved login, and if not, it will prompt the user to login using the LoginClient app.
    /// The LoginClient app will open in a separate terminal screen, kind of like a popup, and prompt the user to login. When he does, his UserID will be sent by socket back to this function.
    /// The user's data will be retrieved from the database using his UserID, then saved to a file and returned.
    /// </summary>
    /// <param name="window">The WPF window calling this function</param>
    /// <returns>The logged-in user</returns>
    public static ArcadeLib.ArcadeUser HandleLoginWPF(System.Windows.Window window)
    {
        Tuple<string, string>? saved_login = ArcadeLib.Auth.TryGetLoginInfo();

        if (saved_login == null)
        {
            ArcadeLib.UUID? user_id = ArcadeLib.Auth.LoginOnNewConsoleWindow();

            if (user_id == null)
            {
                System.Windows.MessageBox.Show(window, "Login attempt was unsuccessful. Exiting now...", "Login Failed", MessageBoxButton.OK, MessageBoxImage.Error);
                Environment.Exit(1);
            }

            ArcadeLib.ArcadeUser user = ArcadeLib.ArcadeServerAPI.GetArcadeUser(user_id!);
            ArcadeLib.Auth.SaveUserLogin(user);
            return user;
        }
        else
        {
            ArcadeLib.UUID user_id = ArcadeLib.ArcadeServerAPI.Login(saved_login.Item1, saved_login.Item2);
            return ArcadeLib.ArcadeServerAPI.GetArcadeUser(user_id);
        }
    }
}