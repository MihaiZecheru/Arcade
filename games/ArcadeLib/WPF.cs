using System.Windows;
using System.Windows.Media.Animation;

namespace ArcadeLib;

public static class WPF
{
    public static void DoBackgroundColorAnimation(System.Windows.Media.Animation.ColorAnimation ca, System.Windows.Controls.Control element)
    {
        Storyboard.SetTarget(ca, element);
        Storyboard.SetTargetProperty(ca, new PropertyPath("Background.Color"));
        Storyboard stb = new Storyboard();
        stb.Children.Add(ca);
        stb.Begin();
    }
}
