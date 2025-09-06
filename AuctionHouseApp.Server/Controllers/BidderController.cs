using AuctionHouseApp.Server.DTO;
using AuctionHouseApp.Server.Services;
using Dapper;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using Vista.DB;
using Vista.DB.Schema;
using Vista.DbPanda;

namespace AuctionHouseApp.Server.Controllers;

/// <summary>
/// 競標者Biz
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class BidderController(
  ILogger<BidderController> _logger,
  LiveAuctionStatusService _liveSvc
  ) : ControllerBase
{
  [HttpPost("[action]/{BidderNo}")]
  public ActionResult<Bidder> GetBidder(string BidderNo)
  {
    using var conn = DBHelper.AUCDB.Open();
    var bidder = conn.GetEx<Bidder>(new { BidderNo });
    if (bidder == null)
    {
      //※ 錯誤一律以 400 BadRequest 傳回錯誤訊息。
      return BadRequest("查無資料。");
    }
    return Ok(bidder);
  }

  [HttpPost("[action]")]
  public ActionResult<LiveAuctionStatus> GetLiveAuctionStatus()
  {
    return _liveSvc.LiveStatus;
  }

  [HttpPost("[action]")]
  public ActionResult<string> SubmitBid(BidMsg bidMsg)
  {
    string sql = """
INSERT INTO [BiddingEvent] ([LotNo], [BidderNo], [BidPrice], [IsValid], [BidOpenSn], [BidTimestamp])
OUTPUT INSERTED.*
VALUES (@LotNo, @BidderNo, @BidPrice, 'N', @BidOpenSn, GETDATE());
""";

    using var conn = DBHelper.AUCDB.Open();
    using var txn = conn.BeginTransaction();
    var bidEvent = conn.QuerySingle<BiddingEvent>(sql, bidMsg, txn);
    txn.Commit();

    // 用來產生即時競標狀態(訊息泡泡)。※停用中
    //_liveSvc.BroadcastBiddingEventBubble.Enqueue(bidEvent);
    //_logger.LogTrace("BroadcastBiddingEventBubble.Enqueue ← {BidderNo} {BiddingSn}", bidEvent.BidderNo, bidEvent.BiddingSn);

    _logger.LogDebug("SubmitBid {BiddingSn}", bidEvent.BiddingSn);
    return Ok("SUCCESS");
  }

}
