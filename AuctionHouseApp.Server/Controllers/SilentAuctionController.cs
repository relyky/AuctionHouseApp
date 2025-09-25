using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using System.Data.Common;
using Vista.DB;
using Vista.DB.Schema;

namespace AuctionHouseApp.Server.Controllers;

[Route("api/[controller]")]
[ApiController]
public class SilentAuctionController(
    ILogger<RaffleTicketController> _logger
) : ControllerBase
{
  /// <summary>
  /// 8.1 取得商品清單
  /// 大螢幕可沿用 → 不管制授權。
  /// </summary>
  /// <returns>
  /// **Response:**
  /// ```json
  /// {
  ///   "success": true,
  ///   "data": {
  ///     "items": [ --- 欄位已修改
  ///       {
  ///         "itemId": "string", // 商品ID
  ///         "name": "string", // 商品名稱
  ///         "description": "string", // 商品描述
  ///         "image": "string", // 商品圖片URL
  ///         "startPrice": number, // 起標價
  ///         "currentPrice": number,  //當前價格
  ///         "minIncrement": number,  //最低加價
  ///         "currentBidderPaddleNum": "string",  //最高出價者
  ///         "currentBidderPaddleName": "string", //最高出價者姓名
  ///         "endTime": "ISO 8601"  //結標時間
  ///       }
  ///     ]
  ///   }
  /// }
  /// ```
  /// </returns>
  [AllowAnonymous]
  [HttpGet("[action]")]
  public async Task<ActionResult<CommonResult<dynamic>>> Items()
  {
    try
    {
      var request = HttpContext.Request;
      string publicWebRoot = $"{request.Scheme}://{request.Host}";

      using var conn = await DBHelper.AUCDB.OpenAsync();

      // 查詢所有商品預覽 (整合 VIP 和員工資訊)
      string sql = """
SELECT * FROM [SilentPrize] (NOLOCK)
""";

      var infoList = await conn.QueryAsync<SilentPrize>(sql);
      var prizeList = infoList.Select(row => new
      {
        ItemId = row.ItemId,
        Name = row.Name,
        Description = row.Description,
        Image = $"{publicWebRoot}{row.Image}",
        StartPrice = row.StartPrice,
        MinIncrement = row.MinIncrement,
        StartTime = row.StartTime,
        EndTime = row.EndTime,
        Status = row.Status,
        DisplayOrder = row.DisplayOrder,
        CreatedAt = row.CreatedAt,
        UpdatedAt = row.UpdatedAt,
        CreatedBy = row.CreatedBy
      }).ToArray();

      var result = new CommonResult<dynamic>(
          true,
          new { Items = prizeList },
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
  /// 8.2 取得單一商品詳情
  /// 大螢幕可沿用 → 不管制授權。
  /// </summary>
  /// <returns>
  /// **Response:**
  /// ```json
  /// {
  ///   "success": true,
  ///   "data": {
  ///     "item": { --- 欄位已修改
  ///       "itemId": "string", // 商品ID
  ///       "name": "string", // 商品名稱
  ///       "description": "string", // 商品描述
  ///       "image": "string", // 商品圖片URL
  ///       "startPrice": number, // 起標價
  ///       "currentPrice": number,  //當前價格
  ///       "minIncrement": number,  //最低加價
  ///       "currentBidderPaddleNum": "string",  //最高出價者
  ///       "currentBidderPaddleName": "string", //最高出價者姓名
  ///       "endTime": "ISO 8601",  //結標時間
  ///       "timeRemaining": number,  //剩餘秒數
  ///       "status": "active" | "ended",  //拍賣狀態
  ///       "bidHistory": [
  ///         {
  ///           "bidderPaddleNum": "string",  //出價者
  ///           "bidderPaddleName": "string", // 出價者姓名
  ///           "amount": number,  //出價價格
  ///           "timestamp": "ISO 8601"  //出價時間
  ///         }
  ///       ]
  ///     }
  ///   }
  /// }
  /// ```
  /// </returns>
  [AllowAnonymous]
  [HttpGet("items/{itemId}")]
  public async Task<ActionResult<CommonResult<dynamic>>> GetItem(string itemId)
  {
    try
    {
      var request = HttpContext.Request;
      string publicWebRoot = $"{request.Scheme}://{request.Host}";

      using var conn = await DBHelper.AUCDB.OpenAsync();

      // 查詢所有商品預覽 (整合 VIP 和員工資訊)
      string sql = """
SELECT * FROM [SilentPrize] (NOLOCK)
WHERE ItemId = @ItemId
""";

      var info = await conn.QueryFirstOrDefaultAsync<SilentPrize>(sql, new { ItemId = itemId });

      if (info == null)
        return Ok(new CommonResult<dynamic>(false, null, "商品不存在"));

      var item = new
      {
        ItemId = info.ItemId,
        Name = info.Name,
        Description = info.Description,
        Image = $"{publicWebRoot}{info.Image}",
        StartPrice = info.StartPrice,
        MinIncrement = info.MinIncrement,
        StartTime = info.StartTime,
        EndTime = info.EndTime,
        Status = info.Status,
        DisplayOrder = info.DisplayOrder,
        CreatedAt = info.CreatedAt,
        UpdatedAt = info.UpdatedAt,
        CreatedBy = info.CreatedBy
      };

      var result = new CommonResult<dynamic>(
          true,
          new { Item = item },
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
