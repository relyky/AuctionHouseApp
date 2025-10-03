using AuctionHouseApp.Server.Services;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Vista.DB;
using Vista.DB.Schema;

namespace AuctionHouseApp.Server.Controllers;

[Route("api/[controller]")]
[ApiController]
public class RaffleTicketController(
    ILogger<RaffleTicketController> _logger,
    AuthVipService _vipSvc
) : ControllerBase
{
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
  /// 5.4 取得中獎結果
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
  [AllowAnonymous]
  [HttpGet("winner/{prizeId}")]
  public async Task<ActionResult<CommonResult<RaffleWinnerData>>> GetWinner(string prizeId)
  {
    try
    {
      // 查詢指定獎品的中獎記錄
      string sql = """
SELECT
    W.PrizeId,
    W.RaffleTickerNo,
    W.DrawDtm,
    T.BuyerName,
    T.BuyerEmail,
    P.Name as PrizeName
FROM [RaffleWinner] W (NOLOCK)
INNER JOIN [RaffleTicket] T (NOLOCK) ON W.RaffleTickerNo = T.RaffleTicketNo
INNER JOIN [RafflePrize] P (NOLOCK) ON W.PrizeId = P.PrizeId
WHERE W.PrizeId = @PrizeId
""";

      using var conn = await DBHelper.AUCDB.OpenAsync();
      var result = await conn.QueryFirstOrDefaultAsync<RaffleWinnerQueryResult>(sql, new { PrizeId = prizeId });

      if (result == null)
      {
        return Ok(new CommonResult<RaffleWinnerData>(false, null, "尚未開獎或獎品不存在"));
      }

      // 嘗試從 Vip 表取得 PaddleNum（如果買家是 VIP）
      string vipSql = """
SELECT PaddleNum FROM [Vip] (NOLOCK)
WHERE VipEmail = @Email
""";

      var vipInfo = await conn.QueryFirstOrDefaultAsync<VipLookupResult>(vipSql, new { Email = result.BuyerEmail });
      string winnerID = vipInfo?.PaddleNum ?? result.BuyerEmail; // 如果不是 VIP，使用 Email

      var data = new RaffleWinnerData(
          PrizeId: result.PrizeId,
          PrizeName: result.PrizeName,
          WinnerID: winnerID,
          WinnerName: result.BuyerName,
          TicketNumber: result.RaffleTickerNo,
          DrawTime: result.DrawDtm.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
      );

      return Ok(new CommonResult<RaffleWinnerData>(true, data, null));
    }
    catch (Exception ex)
    {
      string errMsg = string.Format("Exception！{0}", ex.Message);
      _logger.LogError(ex, errMsg);
      return Ok(new CommonResult<RaffleWinnerData>(false, null, errMsg));
    }
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
    P.Value as PrizeValue
FROM [RaffleWinner] W (NOLOCK)
INNER JOIN [RaffleTicket] T (NOLOCK) ON W.RaffleTickerNo = T.RaffleTicketNo
INNER JOIN [RafflePrize] P (NOLOCK) ON W.PrizeId = P.PrizeId
ORDER BY W.DrawDtm DESC
""";

      using var conn = await DBHelper.AUCDB.OpenAsync();
      var results = await conn.QueryAsync<AllWinnersQueryResult>(sql);

      // 批次查詢所有 VIP 的 PaddleNum
      var emails = results.Select(r => r.BuyerEmail).Distinct().ToList();
      var vipDict = new Dictionary<string, string>();

      if (emails.Any())
      {
        string vipSql = """
SELECT VipEmail, PaddleNum FROM [Vip] (NOLOCK)
WHERE VipEmail IN @Emails
""";

        var vips = await conn.QueryAsync<VipBatchLookupResult>(vipSql, new { Emails = emails });
        vipDict = vips.ToDictionary(v => v.VipEmail, v => v.PaddleNum);
      }

      var winners = results.Select(r => new RaffleWinnerItem(
          PrizeId: r.PrizeId,
          PrizeName: r.PrizeName,
          PrizeDescription: r.PrizeDescription,
          PrizeImage: $"{publicWebRoot}{r.PrizeImage}",
          PrizeValue: r.PrizeValue.ToString(),
          WinnerID: vipDict.ContainsKey(r.BuyerEmail) ? vipDict[r.BuyerEmail] : r.BuyerEmail,
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
