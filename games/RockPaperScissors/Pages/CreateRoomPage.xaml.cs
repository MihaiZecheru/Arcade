using System.Windows;
using System.Windows.Controls;

namespace RockPaperScissors.Pages;

/// <summary>
/// Interaction logic for CreateRoomPage.xaml
/// </summary>
public partial class CreateRoomPage : Page
{
    public CreateRoomPage()
    {
        InitializeComponent();
    }

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

        // Prevent non-numeric input
        if (!char.IsDigit((char)e.Key))
        {
            e.Handled = true;
        }
    }

    private void PlaceWager(int wager)
    {
        // Create a new room with the specified wager
        ArcadeLib.ArcadeServerAPI.CreateRoom(wager, ArcadeLib.Rooms.RoomType.RockPaperScissors);
        

        // Navigate to the lobby page
        NavigationService.Navigate(new LobbyPage());
    }
}
