using System.Windows;
using System.Windows.Controls;
using System.Windows.Media.Animation;

namespace RockPaperScissors.Pages;

/// <summary>
/// Interaction logic for Pages/RoomSelectionPage.xaml
/// </summary>
public partial class CreateOrJoinRoomPage : Page
{
    private System.Windows.Media.Color CreateRoomBtnColor = System.Windows.Media.Color.FromRgb(60, 179, 113); // Color.MediumSeaGreen is (60, 179, 113)
    private System.Windows.Media.Color CreateRoomBtnHoverColor = System.Windows.Media.Color.FromRgb(70, 189, 133); // Custom color, slightly lighter than MediumSeaGreen
    
    private System.Windows.Media.Color JoinRoomBtnColor = System.Windows.Media.Color.FromRgb(245, 245, 220); // Color.Beige is (245, 245, 220)
    private System.Windows.Media.Color JoinRoomBtnHoverColor = System.Windows.Media.Color.FromRgb(255, 255, 240); // Color.Ivory is (255, 255, 240)

    public CreateOrJoinRoomPage()
    {
        InitializeComponent();
    }

    /// <summary>
    /// Go to CreateRoompage
    /// </summary>
    private void CreateRoom_Click(object sender, System.Windows.RoutedEventArgs e)
    {
        ((MainWindow)Application.Current.MainWindow).NavigateToPage(new Pages.CreateRoomPage());
    }

    /// <summary>
    /// Go to JoinRoomPage
    /// </summary>
    private void JoinRoom_Click(object sender, System.Windows.RoutedEventArgs e)
    {
        ((MainWindow)Application.Current.MainWindow).NavigateToPage(new Pages.JoinRoomPage());
    }

    /// <summary>
    /// Change the color of the button on hover. Make it slightly ligther.
    /// </summary>
    private void CreateRoomBtn_MouseEnter(object sender, System.Windows.Input.MouseEventArgs e)
    {
        ColorAnimation ca = new ColorAnimation(CreateRoomBtnColor, CreateRoomBtnHoverColor, new Duration(TimeSpan.FromMilliseconds(250)));
        ArcadeLib.WPF.DoBackgroundColorAnimation(ca, CreateRoomBtn);
    }

    /// <summary>
    /// Change the color of the button when mouse stops hovering. Return to original color.
    /// </summary>
    private void CreateRoomBtn_MouseLeave(object sender, System.Windows.Input.MouseEventArgs e)
    {
        ColorAnimation ca = new ColorAnimation(CreateRoomBtnHoverColor, CreateRoomBtnColor, new Duration(TimeSpan.FromMilliseconds(250)));
        ArcadeLib.WPF.DoBackgroundColorAnimation(ca, CreateRoomBtn);
    }

    /// <summary>
    /// Change the color of the button on hover. Make it slightly ligther.
    /// </summary>
    private void JoinRoomBtn_MouseEnter(object sender, System.Windows.Input.MouseEventArgs e)
    {
        ColorAnimation ca = new ColorAnimation(JoinRoomBtnColor, JoinRoomBtnHoverColor, new Duration(TimeSpan.FromMilliseconds(250)));
        ArcadeLib.WPF.DoBackgroundColorAnimation(ca, JoinRoomBtn);
    }

    /// <summary>
    /// Change the color of the button when mouse stops hovering. Return to original color.
    /// </summary>
    private void JoinRoomBtn_MouseLeave(object sender, System.Windows.Input.MouseEventArgs e)
    {
        ColorAnimation ca = new ColorAnimation(JoinRoomBtnHoverColor, JoinRoomBtnColor, new Duration(TimeSpan.FromMilliseconds(250)));
        ArcadeLib.WPF.DoBackgroundColorAnimation(ca, JoinRoomBtn);
    }
}
