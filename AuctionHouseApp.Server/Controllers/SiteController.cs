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
      //# 六個活動八種螢幕：liveAuction | openAsk | raffleDrawing | rafflePrizeDisplay | raffleWinnersCarousel | silentAuction | give | donation;
      string sql = """
UPDATE [LiveSession] SET StringValue = @mode WHERE StateName = 'DisplayCurrentMode';
UPDATE [LiveSession] SET StringValue = @itemId WHERE StateName = 'DisplayCurrentItemId';
""";

      // 'raffle' :== 'raffleWinnersCarousel' 
      if (mode == "raffle")
        mode = "raffleWinnersCarousel";

      //# 若 mode 不屬於8種之一。不處理。
      string[] modes = ["liveAuction", "openAsk", "raffleDrawing", "rafflePrizeDisplay", "raffleWinnersCarousel", "silentAuction", "give", "donation"];
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
}
