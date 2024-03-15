using System;
using ArcadeLib;
using System.Net;
using System.Net.Sockets;
using System.Text;

namespace LoginClient;

class Program
{
    static void Main()
    {
        TcpClient client = ConnectSocket();
        ArcadeLib.UUID user_id = ArcadeLib.Auth.LoginPrompt();
        if (user_id == null) return;

        // Login successful; send the UserID over websocket, to be picked up by whatever game called this program
        SendUserID(client, user_id!);
        client.Close();
    }

    static TcpClient ConnectSocket()
    {
        IPAddress ipAddress = IPAddress.Parse("127.0.0.1");
        TcpClient client = new TcpClient();
        client.Connect(ipAddress, 3056);
        return client;
    }

    static void SendUserID(TcpClient client, ArcadeLib.UUID user_id)
    {
        NetworkStream stream = client.GetStream();
        byte[] data = Encoding.ASCII.GetBytes(user_id.ToString());
        stream.Write(data, 0, data.Length);
    }
}