using AuctionHouseTpl.Server.DTO;
using AuctionHouseTpl.Server.Filters;
using AuctionHouseTpl.Server.Services;
using Dapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using Vista.DB;
using Vista.DB.Schema;
using Vista.DbPanda;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace AuctionHouseTpl.Server.Controllers;

/// <summary>
/// 拍賣官Biz
/// </summary>
[TypeFilter(typeof(CatchAndLogFilter))]
[Route("api/[controller]")]
[ApiController]
public class AuctionController(
  ILogger<BidderController> _logger,
  LiveAuctionStatusService _liveSvc
  ) : ControllerBase
{
  [HttpPost("[action]")]
  public ActionResult<IEnumerable<LotProfile>> QryLotProfileList()
  {
    using var conn = DBHelper.AUCDB.Open();
    var profileList = conn.Query<LotProfile>($"SELECT [LotNo],[LotTitle] FROM [Lot] WHERE [Status]='Checked' ")
                          .AsList();
    return Ok(profileList);
  }

  [HttpPost("[action]/{LotNo}")]
  public ActionResult<Lot> GetLot(string LotNo)
  {
    using var conn = DBHelper.AUCDB.Open();
    var lot = conn.GetEx<Lot>(new { LotNo });
    if (lot == null)
    {
      //※ 錯誤一律以 400 BadRequest 傳回錯誤訊息。
      return BadRequest("查無資料。");
    }
    return Ok(lot);
  }

  [HttpPost("[action]/{id}")]
  public ActionResult SelectLotForBidding(string id)
  {
    _liveSvc.SelectLotForBidding(id);
    return Ok();
  }

  [HttpPost("[action]")]
  public ActionResult<string> LockLotForBidding()
  {
    string msg = _liveSvc.LockLotForBidding();

    //※ 錯誤一律以 400 BadRequest 傳回錯誤訊息。
    if (msg != "SUCCESS") return BadRequest(msg);

    _logger.LogInformation("LockLotForBidding");
    return Ok(msg);
  }

  [HttpPost("[action]")]
  public ActionResult<string> UnlockLot()
  {
    string msg = _liveSvc.UnlockLot();

    //※ 錯誤一律以 400 BadRequest 傳回錯誤訊息。
    if (msg != "SUCCESS") return BadRequest(msg);
    return Ok(msg);
  }

  [HttpPost("[action]")]
  public ActionResult<string> SetCurBidPrice([FromForm] decimal curBidPrice)
  {
    string msg = _liveSvc.SetCurBidPrice(curBidPrice);

    //※ 錯誤一律以 400 BadRequest 傳回錯誤訊息。
    if (msg != "SUCCESS") return BadRequest(msg);
    return Ok(msg);
  }

  [HttpPost("[action]")]
  public ActionResult<string> SetBidIncrement([FromForm] decimal bidInc)
  {
    string msg = _liveSvc.SetBidIncrement(bidInc);

    //※ 錯誤一律以 400 BadRequest 傳回錯誤訊息。
    if (msg != "SUCCESS") return BadRequest(msg);
    return Ok(msg);
  }

  [HttpPost("[action]")]
  public ActionResult<string> StartBidding()
  {
    string msg = _liveSvc.StartBidding();

    //※ 錯誤一律以 400 BadRequest 傳回錯誤訊息。
    if (msg != "SUCCESS") return BadRequest(msg);
    return Ok(msg);
  }

  [HttpPost("[action]")]
  public ActionResult<string> StopBidding()
  {
    string msg = _liveSvc.StopBidding();

    //※ 錯誤一律以 400 BadRequest 傳回錯誤訊息。
    if (msg != "SUCCESS") return BadRequest(msg);
    return Ok(msg);
  }

  [HttpPost("[action]/{BidOpenSn}")]
  public ActionResult<IEnumerable<BiddingEvent>> QryBiddingEventList(int BidOpenSn)
  {
    string sql = """
SELECT * FROM [BiddingEvent] WHERE BidOpenSn = @BidOpenSn;
""";

    using var conn = DBHelper.AUCDB.Open();
    var infoList = conn.Query<BiddingEvent>(sql, new { BidOpenSn });
    return Ok(infoList);
  }

  [HttpPost("[action]/{LotNo}/{BidOpenSn}/{BiddingSn}")]
  public ActionResult<BiddingEvent> ToggleBiddingEventValid(string LotNo, int BidOpenSn, int BiddingSn)
  {
    string sql = """
SELECT COUNT(*)
  FROM [BiddingEvent]
  WHERE BidOpenSn = @BidOpenSn
    AND IsValid = 'Y'
""";

    using var conn = DBHelper.AUCDB.Open();
    using var txn = conn.BeginTransaction();

    int validCount = conn.ExecuteScalar<int>(sql, new { BidOpenSn }, txn);

    var info = conn.GetEx<BiddingEvent>(new { BiddingSn, LotNo, BidOpenSn }, txn);
    info.IsValid = info.IsValid == "Y" ? "N" : "Y";

    // 同一輪開啟的競價只能一筆有效。
    if (info.IsValid == "Y" && validCount > 0)
      return BadRequest("同一輪競價只能一筆有效。先先取消原有效競價");

    conn.UpdateEx<BiddingEvent>(info, new { BiddingSn, LotNo, BidOpenSn }, txn);
    txn.Commit();

    _liveSvc.NotifyUiBiddingEventUpdate();

    return Ok(info);
  }

  [HttpPost("[action]/{LotNo}/{BidOpenSn}/{BiddingSn}")]
  public ActionResult<string> HammerBiddingEvent(string LotNo, int BidOpenSn, int BiddingSn, [FromQuery] string act)
  {
    if (act != "sold" && act != "unsold") return BadRequest("格式錯誤！");

    using var conn = DBHelper.AUCDB.Open();
    using var txn = conn.BeginTransaction();

    var bid = conn.GetEx<BiddingEvent>(new { BiddingSn, LotNo, BidOpenSn, IsValid = "Y" }, txn);
    if (bid == null) return BadRequest("查無相應出價！");

    var hammer = new HammeredRecord
    {
      LotNo = bid.LotNo,
      BidResult = act == "sold" ? "Hammered" : "Passed",
      WinnerNo = act == "sold" ? bid.BidderNo : null!,
      HammerPrice = act == "sold" ? bid.BidPrice : null,
      BiddingSn = act == "sold" ? bid.BiddingSn : null,
      HammerTime = DateTime.Now,
    };

    conn.InsertEx<HammeredRecord>(hammer, txn);
    txn.Commit();

    _liveSvc.UpdateHammered();
    //_liveSvc.NotifyUiBiddingEventUpdate();

    return Ok("SUCCESS");
  }

  [HttpPost("[action]/{LotNo}")]
  public ActionResult<string> HammerLotPassed(string LotNo)
  {
    using var conn = DBHelper.AUCDB.Open();
    using var txn = conn.BeginTransaction();

    var hammer = new HammeredRecord
    {
      LotNo = LotNo,
      BidResult = "Passed",
      WinnerNo = null!,
      HammerPrice = null,
      BiddingSn = null,
      HammerTime = DateTime.Now,
    };

    conn.InsertEx<HammeredRecord>(hammer, txn);
    txn.Commit();

    _liveSvc.UpdateHammered();
    //_liveSvc.NotifyUiBiddingEventUpdate();

    return Ok("SUCCESS");
  }

  [HttpPost("[action]")]
  public ActionResult<string> NextLotForBidding()
  {
    string msg = _liveSvc.NextLotForBidding();

    //※ 錯誤一律以 400 BadRequest 傳回錯誤訊息。
    if (msg != "SUCCESS") return BadRequest(msg);
    return Ok(msg);
  }

  [HttpPost("[action]")]
  public ActionResult<string> PrepareNextBidding()
  {
    string msg = _liveSvc.PrepareNextBidding();

    //※ 錯誤一律以 400 BadRequest 傳回錯誤訊息。
    if (msg != "SUCCESS") return BadRequest(msg);
    return Ok(msg);
  }
}
