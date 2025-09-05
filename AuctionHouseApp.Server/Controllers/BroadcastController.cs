using AuctionHouseTpl.Server.DTO;
using AuctionHouseTpl.Server.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Vista.DB;
using Vista.DB.Schema;
using Dapper;

namespace AuctionHouseTpl.Server.Controllers;

/// <summary>
/// 拍賣廣播Biz
/// 所有拍賣相關的廣播訊息都在這裡處理。
/// 所有訊息都必需來自 LiveAuctionStatusService。
/// </summary>
[Route("api/[controller]")]
[ApiController]
public class BroadcastController(
  ILogger<BroadcastController> _logger,
  LiveAuctionStatusService _liveSvc
  ) : ControllerBase
{

  /// <summary>
  /// 注意１：串流回應不要包裝成 Task。也不要用 ActionResult<T> 回應。
  /// 注意２：也需搭配 yield return 語法。
  /// 設定 ResponseCache 禁用快取（避免前端快取干擾串流）。
  /// </summary>
  [HttpPost("[action]")]
  [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
  public async IAsyncEnumerable<LiveAuctionStatus> RequestLiveAuctionStream()
  {
    uint lastRowversion = 0; // 上次回應版次

    while (!ControllerContext.HttpContext.RequestAborted.IsCancellationRequested)
    {
      // 狀態有變更時才回傳。
      if (_liveSvc.LiveStatus.Rowversion != lastRowversion)
      {
        yield return _liveSvc.LiveStatus; // 回傳目前狀態

        lastRowversion = _liveSvc.LiveStatus.Rowversion; // 更新版次
        _logger.LogTrace("RequestLiveAuctionStream yield return → {lastRowversion}", lastRowversion);
      }

      //# next round
      //await Task.Yield();
      //await Task.Delay(997); // 稍等一段時間以免系統過載
      await Task.Delay(97); // 稍等一段時間以免系統過載
    }

    yield break; // 正常結束串流
  }

  /// <summary>
  /// 注意１：串流回應不要包裝成 Task。也不要用 ActionResult<T> 回應。
  /// 注意２：也需搭配 yield return 語法。
  /// 設定 ResponseCache 禁用快取（避免前端快取干擾串流）。
  /// </summary>
  /// <param name="baseBiddingSn">上次回應序號</param>
  [HttpPost("[action]/{baseBiddingSn}")]
  [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
  public async IAsyncEnumerable<BiddingEvent> RequestBiddingEventStream(int baseBiddingSn)
  {
    while (!ControllerContext.HttpContext.RequestAborted.IsCancellationRequested)
    {
      while(_liveSvc.BroadcastBiddingEventBubble.TryDequeue(out var bidEvent))
      {
        yield return bidEvent; // 回傳目前狀態
        _logger.LogTrace("RequestBiddingEventStream yield return → {BidderNo} {BiddingSn}", bidEvent.BidderNo, bidEvent.BiddingSn);

        if (bidEvent.BiddingSn > baseBiddingSn)
          baseBiddingSn = bidEvent.BiddingSn; // 更新版次

        //await Task.Delay(29); // 稍等一段時間以免系統過載
      }

      //# next round
      //await Task.Yield();
      //await Task.Delay(997); // 稍等一段時間以免系統過載
      await Task.Delay(97); // 稍等一段時間以免系統過載
    }

    yield break; // 正常結束串流
  }

  [HttpPost("[action]/{baseBiddingSn}")]
  public async Task<ActionResult<IEnumerable<BiddingEvent>>> QryBiddingEvent(int BaseBiddingSn)
  {
    //每次查詢只回傳 10 筆資料。
    string sql = """
SELECT TOP 10 * FROM BiddingEvent (NOLOCK)
WHERE BiddingSn > @BaseBiddingSn
ORDER BY BiddingSn ASC
""";

    using var conn = await DBHelper.AUCDB.OpenAsync();
    var infoList = await conn.QueryAsync<BiddingEvent>(sql, new { BaseBiddingSn });
    return Ok(infoList);
  }

  /// <summary>
  /// 查詢拍品有效競價列表。
  /// </summary>
  [HttpPost("[action]/{LotNo}")]
  public async Task<ActionResult<IEnumerable<BiddingEvent>>> QryLotValidBiddingList(string LotNo)
  {
    //每次查詢只回傳 10 筆資料。
    string sql = """
SELECT * FROM [BiddingEvent]
WHERE LotNo = @LotNo
AND IsValid = 'Y'
""";

    using var conn = await DBHelper.AUCDB.OpenAsync();
    var infoList = await conn.QueryAsync<BiddingEvent>(sql, new { LotNo });
    return Ok(infoList);
  }

  /// <summary>
  /// 取最後認可的有效出價。GetLotLastValidBid
  /// </summary>
  [HttpPost("[action]/{LotNo}")]
  public async Task<ActionResult<BiddingEvent?>> GetLotLastValidBid(string LotNo)
  {
    string sql = """
SELECT TOP 1 * FROM [BiddingEvent]
WHERE LotNo = @LotNo
AND IsValid = 'Y'
ORDER BY BiddingSn DESC
""";

    using var conn = await DBHelper.AUCDB.OpenAsync();
    var info = await conn.QueryFirstOrDefaultAsync<BiddingEvent>(sql, new { LotNo });
    return Ok(info);
  }

  /// <summary>
  /// 取最後認可的有效出價。GetLotLastValidBid
  /// </summary>
  [HttpPost("[action]/{LotNo}")]
  public async Task<ActionResult<HammeredRecord?>> GetLotHammeredRecord(string LotNo)
  {
    string sql = """
SELECT TOP 1 * FROM [HammeredRecord]
WHERE LotNo = @LotNo
""";

    using var conn = await DBHelper.AUCDB.OpenAsync();
    var info = await conn.QueryFirstOrDefaultAsync<HammeredRecord>(sql, new { LotNo });
    return Ok(info);
  }
}
