using Vista.DB;

namespace AuctionHouseApp.Server.Services;

/// <summary>
/// 抽獎服務
/// </summary>
public class LotteryDrawService : IDisposable
{
  private readonly FisherYatesLottery _lottery;
  private bool _disposed = false;

  public LotteryDrawService()
  {
    _lottery = new FisherYatesLottery();
  }

  public string[] DrawTicket(string[] ticketArray, int winnerCount)
  {
    ObjectDisposedException.ThrowIf(_disposed, this);

    // 先洗牌5次
    for (int round = 0; round < 5; round++)
      _lottery.SecureShuffle(ticketArray);

    // 再抽取中獎者
    return _lottery.DrawLottery(ticketArray, winnerCount, useSecureRandom: true);
  }

  public string DrawOneTicket(string[] ticketArray)
  {
    ObjectDisposedException.ThrowIf(_disposed, this);

    // 先洗牌5次
    for (int round = 0; round < 5; round++)
      _lottery.SecureShuffle(ticketArray);

    // 再抽取中獎者
    var winnerArray = _lottery.DrawLottery(ticketArray, 1, useSecureRandom: true);
    return winnerArray[0];
  }

  public void Dispose()
  {
    Dispose(true);
    GC.SuppressFinalize(this);
  }

  protected virtual void Dispose(bool disposing)
  {
    if (!_disposed)
    {
      if (disposing)
      {
        _lottery.Dispose();
      }
      _disposed = true;
    }
  }
}
