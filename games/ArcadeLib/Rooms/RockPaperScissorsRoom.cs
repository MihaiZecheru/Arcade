using Newtonsoft.Json;

namespace ArcadeLib.Rooms;

public class RockPaperScissorsRoom : IRoom
{
    public static async Task<List<IRoom>> GetRooms()
    {
        return await ArcadeServerAPI.GetRoomRPS();
    }
}
