using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;

using ArcadeLib;

namespace ArcadeRockPaperScissors
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        private ArcadeLib.ArcadeUser User = null;
        private Image selected = null;

        public MainWindow()
        {
            User = ArcadeLib.Auth.HandleLoginWPF(this);
            InitializeComponent();
        }

        private void MoveUpBy50(Image img)
        {
            Thickness margin = img.Margin;
            margin.Top -= 50;
            img.Margin = margin;
        }

        private void MoveDownBy50(Image img)
        {
            Thickness margin = img.Margin;
            margin.Top += 50;
            img.Margin = margin;
        }

        private void Select(Image img)
        {
            if (this.selected != null) Unselect(this.selected);
            this.selected = img;
            MoveUpBy50(img);
        }

        private void Unselect(Image img)
        {
            MoveDownBy50(img);
            this.selected = null;
        }

        private void RockClick(object sender, RoutedEventArgs e)
        {
            if (this.selected == rock)
                Unselect(rock);
            else
                Select(rock);
        }

        private void PaperClick(object sender, RoutedEventArgs e)
        {
            if (this.selected == paper)
                Unselect(paper);
            else
                Select(paper);
        }

        private void ScissorsClick(object sender, RoutedEventArgs e)
        {
            if (this.selected == scissors)
                Unselect(scissors);
            else
                Select(scissors);
        }

        private void shoot_btn_Click(object sender, RoutedEventArgs e)
        {
            string move = this.selected.Name;
            //SendMove(move); // TODO: 
            //string response = GetResponse();
        }
    }
}
