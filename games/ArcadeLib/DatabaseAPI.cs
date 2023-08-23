using Newtonsoft.Json;
using System.Text;

namespace ArcadeLib;

public static class DatabaseAPI
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
    public static async Task<string> Login(string username, string password)
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
        return response_content;
    }
}
