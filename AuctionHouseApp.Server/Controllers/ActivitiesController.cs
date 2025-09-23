using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AuctionHouseApp.Server.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ActivitiesController(
    ILogger<AuthVipController> _logger
) : ControllerBase
{
  /// <summary>
  /// 取得所有活動狀態。
  /// 大螢幕可沿用 → 不管制授權。
  /// </summary>
  /// <returns>
  /// **Response:**
  /// ```json
  /// {
  ///   "success": true,
  ///   "data": {
  ///     "activities": [
  ///       {
  ///         "type": "raffle" | "give" | "liveAuction" | "silentAuction" | "openAsk" | "donation",  //活動ID
  ///         "name": "Raffle Ticket",  //活動名稱
  ///         "status": "active" | "upcoming" | "ended",  //活動狀態
  ///       }
  ///     ]
  ///   }
  /// }
  /// ```
  /// </returns>
  [AllowAnonymous]
  [HttpGet("[action]")]
  public ActionResult<CommonResult<dynamic>> Status()
  {
    try
    {
      var result = new CommonResult<dynamic>(
        true,
        new
        {
          Activities = new ActivityStatus[]
          {
            new ("raffle", "Raffle Ticket", "active"),
            new ("give", "Give to Win", "active"),
            new ("liveAuction", "Live Auction", "active"),
            new ("silentAuction", "Silent Auction", "active"),
            new ("openAsk", "Open Ask", "active"),
            new ("donation", "Donation", "upcoming"),
          }
        },
        null);

      return Ok(result);
    }
    catch (Exception ex)
    {
      string errMsg = string.Format("Exception！{message}", ex.Message);
      _logger.LogError(ex, errMsg);
      return Ok(new CommonResult<dynamic>(false, null, errMsg));
    }
  }
}
