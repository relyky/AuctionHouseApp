using AuctionHouseApp.Server.Services;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Vista.DB;
using Vista.DB.Schema;
using Vista.DbPanda;

namespace AuctionHouseApp.Server.Controllers;

[Route("api/[controller]")]
[ApiController]
public class RaffleTicketController(
    ILogger<RaffleTicketController> _logger,
    LotteryDrawService _lotterySvc,
    AuthVipService _vipSvc
) : ControllerBase
{
  private readonly object lockObj = new object();

  /// <summary>
  /// ### 5.1 取得獎品清單
  /// 大螢幕可沿用 → 不管制授權。
  /// </summary>
  /// <returns>
  /// ** Response:**
  /// ```json
  /// {
  ///   "success": true,
  ///   "data": {
  ///     "prizes": [
  ///       {
  ///         "prizeId": "string", //獎品ID
  ///         "name": "string", //獎品名稱
  ///         "description": "string", //獎品描述
  ///         "image": "string", //獎品圖片URL
  ///         "value": "string", //獎品價值
  ///         "category": "major" | "minor" //大獎或小獎分類
  ///       }
  ///     ]
  ///   }
  /// }
  /// </returns> 
  [AllowAnonymous]
  [HttpGet("[action]")]
  public async Task<ActionResult<CommonResult<dynamic>>> Prizes()
  {
    try
    {
      var request = HttpContext.Request;
      string publicWebRoot = $"{request.Scheme}://{request.Host}";

      // 查詢所有商品預覽 (整合 VIP 和員工資訊)
      string sql = """
SELECT * FROM [RafflePrize] (NOLOCK)
""";

      using var conn = await DBHelper.AUCDB.OpenAsync();
      var infoList = await conn.QueryAsync<RafflePrize>(sql);
      var prizeList = infoList.Select(row => new
      {
        PrizeId = row.PrizeId,
        Name = row.Name,
        Description = row.Description,
        Image = $"{publicWebRoot}{row.Image}",
        Value = row.Value,
        Category = row.Category
      }).ToArray();

      var result = new CommonResult<dynamic>(
          true,
          new { Prizes = prizeList },
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
  /// 5.2 取得指定獎品詳情
  /// 大螢幕可沿用 → 不管制授權。
  /// </summary>
  /// <returns>
  ///  **Response:**
  /// ```json
  /// {
  ///   "success": true,
  ///   "data": {
  ///     "prize": {
  ///       "prizeId": "string", //獎品ID
  ///       "name": "string", //獎品名稱
  ///       "description": "string", //獎品描述
  ///       "image": "string", //獎品圖片URL
  ///       "value": "string", //獎品價值
  ///       "category": "major" | "minor" //大獎或小獎分類
  ///     }
  ///   }
  /// }
  /// ``` 
  /// </returns>
  [AllowAnonymous]
  [HttpGet("prizes/{prizeId}")]
  public async Task<ActionResult<CommonResult<dynamic>>> PrizesItem(string prizeId)
  {
    try
    {
      var request = HttpContext.Request;
      string publicWebRoot = $"{request.Scheme}://{request.Host}";

      // 查詢所有商品預覽 (整合 VIP 和員工資訊)
      string sql = """
SELECT * FROM [RafflePrize] (NOLOCK)
WHERE PrizeId = @PrizeId
""";

      using var conn = await DBHelper.AUCDB.OpenAsync();
      var info = await conn.QueryFirstOrDefaultAsync<RafflePrize>(sql, new { PrizeId = prizeId });

      if (info == null)
        return Ok(new CommonResult<dynamic>(false, null, "商品不存在"));

      var prize = new
      {
        PrizeId = info.PrizeId,
        Name = info.Name,
        Description = info.Description,
        Image = $"{publicWebRoot}{info.Image}",
        Value = info.Value,
        Category = info.Category
      };

      var result = new CommonResult<dynamic>(
          true,
          new { Prize = prize },
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
  /// 5.3 取得我的票券
  /// **GET** `api/raffleticket/mytickets`
  /// </summary>
  /// <returns>
  /// **Headers:**
  /// - `Authorization: Bearer {token}`
  /// ** Response:**
  /// ```json
  /// {
  ///   "success": true,
  ///   "data": {
  ///     "tickets": [
  ///       {
  ///         "ticketNumber": "string", //票券ID
  ///         "purchaseTime": "ISO 8601", //購買時間
  ///         "isWinner": boolean, //是否中獎
  ///         "prizeId": "string" | null, //中獎獎品ID
  ///         "prizeName": "string" | null //中獎獎品名稱
  ///       }
  ///     ],
  ///     "totalCount": number
  ///   }
  /// }
  /// ```
  /// </returns>
  [Authorize(AuthenticationSchemes = "Bearer")]
  [HttpGet("[action]")]
  public async Task<ActionResult<CommonResult<dynamic>>> MyTickets()
  {
    string paddleNum = _vipSvc.PaddleNum;

    try
    {
      // 查詢所有商品預覽 (整合 VIP 和員工資訊)
      string sql = """
SELECT T.RaffleTicketNo, O.RaffleOrderNo, O.SoldDtm, V.PaddleNum
 FROM [RaffleTicket] T (NOLOCK)
 INNER JOIN RaffleOrder O (NOLOCK) ON T.RaffleSoldNo = O.RaffleOrderNo
 INNER JOIN [Vip] V (NOLOCK) ON T.BuyerEmail = V.VipEmail
 WHERE V.PaddleNum = @PaddleNum
""";

      using var conn = await DBHelper.AUCDB.OpenAsync();
      var infoList = await conn.QueryAsync(sql, new { PaddleNum = paddleNum });
      var ticketList = infoList.Select(row => new
      {
        RaffleTicketNo = row.RaffleTicketNo, // 抽獎券編號
        RaffleOrderNo = row.RaffleOrderNo,   // 訂單編號
        SoldDtm = row.SoldDtm,
        PaddleNum = row.PaddleNum, // 貴賓編號
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
  /// 5.4 取得中獎結果 (抽三大獎，由三獎→二獎→一獎)
  /// GET /api/raffleticket/winner/{prizeId}
  /// </summary>
  /// <param name="prizeId">獎品ID</param>
  /// <returns>
  /// **Response:**
  /// ```json
  /// {
  ///   "success": true,
  ///   "data": {
  ///     "prizeId": "string", //獎品ID
  ///     "prizeName": "string", //獎品名稱
  ///     "winnerID": "string",  //中獎賓客ID
  ///     "winnerName": "string",  //中獎賓客姓名
  ///     "ticketNumber": "string", //中獎票號
  ///     "drawTime": "ISO 8601"  //抽獎時間
  ///   }
  /// }
  /// ```
  /// </returns>
  [HttpGet("winner/{prizeId}")]
  public ActionResult<CommonResult<RaffleWinnerData>> GetMajorWinner(string prizeId)
  {
    try
    {
      // resource
      var request = HttpContext.Request;
      string publicWebRoot = $"{request.Scheme}://{request.Host}";

      //## 若已抽獎直接回傳結果。
      using var conn = DBHelper.AUCDB.Open();

      RaffleWinner? winner = null;
      lock (lockObj)
      {
        //## 進行抽獎
        winner = DoDrawRaffle(prizeId, conn);
      }

      //## 送回抽獎結果。
      var data = DoGetRaffleDrawingResult(winner, publicWebRoot, conn);
      var result = new CommonResult<RaffleWinnerData>(true, data, null);
      return Ok(result);
    }
    catch (Exception ex)
    {
      string errMsg = string.Format("Exception！{0}", ex.Message);
      _logger.LogError(ex, errMsg);
      return Ok(new CommonResult<RaffleWinnerData>(false, null, errMsg));
    }
  }

  [NonAction]
  private RaffleWinner DoDrawRaffle(string prizeId, SqlConnection conn)
  {
    string sqlInsertWinner = """
INSERT INTO [dbo].[RaffleWinner]
 ([PrizeId],[RaffleTickerNo],[DrawDtm])
OUTPUT inserted.*
VALUES
 (@PrizeId, @RaffleTickerNo, GetDate())
""";

    string sqlAliveTickets = """
SELECT RaffleTicketNo FROM RaffleTicket T
WHERE NOT EXISTS 
(SELECT TOP 1 * FROM RaffleWinner W WHERE W.RaffleTickerNo = T.RaffleTicketNo)
""";

    try
    {
      using var txn = conn.BeginTransaction();
      RaffleWinner? winner = conn.GetEx<RaffleWinner>(new { PrizeId = prizeId }, txn);
      if (winner != null)
      {
        //# 已開完獎，獎直接送回結果。
        txn.Commit();
        _logger.LogInformation($"已開完獎 {winner.PrizeId}-{winner.RaffleTickerNo} 直接送回結果。");
        return winner;
      }

      //# 取得有效且未得獎的抽獎券
      string[] ticketArray = conn.Query<RaffleTicket>(sqlAliveTickets, null, txn)
                                 .Select(c => c.RaffleTicketNo)
                                 .ToArray();

      //# 進行抽將
      string winTicket = _lotterySvc.DrawOneTicket(ticketArray);

      //# 存入DB
      winner = conn.QueryFirst<RaffleWinner>(sqlInsertWinner, new { PrizeId = prizeId, RaffleTickerNo = winTicket }, txn);

      //# SUCCESS
      txn.Commit();
      _logger.LogInformation($"完成開獎 {winner.PrizeId}-{winner.RaffleTickerNo} 送回結果。");
      return winner;
    }
    catch (Exception ex)
    {
      throw new ApplicationException("DoDrawGiveToWin fail!", ex);
    }
  }

  /// <summary>
  /// helper: 取得彩券中獎結果。
  /// </summary>
  [NonAction]
  private RaffleWinnerData DoGetRaffleDrawingResult(RaffleWinner winner, string publicWebRoot, SqlConnection conn)
  {
    // ※ 執行此動作需先確認已完成抽獎了。
    string sql = """
SELECT
 W.PrizeId,
 W.RaffleTickerNo,
 W.DrawDtm,
 T.BuyerName,
 T.BuyerEmail,
 PrizeName = P.[Name],
 V.PaddleNum
FROM [RaffleWinner] W (NOLOCK)
INNER JOIN [RaffleTicket] T (NOLOCK) ON W.RaffleTickerNo = T.RaffleTicketNo
INNER JOIN [RafflePrize] P (NOLOCK) ON W.PrizeId = P.PrizeId
LEFT JOIN [Vip] V (NOLOCK) ON T.BuyerEmail = V.VipEmail
WHERE W.PrizeId = @PrizeId
AND W.RaffleTickerNo = @RaffleTickerNo;
""";

    var info = conn.QueryFirst(sql, new { winner.PrizeId, winner.RaffleTickerNo });
    return new RaffleWinnerData(
      PrizeId: info.PrizeId,
      PrizeName: info.PrizeName,
      WinnerID: info.PaddleNum ?? info.BuyerEmail,
      WinnerName: info.BuyerName,
      TicketNumber: info.RaffleTickerNo,
      DrawTime: info.DrawDtm.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    );
  }

  /// <summary>
  /// 5.5 取得所有得獎名單
  /// GET /api/raffleticket/winners
  /// </summary>
  /// <returns>
  /// **Response:**
  /// ```json
  /// {
  ///   "success": true,
  ///   "data": {
  ///     "winners": [
  ///       {
  ///         "prizeId": "string", //獎品ID
  ///         "prizeName": "string", //獎品名稱
  ///         "prizeDescription": "string", //獎品描述
  ///         "prizeImage": "string", //獎品圖片URL
  ///         "prizeValue": "string", //獎品價值
  ///         "winnerID": "string",  //中獎賓客ID
  ///         "winnerName": "string",  //中獎賓客姓名
  ///         "ticketNumber": "string",  //中獎票號
  ///         "drawTime": "ISO 8601"  //抽獎時間
  ///       }
  ///     ]
  ///   }
  /// }
  /// ```
  /// </returns>
  [AllowAnonymous]
  [HttpGet("winners")]
  public async Task<ActionResult<CommonResult<RaffleWinnersData>>> GetAllWinners()
  {
    try
    {
      var request = HttpContext.Request;
      string publicWebRoot = $"{request.Scheme}://{request.Host}";

      // 查詢所有得獎記錄
      string sql = """
SELECT
  W.PrizeId,
  W.RaffleTickerNo,
  W.DrawDtm,
  T.BuyerName,
  T.BuyerEmail,
  P.Name as PrizeName,
  P.Description as PrizeDescription,
  P.Image as PrizeImage,
  P.Value as PrizeValue,
	V.PaddleNum
FROM [RaffleWinner] W (NOLOCK)
INNER JOIN [RaffleTicket] T (NOLOCK) ON W.RaffleTickerNo = T.RaffleTicketNo
INNER JOIN [RafflePrize] P (NOLOCK) ON W.PrizeId = P.PrizeId
LEFT JOIN Vip V (NOLOCK) ON T.BuyerEmail = V.VipEmail
ORDER BY W.DrawDtm DESC
""";

      using var conn = await DBHelper.AUCDB.OpenAsync();
      var results = await conn.QueryAsync(sql);

      var winners = results.Select(r => new RaffleWinnerItem(
          PrizeId: r.PrizeId,
          PrizeName: r.PrizeName,
          PrizeDescription: r.PrizeDescription,
          PrizeImage: $"{publicWebRoot}{r.PrizeImage}",
          PrizeValue: r.PrizeValue.ToString(),
          WinnerID: r.PaddleNum ?? r.BuyerEmail,
          WinnerName: r.BuyerName,
          TicketNumber: r.RaffleTickerNo,
          DrawTime: r.DrawDtm.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
      )).ToList();

      var data = new RaffleWinnersData(winners);

      return Ok(new CommonResult<RaffleWinnersData>(true, data, null));
    }
    catch (Exception ex)
    {
      string errMsg = string.Format("Exception！{0}", ex.Message);
      _logger.LogError(ex, errMsg);
      return Ok(new CommonResult<RaffleWinnersData>(false, null, errMsg));
    }
  }

}
