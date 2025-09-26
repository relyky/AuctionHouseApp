using Vista.DB;

namespace AuctionHouseApp.Server.Services;

/// <summary>
/// 抽獎服務
/// </summary>
public class LotteryDrawService
{
  public string[] DrawRaffleTicket()
  {
    using var lottery = new FisherYatesLottery();
    //lottery.SecureShuffle();
    //lottery.DrawLottery();

    throw new NotImplementedException();
  }
}
