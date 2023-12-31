﻿using Newtonsoft.Json;

/*
 * This class will handle the backend of the Arcade Console Application and Arcade Discord Bot
 */

namespace Arcade
{
    public class Backend
    {
        private static string api_key = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhcGlfa2V5IjoiMDAxYTJmMGItMTY0ZC00MjMzLWIzYTYtNmMzZTYwMTE2ODgzIiwidGVuYW50X2lkIjo1NzgsImp0aV9rZXkiOiIwMzQ5MWEyYS1kOTYxLTExZWMtYWFlMy0wYTU4YTlmZWFjMDIifQ.LgLl0SOLMBZECNfpMjIJgZm4t4Z1-dIwR3XxWR8pDz4";
        private static string api_id = "466";
        private static string api_url = "https://arcadeapp.fireapis.com/userdata/";

        /// <summary>
        /// Get's all userdata under the /userdata endpoint
        /// </summary>
        /// <returns>The JSON response as a <see cref="List{T}"/> of <seealso cref="Dictionary{TKey, TValue}"/></returns>
        public static async Task<List<Dictionary<string, object>>> GetAll()
        {
            using (HttpClient client = new HttpClient())
            {
                client.DefaultRequestHeaders.Add("X-API-ID", api_id);
                client.DefaultRequestHeaders.Add("X-CLIENT-TOKEN", api_key);

                using (HttpResponseMessage response = await client.GetAsync(api_url + "all?page_size=200000&page=1"))
                {
                    response.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/json");
                    using (HttpContent responseContent = response.Content)
                    {
                        string content = await responseContent.ReadAsStringAsync();
                        Dictionary<string, object> _db = JsonConvert.DeserializeObject<Dictionary<string, object>>(content);
                        Newtonsoft.Json.Linq.JArray _data = (Newtonsoft.Json.Linq.JArray)_db["data"];
                        return _data.ToObject<List<Dictionary<string, object>>>();
                    }
                }
            }
        }

        /// <summary>
        /// Get's the userdata corresponding to the given <paramref name="userid"/>
        /// </summary>
        /// <param name="userid"></param>
        /// <returns><see cref="Arcade.User"/></returns>
        public static async Task<User> GetUser(int userid)
        {
            using (HttpClient client = new HttpClient())
            {
                client.DefaultRequestHeaders.Add("X-API-ID", api_id);
                client.DefaultRequestHeaders.Add("X-CLIENT-TOKEN", api_key);

                using (HttpResponseMessage response = await client.GetAsync(api_url + userid))
                {
                    response.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/json");
                    using (HttpContent responseContent = response.Content)
                    {
                        string content = await responseContent.ReadAsStringAsync();
                        Dictionary<string, object> user = JsonConvert.DeserializeObject<Dictionary<string, object>>(content);
                        return new User(Convert.ToInt32(user["id"]), (string)user["username"], (string)user["password"], Convert.ToDouble(user["balance"]));
                    }
                }
            }
        }

        /// <summary>
        /// Find the next available ID in the database
        /// </summary>
        /// <returns><see cref="int"/> ID</returns>
        private static async Task<int> GetNextId()
        {
            List<Dictionary<string, object>> users = await GetAll();

            int greatest_id = 0;
            foreach (Dictionary<string, object> user in users)
            {
                if ((Int64)user["id"] > greatest_id)
                    greatest_id = Convert.ToInt32(user["id"]);
            }

            return greatest_id + 1;
        }

        /// <summary>
        /// Creates a new <see cref="Arcade.User"/>, then posts it to the database</summary>
        /// <param name="username">user name</param>
        /// <param name="password">user password</param>
        /// <param name="balance">user balance</param>
        /// <returns><see cref="Arcade.User"/></returns>
        public static async Task<User> CreateUser(string username, string password, double balance)
        {
            DotAnimation dotAnimation = new DotAnimation(message: "Creating Your Arcade Account", endMessage: "Done!", messageConsoleColor: "cyan", endMessageConsoleColor: "magenta");

            User user = new User(await GetNextId(), username, password, balance);
            HttpContent body = new FormUrlEncodedContent(user.GetAsKVpairs());

            using (HttpClient client = new HttpClient())
            {
                client.DefaultRequestHeaders.Add("X-API-ID", api_id);
                client.DefaultRequestHeaders.Add("X-CLIENT-TOKEN", api_key);

                using (HttpResponseMessage response = await client.PostAsync(api_url, body))
                {
                    response.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/json");
                    using (HttpContent responseContent = response.Content)
                    {
                        string content = await responseContent.ReadAsStringAsync();
                    }

                    Thread.Sleep(1000);
                    dotAnimation.End();
                    Thread.Sleep(500);
                    return user;
                }
            }
        }

        /// <summary>
        /// Updates a <see cref="Arcade.User"/> in the database
        /// </summary>
        /// <param name="user"><see cref="Arcade.User"/></param>
        /// <returns><see cref="Arcade.User"/></returns>
        public static async Task<User> UpdateUser(User user)
        {
            HttpContent body = new FormUrlEncodedContent(user.GetAsKVpairs());

            using (HttpClient client = new HttpClient())
            {
                client.DefaultRequestHeaders.Add("X-API-ID", api_id);
                client.DefaultRequestHeaders.Add("X-CLIENT-TOKEN", api_key);

                using (HttpResponseMessage response = await client.PutAsync(api_url + user.id, body))
                {
                    response.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/json");

                    using (HttpContent responseContent = response.Content)
                    {
                        string content = await responseContent.ReadAsStringAsync();
                    }
                    return user;
                }
            }
        }

        /// <summary>
        /// Checks if the given <see cref="User"/> exists by checking for users with the given <paramref name="username"/> and <paramref name="password"/>
        /// </summary>
        /// <param name="username">The <paramref name="username"/> to look for</param>
        /// <param name="password">The <paramref name="password"/> to look for</param>
        /// <returns>
        /// <see langword="0"/> if there is no <see cref="User"/> that matches the given <paramref name="username"/> and <paramref name="password"/>
        /// <br><br></br></br>
        /// <see cref="User.id"/> if there is a <see cref="User"/> that matches the given <paramref name="username"/> and <paramref name="password"/>
        /// </returns>
        public static async Task<int> DoesUserExist(string username, string password)
        {
            using (HttpClient client = new HttpClient())
            {
                client.DefaultRequestHeaders.Add("X-API-ID", api_id);
                client.DefaultRequestHeaders.Add("X-CLIENT-TOKEN", api_key);
                using (HttpResponseMessage response = await client.GetAsync(api_url + $"?username={username}&password={password}&page_size=1&page=1"))
                {
                    response.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/json");
                    using (HttpContent responseContent = response.Content)
                    {
                        string content = await responseContent.ReadAsStringAsync();
                        Dictionary<string, object> _db = JsonConvert.DeserializeObject<Dictionary<string, object>>(content);
                        Newtonsoft.Json.Linq.JArray _data = (Newtonsoft.Json.Linq.JArray)_db["data"];
                        List<Dictionary<string, object>> users = _data.ToObject<List<Dictionary<string, object>>>();

                        if (users.Count == 0) return 0;                        

                        Dictionary<string, object> user = users[0];
                        return Convert.ToInt32(user["id"]);
                    }
                }
            }
        }

        /// <summary>
        /// Checks if <paramref name="username"/> is available
        /// </summary>
        /// <param name="username"></param>
        /// <returns><see langword="true"/> if the <paramref name="username"/> is available, <see langword="false"/> if <paramref name="username"/> is not available</returns>
        public static async Task<bool> CheckUsernameAvailability(string username)
        {
            using (HttpClient client = new HttpClient())
            {
                client.DefaultRequestHeaders.Add("X-API-ID", api_id);
                client.DefaultRequestHeaders.Add("X-CLIENT-TOKEN", api_key);
                using (HttpResponseMessage response = await client.GetAsync(api_url + $"?username={username}&page_size=1&page=1"))
                {
                    response.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/json");
                    using (HttpContent responseContent = response.Content)
                    {
                        string content = await responseContent.ReadAsStringAsync();
                        Dictionary<string, object> _db = JsonConvert.DeserializeObject<Dictionary<string, object>>(content);
                        Newtonsoft.Json.Linq.JArray _data = (Newtonsoft.Json.Linq.JArray)_db["data"];
                        List<Dictionary<string, object>> users = _data.ToObject<List<Dictionary<string, object>>>();

                        return users.Count == 0; // when users.Count == 0 the name is available
                    }
                }
            }
        }

        private static string dl { get; } = "------------------------------------------------------------------------------------------------------------------------";

        public static void Show_WhereToFindLeaderboardsMessage()
        {
            Console.Clear();
            Arcade.ConsoleColors.Set("cyan");
            Console.Write($"{dl}\n\nArcade has a leaderboard! You can see where you place against all Arcade players at ");
            Arcade.ConsoleColors.Set("magenta");
            Console.WriteLine("https://arcade.mzecheru.com\n");
            Arcade.ConsoleColors.Set("cyan");
            Console.WriteLine($"Do you want to go there now? (y/n): \n\n{dl}");
            Arcade.ConsoleColors.Set("magenta");
            Console.SetCursorPosition(36, 4);
            
            // WhereToFindLeaderboardsMessage asks if the user wants to open the leaderboards url in browser
            bool openInBrowser = ConsoleKey.Y == Console.ReadKey().Key;
            Arcade.ConsoleColors.Reset();
         
            if (openInBrowser)
                System.Diagnostics.Process.Start("explorer", "https://arcade.mzecheru.com");
        }

        public static bool EndGameScene(bool won, double bet, double userBalance, string gameName)
        {
            string phrase;
            if (won)
            {
                Arcade.TrainAnimation.ShowYouWin();
                phrase = $"You won ${bet} with your great {gameName} skills!!!\n\nYou now have ${userBalance} ";
            }
            else
            {
                TrainAnimation.ShowYouLose();
                phrase = $"You lost ${bet} because of your terrible Hi-Lo skills ...\n\nYou now have ${userBalance} ";
            }

            if (userBalance > 500)
                phrase += "T^T";
            else if (userBalance > 300)
                phrase += "^.^";
            else if (userBalance > 100)
                phrase += ":O";
            else
                phrase += ">.<";

            if (userBalance - bet >= 0)
            {   
                Console.Write($"{phrase}\n\nPlay again for ${bet}? (y/n): ");
                return ConsoleKey.Y == Console.ReadKey().Key;
            }
            else
            {
                Console.Write($"{phrase}\n\nYou don't have enough money to play again with a bet of ${bet} (you have ${userBalance}). Press any key to quit");
                Console.ReadKey();
                return false;
            }
        }
    }
}
