using System.Windows;
using System.Windows.Controls;

namespace RockPaperScissors;

/// <summary>
/// Interaction logic for MainWindow.xaml
/// </summary>
public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
    }

    public void NavigateToPage(Page page)
    {
        // Navigate to page
        Content = page;
        // Set window title to page title
        Title = page.Title;
    }
}