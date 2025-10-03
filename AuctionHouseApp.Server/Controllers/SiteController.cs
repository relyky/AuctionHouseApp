using AuctionHouseApp.Server.Models;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Vista.DB;
using Vista.DB.Schema;

namespace AuctionHouseApp.Server.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class SiteController : ControllerBase
{
  [HttpPost("[action]/{mode}/{itemId?}")]
  public ActionResult<MsgObj> SwitchDisplay(string mode, string? itemId)
  {
    try
    {
      //# 六個活動九種螢幕：silentAuction | liveAuction | openAsk | raffleDrawing | rafflePrizeDisplay | raffleWinnersCarousel | give | giveDrawing | donation;
      string sql = """
UPDATE [LiveSession] SET StringValue = @mode WHERE StateName = 'DisplayCurrentMode';
UPDATE [LiveSession] SET StringValue = @itemId WHERE StateName = 'DisplayCurrentItemId';
""";

      // 'raffle' :== 'raffleWinnersCarousel' 
      if (mode == "raffle")
        mode = "raffleWinnersCarousel";

      //# 若 mode 不屬於9種之一。不處理。
      string[] modes = ["liveAuction", "openAsk", "raffleDrawing", "rafflePrizeDisplay", "raffleWinnersCarousel", "silentAuction", "give", "giveDrawing", "donation"];
      if (!modes.Contains(mode))
        return new MsgObj("SUCCESS");

      //# GO
      using var conn = DBHelper.AUCDB.Open();
      using var txn = conn.BeginTransaction();
      conn.Execute(sql, new { mode, itemId }, txn);
      txn.Commit();

      // SUCCESS
      return Ok(new MsgObj("SUCCESS"));
    }
    catch (Exception ex)
    {
      return BadRequest("Exception！" + ex.Message);
    }
  }

  [HttpPost("[action]/{onOff}")]
  public ActionResult<MsgObj> DonationSwitch(string onOff)
  {
    try
    {
      string sql = """
UPDATE LiveSession
 SET StringValue = @onOff
 OUTPUT inserted.*
 WHERE StateName = 'DonationSwitch'
""";

      if (onOff != "on") onOff = "off";

      using var conn = DBHelper.AUCDB.Open();
      using var txn = conn.BeginTransaction();
      var info = conn.QueryFirst<LiveSession>(sql, new { onOff }, txn);
      txn.Commit();

      return Ok(new MsgObj(info.StringValue));
    }
    catch (Exception ex)
    {
      return BadRequest("Exception！" + ex.Message);
    }
  }

  [HttpPost("[action]")]
  public async Task<ActionResult<MsgObj>> GetDonationSwitch()
  {
    string sql = """
SELECT TOP 1 * 
FROM LiveSession (NOLOCK)
WHERE StateName = 'DonationSwitch'
""";

    using var conn = await DBHelper.AUCDB.OpenAsync();
    var info = await conn.QueryFirstAsync<LiveSession>(sql);
    return Ok(new MsgObj(info.StringValue));
  }

  /// <summary>
  /// OpenAsk - 建立新回合
  /// </summary>
  [HttpPost("[action]/{amount}")]
  public ActionResult<OpenAskRound> OpenAskNewRound(decimal amount)
  {
    // --關閉現有的，建立新一輪。
    string sql = """
UPDATE [OpenAskRound] SET [IsActive] = 'N';
WITH NewRound (RoundNo) AS 
 (SELECT RoundNo = IsNull(MAX([Round]),0)+1 FROM [OpenAskRound])
INSERT INTO [dbo].[OpenAskRound] 
 ([Round],[Amount],[IsActive])
 OUTPUT inserted.*
SELECT 
 RoundNo, @Amount, 'Y'
 FROM NewRound;
""";

    using var conn = DBHelper.AUCDB.Open();
    using var txn = conn.BeginTransaction();
    var info = conn.QueryFirst<OpenAskRound>(sql, new { Amount = amount }, txn);
    return Ok(info);
  }

  /// <summary>
  /// OpenAsk - 現在回合
  /// </summary>
  [HttpPost("[action]/{amount}")]
  public async Task<ActionResult<OpenAskRound?>> OpenAskCurrentRound()
  {
    // --關閉現有的，建立新一輪。
    string sql = """
SELECT TOP 1 * 
 FROM [OpenAskRound] (NOLOCK)
 WHERE IsActive = 'Y'
 ORDER BY [Round] DESC;
""";

    using var conn = await DBHelper.AUCDB.OpenAsync();
    var info = await conn.QueryFirstOrDefaultAsync<OpenAskRound>(sql);
    return Ok(info);
  }

}
