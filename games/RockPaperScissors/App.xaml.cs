using System.Windows;

namespace RockPaperScissors;

/// <summary>
/// Interaction logic for App.xaml
/// </summary>
public partial class App : Application
{
    protected override void OnStartup(StartupEventArgs e)
    {
        base.OnStartup(e);
        RockPaperScissors.MainWindow mainWindow = new();
        mainWindow.NavigateToPage(new Pages.CreateOrJoinRoomPage());
        mainWindow.Show();
    }
}
