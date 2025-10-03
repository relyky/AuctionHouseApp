using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Vista.DB;

namespace AuctionHouseApp.Server.Controllers;

[Route("api/openask")]
[ApiController]
public class OpenAskController(
    ILogger<OpenAskController> _logger
) : ControllerBase
{
  /// <summary>
  /// 9.1 取得募款狀態
  /// GET /api/openask/status/{roundNumber}
  /// </summary>
  /// <param name="roundNumber">募款回合編號</param>
  /// <returns>
  /// **Response:**
  /// ```json
  /// {
  ///   "success": true,
  ///   "data": {
  ///     "roundNumber": "string",  // 當前Round募款金額
  ///     "currentAmount": number, // 當前Round募款金額
  ///     "donorCount": number,  // 當前Round捐款人數
  ///     "isActive": boolean   // 募款是否進行中
  ///   }
  /// }
  /// ```
  /// </returns>
  [AllowAnonymous]
  [HttpGet("status/{roundNumber}")]
  public async Task<ActionResult<CommonResult<OpenAskStatusData>>> GetStatus(int roundNumber)
  {
    try
    {
      using var conn = await DBHelper.AUCDB.OpenAsync();

      // 檢查該 Round 是否存在且是否啟動
      string roundCheckSql = """
SELECT [Round]
      ,[Amount]
      ,[IsActive]
FROM [OpenAskRound] (NOLOCK)
WHERE [Round] = @RoundNumber
""";

      var roundInfo = await conn.QueryFirstOrDefaultAsync<OpenAskRoundInfo>(roundCheckSql, new { RoundNumber = roundNumber });

      if (roundInfo == null)
      {
        return Ok(new CommonResult<OpenAskStatusData>(false, null, "該募款回合不存在"));
      }

      bool isActive = roundInfo.IsActive == "Y";

      // 查詢該 Round 的募款統計
      string statsSql = """
SELECT
    ISNULL(SUM([Amount]), 0) as CurrentAmount,
    COUNT(DISTINCT [PaddleNum]) as DonorCount
FROM [OpenAskRecord] (NOLOCK)
WHERE [Round] = @RoundNumber
  AND [Status] = 'Confirmed'
""";

      var stats = await conn.QueryFirstOrDefaultAsync<OpenAskStats>(statsSql, new { RoundNumber = roundNumber });

      var data = new OpenAskStatusData(
          RoundNumber: roundNumber.ToString(),
          CurrentAmount: stats?.CurrentAmount ?? 0m,
          DonorCount: stats?.DonorCount ?? 0,
          IsActive: isActive
      );

      return Ok(new CommonResult<OpenAskStatusData>(true, data, null));
    }
    catch (Exception ex)
    {
      string errMsg = string.Format("Exception！{0}", ex.Message);
      _logger.LogError(ex, errMsg);
      return Ok(new CommonResult<OpenAskStatusData>(false, null, errMsg));
    }
  }

  /// <summary>
  /// 9.2 取得最新捐款記錄
  /// GET /api/openask/donations/recent/{roundNumber}
  /// </summary>
  /// <param name="roundNumber">募款回合編號</param>
  /// <param name="limit">限制筆數 (預設: 10)</param>
  /// <returns>
  /// **Response:**
  /// ```json
  /// {
  ///   "success": true,
  ///   "data": {
  ///     "donations": [
  ///       {
  ///         "paddleNum": "string",  // 捐款者ID
  ///         "paddleName": "string", // 捐款者姓名
  ///         "amount": number, // 捐款金額
  ///         "timestamp": "ISO 8601" // 捐款時間
  ///       }
  ///     ]
  ///   }
  /// }
  /// ```
  /// </returns>
  [AllowAnonymous]
  [HttpGet("donations/recent/{roundNumber}")]
  public async Task<ActionResult<CommonResult<RecentDonationsData>>> GetRecentDonations(
      int roundNumber,
      [FromQuery] int limit = 10)
  {
    try
    {
      // 驗證 limit 參數
      if (limit <= 0 || limit > 100)
      {
        limit = 10;
      }

      using var conn = await DBHelper.AUCDB.OpenAsync();

      // 查詢最新的捐款記錄
      string sql = """
SELECT TOP (@Limit)
    [PaddleNum],
    [PaddleName],
    [Amount],
    COALESCE([RecordDtm1], [RecordDtm2]) as RecordDtm
FROM [OpenAskRecord] (NOLOCK)
WHERE [Round] = @RoundNumber
  AND [Status] = 'Confirmed'
ORDER BY COALESCE([RecordDtm1], [RecordDtm2]) DESC
""";

      var records = await conn.QueryAsync<OpenAskRecordItem>(sql, new { RoundNumber = roundNumber, Limit = limit });

      var donations = records.Select(r => new DonationItem(
          PaddleNum: r.PaddleNum,
          PaddleName: r.PaddleName,
          Amount: r.Amount,
          Timestamp: r.RecordDtm.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
      )).ToList();

      var data = new RecentDonationsData(donations);

      return Ok(new CommonResult<RecentDonationsData>(true, data, null));
    }
    catch (Exception ex)
    {
      string errMsg = string.Format("Exception！{0}", ex.Message);
      _logger.LogError(ex, errMsg);
      return Ok(new CommonResult<RecentDonationsData>(false, null, errMsg));
    }
  }
}
