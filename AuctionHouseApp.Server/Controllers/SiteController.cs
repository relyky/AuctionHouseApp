using AuctionHouseApp.Server.Models;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Serilog.Core;
using Vista.DB;
using Vista.DB.Schema;

namespace AuctionHouseApp.Server.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class SiteController : ControllerBase
{
  readonly object _lockObj = new object();

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
    txn.Commit();
    return Ok(info);
  }

  /// <summary>
  /// OpenAsk - 現在回合
  /// </summary>
  [HttpPost("[action]")]
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

  /// <summary>
  /// OpenAsk - 認捐輸入
  /// </summary>
  [HttpPost("[action]")]
  public async Task<ActionResult<MsgObj>> OpenAskEntry([FromBody] AskInputDto args)
  {
    string sql = """
DECLARE @Now DATETIME = GetDate();

INSERT INTO [dbo].[OpenAskEntry]
  ([Round],[Amount],[PaddleNum],[RecordStaff],[RecordDtm])
VALUES
  (@Round,@Amount,@PaddleNum,@RecordStaff,@Now);
  
MERGE INTO [dbo].[OpenAskRecord] AS tgt
USING (
  SELECT TOP 1 tgt2.Ssn, V.PaddleNum,V.VipName,
    [Round]=@Round,[Amount]=@Amount,[RecordStaff]=@RecordStaff,[Now]=@Now
  FROM VIP V
  OUTER APPLY (
    SELECT TOP 1 Ssn FROM [dbo].[OpenAskRecord]
     WHERE [Round] = @Round AND [PaddleNum] = @PaddleNum 
	   AND [RecordStaff1] != @RecordStaff
	   AND [Status] = 'Pending'
  ) tgt2
  WHERE V.PaddleNum = @PaddleNum
 ) AS src
 ON tgt.Ssn = src.Ssn
WHEN MATCHED 
THEN
  UPDATE SET 
    [RecordStaff2] = src.[RecordStaff],
    [RecordDtm2] = src.[Now],
	[Status] = 'Confirmed'
WHEN NOT MATCHED
THEN
  INSERT ([Round],[PaddleNum],[PaddleName],[Amount],[RecordStaff1],[RecordDtm1],[Status],[HasPaid])
  VALUES ([Round],[PaddleNum],[VipName],[Amount],[RecordStaff],[Now],'Pending','N'); 
""";

    try
    {
      var param = new {
        Round = args.Round,
        Amount = args.Amount,
        PaddleNum = args.PaddleNum,
        RecordStaff = HttpContext.User.Identity?.Name
      };

      using var conn = await DBHelper.AUCDB.OpenAsync();
      using var txn = await conn.BeginTransactionAsync();
      conn.Execute(sql, param, txn);
      await txn.CommitAsync();
      return Ok(new MsgObj($"Round {param.Round} #{param.PaddleNum} has sent.", Severity: "success"));
    }
    catch (Exception ex)
    {
      return BadRequest("Exception！" + ex.Message);
    }
  }
}
