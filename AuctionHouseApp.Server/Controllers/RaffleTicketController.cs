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
    ILogger<RaffleTicketController> _logger
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

      using var conn = await DBHelper.AUCDB.OpenAsync();

      // 查詢所有商品預覽 (整合 VIP 和員工資訊)
      string sql = """
SELECT * FROM [RafflePrize] (NOLOCK)
""";

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

      using var conn = await DBHelper.AUCDB.OpenAsync();

      // 查詢所有商品預覽 (整合 VIP 和員工資訊)
      string sql = """
SELECT * FROM [RafflePrize] (NOLOCK)
WHERE PrizeId = @PrizeId
""";

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
}
