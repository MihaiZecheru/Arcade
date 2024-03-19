using Newtonsoft.Json;
using System.Text;
using System.Net.Http;

namespace ArcadeLib;

public static class ArcadeServerAPI
{
    private static readonly string ArcadeURL = "http://localhost:3000";
    private static readonly HttpClient client = new HttpClient();

    /// <summary>
    /// Log the user in, returning their UserID
    /// </summary>
    /// <param name="username">The user's username</param>
    /// <param name="password">The user's password</param>
    /// <exception cref="Exception">Thrown when the login fails</exception>
    /// <returns>The user's ID</returns>
    public static ArcadeLib.UUID Login(string username, string password)
    {
        string url = $"{ArcadeURL}/api/login";

        var values = new { username, password };
        var json = JsonConvert.SerializeObject(values);
        var response = new StringContent(json, Encoding.UTF8, "application/json");

        // Will contain the user's ID if successful or an error message
        var response_content = client.PostAsync(url, response).Result.Content.ReadAsStringAsync().Result;

        if (response_content == "User not found" || response_content == "Incorrect password")
            throw new Exception(response_content);
        return new ArcadeLib.UUID(response_content);
    }

    /// <summary>
    /// Get the user with the given <paramref name="UserID"/>'s data
    /// </summary>
    /// <param name="UserID">The user's ID</param>
    /// <exception cref="Exception">Error retrieving user data</exception>
    /// <returns><see cref="ArcadeUser"/> object</returns>
    public static ArcadeUser GetArcadeUser(ArcadeLib.UUID UserID)
    {
        string url = $"{ArcadeURL}/api/user/{UserID}";

        try
        {
            var response = client.GetAsync(url).Result;

            if (response.IsSuccessStatusCode)
            {
                string jsonResponse = response.Content.ReadAsStringAsync().Result;
                return (ArcadeUser)JsonConvert.DeserializeObject<ArcadeUser>(jsonResponse)!;
            }
            else
            {
                throw new Exception("Error retrieving user data");
            }
        }
        catch
        {
            throw new Exception("Error retrieving user data");
        }
    }

    public static List<ArcadeLib.Rooms.RockPaperScissorsRoom> GetRoomsRockPaperScissors()
    {
        // TODO: test this
        string url = $"{ArcadeURL}/api/rps/all";

        try
        {
            var response = client.GetAsync(url).Result;

            if (response.IsSuccessStatusCode)
            {
                string jsonResponse = response.Content.ReadAsStringAsync().Result;
                return JsonConvert.DeserializeObject<List<ArcadeLib.Rooms.RockPaperScissorsRoom>>(jsonResponse)!;
            }
            else
            {
                throw new Exception("Error retrieving active rooms");
            }
        }
        catch
        {
            throw new Exception("Error retrieving active rooms");
        }
    }

    /// <summary>
    /// Create a new room
    /// </summary>
    /// <param name="wager">The bet being placed on the room</param>
    /// <param name="room_type">The type of the room, i.e the name of the game. RoomType is an Enum. Ex: RoomType.RockPaperScissors.</param>
    /// <returns>The ID of the room</returns>
    /// <exception cref="Exception">Throws error if <paramref name="room_type"/> is invalid or if there is an internal server error while creating the room</exception>
    public static ArcadeLib.UUID CreateRoom(int wager, ArcadeLib.Rooms.RoomType room_type)
    {
        string url = $"{ArcadeURL}/api/{room_type}/create";
        var values = new { wager };

        try
        {
            var response = client.PostAsync(url, new StringContent(JsonConvert.SerializeObject(values), Encoding.UTF8, "application/json")).Result;

            if (response.IsSuccessStatusCode)
            {
                string room_id = response.Content.ReadAsStringAsync().Result;
                if (!ArcadeLib.UUID.Valid(room_id)) throw new Exception();
                return new ArcadeLib.UUID(room_id);
            }
            else
            {
                throw new Exception();
            }
        }
        catch
        {
            throw new Exception("Error creating room");
        }
    }
}
