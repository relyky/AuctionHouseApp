using Microsoft.AspNetCore.Http;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Vista.DB;
using Vista.DB.Schema;

namespace AuctionHouseApp.Server.Controllers;

[Route("api/[controller]")]
[ApiController]
public class GiveToWinController(
    ILogger<GiveToWinController> _logger
) : ControllerBase
{
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

      using var conn = await DBHelper.AUCDB.OpenAsync();

      // 查詢所有商品預覽 (整合 VIP 和員工資訊)
      string sql = """
SELECT * FROM [GivePrize] (NOLOCK)
""";

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
  /// 6.2 取得我的福袋抽獎券 [須先登入認證]
  /// </summary>
  [Authorize(AuthenticationSchemes = "Bearer")]
  [HttpGet("[action]")]
  public async Task<ActionResult<CommonResult<dynamic>>> Mytickets()
  {
    throw new NotImplementedException();
  }

}
