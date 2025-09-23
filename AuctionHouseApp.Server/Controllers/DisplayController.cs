using AuctionHouseApp.Server.Models;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using Vista.DB;
using Vista.DB.Schema;

namespace AuctionHouseApp.Server.Controllers;

[Route("api/[controller]")]
[ApiController]
public class DisplayController(
    ILogger<AuthVipController> _logger
) : ControllerBase
{
  /// <summary>
  /// 大螢幕狀態查詢
  /// </summary>
  /// <returns>
  /// ```json
  /// {
  ///   "success": true,
  ///   "data": {
  ///     "currentMode": "string", //當前顯示模式
  ///     "isActive": boolean, //大螢幕是否啟動
  ///     "currentItemId": "string" //當前顯示項目的唯一識別碼
  ///   }
  /// }
  /// ```
  /// </returns>
  [AllowAnonymous]
  [HttpGet("[action]")]
  public async Task<ActionResult<CommonResult<DisplayStatusResult_Data>>> Status()
  {
    try
    {
      //# 六個活動八種螢幕：liveAuction | openAsk | raffleDrawing | rafflePrizeDisplay | raffleWinnersCarousel | silentAuction | give | donation;

      string sql = """
SELECT * 
 FROM LiveSession (NOLOCK)
 WHERE StateName IN ('DisplayCurrentMode','DisplayCurrentItemId')
""";
      using var conn = await DBHelper.AUCDB.OpenAsync();
      var infoList = await conn.QueryAsync<LiveSession>(sql);
      var infoDict = infoList.ToDictionary(c => c.StateName, c => c.StringValue);

      string currentMode = infoDict["DisplayCurrentMode"];
      bool isActive = true;
      string? currentItemId = infoDict["DisplayCurrentItemId"];
    
      // SUCCESS
      return Ok(new CommonResult<DisplayStatusResult_Data>(
        true,
        new DisplayStatusResult_Data(currentMode, isActive, currentItemId), 
        null));
    }
    catch (Exception ex)
    {
      string errMsg = string.Format("Exception！{message}", ex.Message);
      _logger.LogError(ex, errMsg);
      //return Ok(new CommonResult<dynamic>(false, null, errMsg));

      // 失敗回傳預設值
      return Ok(new CommonResult<DisplayStatusResult_Data>(
        true,
        new DisplayStatusResult_Data("silentAuction", true, null),
        null));
    }
  }
}
