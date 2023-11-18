using Newtonsoft.Json;
using System.Text;
using System.Text.RegularExpressions;

namespace ArcadeLib;

public static class ArcadeServerAPI
{
    // TODO: keep adding new games as they're made here
    private static readonly string[] ROOM_TYPES = new string[]{ "rps", "hilo" };
    private static readonly string ArcadeURL = "http://localhost:3000";
    private static readonly HttpClient client = new HttpClient();

    /// <summary>
    /// Log the user in, returning their UserID
    /// </summary>
    /// <param name="username">The user's username</param>
    /// <param name="password">The user's password</param>
    /// <exception cref="Exception">Thrown when the login fails</exception>
    /// <returns>The user's ID</returns>
    public static async Task<ArcadeLib.UUID> Login(string username, string password)
    {
        string url = $"{ArcadeURL}/api/login";

        var values = new { username, password };
        var json = JsonConvert.SerializeObject(values);
        var response = new StringContent(json, Encoding.UTF8, "application/json");

        // Will contain the user's ID if successful or an error message
        var response_content = await (await client.PostAsync(url, response))
            .Content.ReadAsStringAsync();

        if (response_content == "User not found" || response_content == "Incorrect password")
            throw new Exception(response_content);
        return new ArcadeLib.UUID(response_content);
    }

    /// <summary>
    /// Syncronous version of <see cref="Login(string, string)"/>
    /// </summary>
    /// <param name="username">The user's username</param>
    /// <param name="password">The user's password</param>
    /// <exception cref="Exception"Thrown when the login fails></exception>
    /// <returns>The user's ID</returns>
    public static ArcadeLib.UUID LoginSync(string username, string password)
    {
        return Login(username, password).GetAwaiter().GetResult();
    }

    /// <summary>
    /// Get the user with the given <paramref name="UserID"/>'s data
    /// </summary>
    /// <param name="UserID">The user's ID</param>
    /// <exception cref="Exception">Error retrieving user data</exception>
    /// <returns><see cref="ArcadeUser"/> object</returns>
    public static async Task<ArcadeUser> GetArcadeUser(ArcadeLib.UUID UserID)
    {
        string url = $"{ArcadeURL}/api/user/{UserID}";

        try
        {
            var response = await client.GetAsync(url);

            if (response.IsSuccessStatusCode)
            {
                string jsonResponse = await response.Content.ReadAsStringAsync();
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

    /// <summary>
    /// Syncronous version of <see cref="GetArcadeUser(ArcadeLib.UUID)"/>
    /// </summary>
    /// <param name="UserID">The user's ID</param>
    /// <exception cref="Exception">Error retrieving user data</exception>
    /// <returns><see cref="ArcadeUser"/> object</returns>
    public static ArcadeUser GetArcadeUserSync(ArcadeLib.UUID UserID)
    {
        return GetArcadeUser(UserID).GetAwaiter().GetResult();
    }

    public static async Task<List<ArcadeLib.Rooms.RockPaperScissorsRoom>> GetRoomsRPS()
    {
        // TODO: test this
        string url = $"{ArcadeURL}/api/rps/all";

        try
        {
            var response = await client.GetAsync(url);

            if (response.IsSuccessStatusCode)
            {
                string jsonResponse = await response.Content.ReadAsStringAsync();
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
    /// <param name="room_type">The type of the room/the name of the game. Ex: 'rps', 'hilo', etc.</param>
    /// <param name="wager">The bet being placed on the room</param>
    /// <returns>The ID of the room</returns>
    /// <exception cref="Exception">Throws error if <paramref name="room_type"/> is invalid or if there is an internal server error while creating the room</exception>
    public static async Task<ArcadeLib.UUID> CreateRoom(string room_type, int wager)
    {
        if (!ROOM_TYPES.Contains(room_type))
            throw new Exception("Invalid room type");

        string url = $"{ArcadeURL}/api/{room_type}/create";
        var values = new { wager };

        try
        {
            var response = await client.PostAsync(url, new StringContent(JsonConvert.SerializeObject(values), Encoding.UTF8, "application/json"));

            if (response.IsSuccessStatusCode)
            {
                string room_id = await response.Content.ReadAsStringAsync();
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
