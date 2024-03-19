using System.Text.RegularExpressions;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media.Animation;

namespace RockPaperScissors.Pages;

/// <summary>
/// Interaction logic for CreateRoomPage.xaml
/// </summary>
public partial class CreateRoomPage : Page
{
    private System.Windows.Media.Color ButtonInitialColor = System.Windows.Media.Color.FromRgb(255, 240, 240); // Color.Ivory is (255, 240, 240)
    private System.Windows.Media.Color ButtonHoverColor = System.Windows.Media.Color.FromRgb(84, 94, 86); // Color.Ivory is (255, 240, 240)

    public CreateRoomPage()
    {
        InitializeComponent();
    }

    /// <summary>
    /// Listen for the enter key to be pressed and call the PlaceWager function if the input is valid
    /// </summary>
    private void TextBox_KeyDown(object sender, System.Windows.Input.KeyEventArgs e)
    {
        if ((int)e.Key == (int)ConsoleKey.Enter)
        {
            string txt = WagerInputBox.Text.Trim();
            
            if (string.IsNullOrEmpty(txt))
            {
                MessageBox.Show("Please enter a wager amount", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                return;
            }

            if (txt.Contains('.'))
            {
                MessageBox.Show("Wager amount must be a whole number", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                return;
            }

            bool isNumeric = int.TryParse(txt, out int wager);

            if (!isNumeric)
            {
                // Just in case the user bypasses the non-numeric input validation
                MessageBox.Show("Wager amount must be a number", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                return;
            }

            if (wager < 1)
            {
                MessageBox.Show("Wager amount must be greater than 0", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                return;
            }

            PlaceWager(wager);
        }
    }

    /// <summary>
    /// Prevent non-numeric input
    /// </summary>
    private void WagerInputBox_TextChanged(object sender, TextChangedEventArgs e)
    {
        string txt = WagerInputBox.Text;

        // Remove any non-numeric characters using regex
        string numericTxt = Regex.Replace(txt, "[^0-9]", "");
        WagerInputBox.Text = numericTxt;

        // Move the cursor to the end of the text
        WagerInputBox.SelectionStart = WagerInputBox.Text.Length;
    }
    
    /// <summary>
    /// Create the room and navigate to the lobby page
    /// </summary>
    /// <param name="wager">The wager to place on the room</param>
    private void PlaceWager(int wager)
    {
        // Navigate to the lobby page
        ((MainWindow)Application.Current.MainWindow).NavigateToPage(new Pages.LobbyPage());

        // Create a new room with the specified wager
        ArcadeLib.ArcadeServerAPI.CreateRoom(wager, ArcadeLib.Rooms.RoomType.RockPaperScissors);
    }

    /// <summary>
    /// Change the background color of the button on hover
    /// </summary>
    private void Button_MouseEnter(object sender, System.Windows.Input.MouseEventArgs e)
    {
        ColorAnimation ca = new ColorAnimation(ButtonInitialColor, ButtonHoverColor, new Duration(TimeSpan.FromMilliseconds(250)));
        ArcadeLib.WPF.DoBackgroundColorAnimation(ca, (Button)sender);
    }

    /// <summary>
    /// Change the background color fo the button back when hover ends
    /// </summary>
    private void Button_MouseLeave(object sender, System.Windows.Input.MouseEventArgs e)
    {
        ColorAnimation ca = new ColorAnimation(ButtonHoverColor, ButtonInitialColor, new Duration(TimeSpan.FromMilliseconds(250)));
        ArcadeLib.WPF.DoBackgroundColorAnimation(ca, (Button)sender);
    }

    /// <summary>
    /// Remove the default text when the user clicks on the input box. The default text is the character "0"
    /// </summary>
    private void WagerInputBox_GotFocus(object sender, RoutedEventArgs e)
    {
        if (WagerInputBox.Text == "0") WagerInputBox.Text = "";
    }

    /// <summary>
    /// Add the default text back when the user clicks off the input box. The default text is the character "0"
    /// </summary>
    private void WagerInputBox_LostFocus(object sender, RoutedEventArgs e)
    {
        if (string.IsNullOrEmpty(WagerInputBox.Text)) WagerInputBox.Text = "0";
    }
}
