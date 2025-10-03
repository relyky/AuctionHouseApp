using Microsoft.AspNetCore.Http;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Vista.DB;
using Vista.DB.Schema;
using AuctionHouseApp.Server.Services;
using Microsoft.Data.SqlClient;
using Vista.DbPanda;

namespace AuctionHouseApp.Server.Controllers;

[Route("api/[controller]")]
[ApiController]
public class GiveToWinController(
    ILogger<GiveToWinController> _logger,
    LotteryDrawService _lotterySvc,
    AuthVipService _vipSvc
) : ControllerBase
{
  private readonly object lockObj = new object();

  /// <summary>
  /// 6.1 取得福袋清單
  /// 大螢幕可沿用 → 不管制授權。
  /// </summary>
  /// <returns>
  /// **Response:**
  /// ```json
  /// {
  ///   "success": true,
  ///   "data": {
  ///     "packages": [
  ///       {
  ///         "giftId": "string", // 福袋類型唯一識別碼
  ///         "name": "string", // 福袋名稱
  ///         "description": "string", // 福袋描述
  ///         "image": "string", // 福袋圖片URL
  ///         "value": "string" // 福袋價值
  ///       }
  ///     ]
  ///   }
  /// }
  /// </returns>
  [AllowAnonymous]
  [HttpGet("[action]")]
  public async Task<ActionResult<CommonResult<dynamic>>> Gifts()
  {
    try
    {
      var request = HttpContext.Request;
      string publicWebRoot = $"{request.Scheme}://{request.Host}";

      // 查詢所有商品預覽 (整合 VIP 和員工資訊)
      string sql = """
SELECT * FROM [GivePrize] (NOLOCK)
""";

      using var conn = await DBHelper.AUCDB.OpenAsync();
      var infoList = await conn.QueryAsync<GivePrize>(sql);
      var prizeList = infoList.Select(row => new
      {
        GiftId = row.GiftId,
        Name = row.Name,
        Description = row.Description,
        Image = $"{publicWebRoot}{row.Image}",
        Value = row.Value,
      }).ToArray();

      var result = new CommonResult<dynamic>(
          true,
          new { Packages = prizeList },
          null);

      return Ok(result);
    }
    catch (Exception ex)
    {
      string errMsg = string.Format("Exception！{0}", ex.Message);
      _logger.LogError(ex, errMsg);
      return Ok(new CommonResult<dynamic>(false, null, errMsg));
    }
  }

  /// <summary>
  /// ### 6.2 取得單一福袋詳情
  /// **GET** `/api/givetowin/gifts/{giftId}`
  /// </summary>
  /// <returns>
  /// **Response:**
  /// ```json
  /// {
  ///   "success": true,
  ///   "data": {
  ///     "package": {
  ///       "giftId": "string", // 福袋類型唯一識別碼
  ///       "name": "string", // 福袋名稱
  ///       "description": "string", // 福袋描述
  ///       "image": "string", // 福袋圖片URL
  ///       "value": "string" // 福袋價值
  ///     }
  ///   }
  /// }
  /// ```
  /// </returns>
  [AllowAnonymous]
  [HttpGet("gifts/{giftId}")]
  public async Task<ActionResult<CommonResult<dynamic>>> GetGift(string giftId)
  {
    try
    {
      var request = HttpContext.Request;
      string publicWebRoot = $"{request.Scheme}://{request.Host}";

      // 查詢所有商品預覽 (整合 VIP 和員工資訊)
      string sql = """
SELECT * FROM [GivePrize] (NOLOCK)
WHERE GiftId = @GiftId
""";

      using var conn = await DBHelper.AUCDB.OpenAsync();
      var info = await conn.QueryFirstOrDefaultAsync<GivePrize>(sql, new { GiftId = giftId });

      if (info == null)
        return Ok(new CommonResult<dynamic>(false, null, "商品不存在"));

      var prize = new
      {
        GiftId = info.GiftId,
        Name = info.Name,
        Description = info.Description,
        Image = $"{publicWebRoot}{info.Image}",
        Value = info.Value,
      };

      var result = new CommonResult<dynamic>(
          true,
          new { Package = prize },
          null);

      return Ok(result);
    }
    catch (Exception ex)
    {
      string errMsg = string.Format("Exception！{0}", ex.Message);
      _logger.LogError(ex, errMsg);
      return Ok(new CommonResult<dynamic>(false, null, errMsg));
    }
  }

  /// <summary>
  /// 6.3 取得我的福袋(抽獎券) [須先登入認證]
  /// **GET** `api/givetowin/mytickets/{giftId}`
  /// </summary>
  /// <returns>
  /// **Response:**
  /// ```json
  /// {
  ///   "success": true,
  ///   "data": {
  ///     "tickets": [
  ///       {
  ///         "giftNumber": "string", // 福袋編號
  ///         "purchaseTime": "ISO 8601", //購買時間
  ///         "isWinner": boolean, //是否中獎
  ///       }
  ///     ],
  ///     "totalCount": number
  ///   }
  /// }
  /// ```
  /// </returns>
  [Authorize(AuthenticationSchemes = "Bearer")]
  [HttpGet("[action]/{giftId}")]
  public async Task<ActionResult<CommonResult<dynamic>>> MyTickets(string giftId)
  {
    string paddleNum = _vipSvc.PaddleNum;

    try
    {
      // 查詢所有商品預覽 (整合 VIP 和員工資訊)
      string sql = """
SELECT *
 FROM GiveTicket T (NOLOCK)
WHERE T.GiftId = @GiftId
 AND T.PaddleNum = @PaddleNum
""";

      using var conn = await DBHelper.AUCDB.OpenAsync();
      var infoList = await conn.QueryAsync<GiveTicket>(sql, new { GiftId = giftId, PaddleNum = paddleNum });
      var ticketList = infoList.Select(row => new
      {
        GiveTicketNo = row.GiveTicketNo,
        GiveOrderNo = row.GiveOrderNo,
        GiftId = row.GiftId,
        PaddleNum = row.PaddleNum,
        HolderName = row.HolderName,
      }).ToArray();

      var result = new CommonResult<dynamic>(
          true,
          new { Tickets = ticketList },
          null);

      return Ok(result);
    }
    catch (Exception ex)
    {
      string errMsg = string.Format("Exception！{0}", ex.Message);
      _logger.LogError(ex, errMsg);
      return Ok(new CommonResult<dynamic>(false, null, errMsg));
    }
  }

  /// <summary>
  /// ### 6.4 取得福袋中獎結果。
  /// 也在此時抽獎。
  /// **GET** `/api/givetowin/result/{giftId}`
  /// </summary>
  /// <returns>
  /// **Response:**
  /// ```json
  /// {
  ///   "success": true,
  ///   "data": {
  ///     "giftId": "string", // 福袋類型ID
  ///     "giftName": "string", // 福袋名稱
  ///     "winnerID": "string",  //中獎賓客ID
  ///     "winnerName": "string", // 中獎者姓名
  ///     "giftNumber": "string", // 中獎福袋編號
  ///     "prizeDetails": {
  ///       "name": "string", // 實際獎品名稱
  ///       "value": "string", // 實際獎品價值
  ///       "image": "string" // 實際獎品圖片URL
  ///     },
  ///     "drawTime": "string" // 抽獎時間（ISO 8601）
  ///   }
  /// }
  /// ```
  /// </returns>
  [HttpGet("result/{giftId}")]
  public ActionResult<CommonResult<dynamic>> DrawingResult(string giftId)
  {
    try
    {
      // resource
      var request = HttpContext.Request;
      string publicWebRoot = $"{request.Scheme}://{request.Host}";

      //## 若已抽獎直接回傳結果。
      using var conn = DBHelper.AUCDB.Open();

      GiveWinner? winner = null;
      lock (lockObj)
      {
        //## 進行抽獎
        winner = DoDrawGiveToWin(giftId, conn);
      }

      //## 送回抽獎結果。
      var data = DoGetGiveDrawingResult(winner, publicWebRoot, conn);
      var result = new CommonResult<dynamic>(true, data, null);
      return Ok(result);
    }
    catch (Exception ex)
    {
      string errMsg = string.Format("Exception！{0}", ex.Message);
      _logger.LogError(ex, errMsg);
      return Ok(new CommonResult<dynamic>(false, null, errMsg));
    }
  }

  [NonAction]
  private GiveWinner DoDrawGiveToWin(string giftId, SqlConnection conn)
  {
    string sqlInsertWinner = """
INSERT INTO [dbo].[GiveWinner]
 ([GiftId],[GiveTicketNo],[DrawDtm])
OUTPUT inserted.*
VALUES
 (@GiftId, @GiveTicketNo, GetDate())
""";

    string sqlAliveTickets = """
SELECT GiveTicketNo FROM GiveTicket T
WHERE NOT EXISTS 
(SELECT TOP 1 * FROM GiveWinner W WHERE W.GiveTicketNo = T.GiveTicketNo)
""";

    try
    {
      using var txn = conn.BeginTransaction();
      GiveWinner? winner = conn.GetEx<GiveWinner>(new { GiftId = giftId }, txn);
      if(winner != null)
      {
        //# 已開完獎，獎直接送回結果。
        txn.Commit();
        _logger.LogInformation($"已開完獎 {winner.GiftId}-{winner.GiveTicketNo} 直接送回結果。");
        return winner;
      }

      //# 取得有效且未得獎的抽獎券
      string[] ticketArray = conn.Query<GiveTicket>(sqlAliveTickets, null, txn)
                                 .Select(c => c.GiveTicketNo)
                                 .ToArray();

      //# 進行抽將
      string winTicket = _lotterySvc.DrawOneTicket(ticketArray);

      //# 存入DB
      winner = conn.QueryFirst<GiveWinner>(sqlInsertWinner, new { GiftId = giftId, GiveTicketNo = winTicket },txn);

      //# SUCCESS
      txn.Commit();
      _logger.LogInformation($"完成開獎 {winner.GiftId}-{winner.GiveTicketNo} 送回結果。");
      return winner;
    }
    catch(Exception ex)
    {
      throw new ApplicationException("DoDrawGiveToWin fail!", ex);
    }
  }

  /// <summary>
  /// helper: 取得福袋中獎結果。
  /// </summary>
  [NonAction]
  private dynamic DoGetGiveDrawingResult(GiveWinner winner, string publicWebRoot, SqlConnection conn)
  {
    // ※ 執行此動作需先確認已完成抽獎了。
    string sql = """
SELECT W.GiftId
 ,W.GiveTicketNo
 ,W.DrawDtm
 ,GiftName = P.[Name]
 ,[Value] = P.[Value]
 ,[Image] = P.[Image]
 ,WinnerID = T.PaddleNum
 ,WinnerName = V.VipName
FROM [GiveWinner] W (NOLOCK)
INNER JOIN GivePrize P (NOLOCK) ON W.GiftId = P.GiftId
INNER JOIN GiveTicket T (NOLOCK) ON W.GiveTicketNo = T.GiveTicketNo
INNER JOIN Vip V (NOLOCK) ON T.PaddleNum = V.PaddleNum
WHERE W.GiftId = @GiftId AND W.GiveTicketNo = @GiveTicketNo;
""";

    var info = conn.QueryFirst(sql, new { winner.GiftId, winner.GiveTicketNo });
    return new
    {
      giftId = info.GiftId,     // 福袋類型ID
      giftName = info.GiftName, // 福袋名稱
      winnerID = info.WinnerID, // 中獎賓客ID
      winnerName = info.WinnerName,   // 中獎者姓名
      giftNumber = info.GiveTicketNo, // 中獎福袋編號
      drawTime = info.DrawDtm,        // 抽獎時間（ISO 8601）
      prizeDetails = new
      {
        name = info.GiftName, // 實際獎品名稱
        value = info.Value,   // 實際獎品價值
        image = $"{publicWebRoot}{info.Image}", // 實際獎品圖片URL
      },
    };
  }
}
