﻿using ArcadeLib.Rooms;
using Newtonsoft.Json;
using System.Text;

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
}
