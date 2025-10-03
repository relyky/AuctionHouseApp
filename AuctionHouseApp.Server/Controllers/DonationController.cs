using AuctionHouseApp.Server.Services;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Vista.DB;
using Vista.DB.Schema;

namespace AuctionHouseApp.Server.Controllers;

[Route("api/donation")]
[ApiController]
public class DonationController(
    ILogger<DonationController> _logger,
    AuthVipService _vipSvc
) : ControllerBase
{
    /// <summary>
    /// 10.1 取得捐款功能狀態
    /// GET /api/donation/status
    /// </summary>
    /// <returns>
    /// **Response:**
    /// ```json
    /// {
    ///   "success": true,
    ///   "data": {
    ///     "isEnabled": boolean, // 捐款功能是否開放
    ///     "minAmount": number, // 最小捐款金額
    ///     "totalAmount": number, // 總捐款金額
    ///     "donorCount": number // 總捐款人數
    ///   }
    /// }
    /// ```
    /// </returns>
    [AllowAnonymous]
    [HttpGet("status")]
    public async Task<ActionResult<CommonResult<DonationStatusData>>> GetStatus()
    {
        try
        {
            using var conn = await DBHelper.AUCDB.OpenAsync();

            // 查詢捐款開關狀態
            string switchSql = """
SELECT TOP 1 [StringValue]
FROM [LiveSession] (NOLOCK)
WHERE [StateName] = 'DonationSwitch'
""";

            var switchInfo = await conn.QueryFirstOrDefaultAsync<DonationSwitchInfo>(switchSql);
            bool isEnabled = switchInfo?.StringValue == "on";

            // 查詢捐款統計
            string statsSql = """
SELECT
    ISNULL(SUM([Amount]), 0) as TotalAmount,
    COUNT(DISTINCT [PaddleNum]) as DonorCount
FROM [DonationRecord] (NOLOCK)
""";

            var stats = await conn.QueryFirstOrDefaultAsync<DonationStats>(statsSql);

            // 最小捐款金額設定（可從 SysParameter 取得，這裡先用預設值 100）
            decimal minAmount = 100m;

            var data = new DonationStatusData(
                IsEnabled: isEnabled,
                MinAmount: minAmount,
                TotalAmount: stats?.TotalAmount ?? 0m,
                DonorCount: stats?.DonorCount ?? 0
            );

            return Ok(new CommonResult<DonationStatusData>(true, data, null));
        }
        catch (Exception ex)
        {
            string errMsg = string.Format("Exception！{0}", ex.Message);
            _logger.LogError(ex, errMsg);
            return Ok(new CommonResult<DonationStatusData>(false, null, errMsg));
        }
    }

    /// <summary>
    /// 10.2 提交捐款
    /// POST /api/donation/donate
    /// </summary>
    /// <param name="request">捐款請求</param>
    /// <returns>
    /// **Response:**
    /// ```json
    /// {
    ///   "success": true,
    ///   "data": {
    ///     "amount": number, // 捐款金額
    ///     "timestamp": "ISO 8601" // 捐款時間
    ///   }
    /// }
    /// ```
    /// </returns>
    [Authorize(AuthenticationSchemes = "Bearer")]
    [HttpPost("donate")]
    public async Task<ActionResult<CommonResult<DonateData>>> Donate([FromBody] DonateRequest request)
    {
        try
        {
            // 取得當前登入用戶資訊
            string paddleNum = _vipSvc.PaddleNum;

            if (string.IsNullOrEmpty(paddleNum) )
            {
                return Ok(new CommonResult<DonateData>(false, null, "無法取得使用者資訊"));
            }

            // 驗證金額
            if (request.Amount <= 0)
            {
                return Ok(new CommonResult<DonateData>(false, null, "捐款金額必須大於 0"));
            }

            // 檢查捐款功能是否開放
            using var conn = await DBHelper.AUCDB.OpenAsync();


            //var paddleName = userIdentity.FindFirst(ClaimTypes.GivenName)?.Value;
            string vipCheckSql = "SELECT COUNT(*) AS Item1, MAX([VipName]) AS Item2 FROM [dbo].[Vip] WHERE [PaddleNum] = @PaddleNum";
            var vipInfo = conn.QueryFirstOrDefault(vipCheckSql, new { PaddleNum = paddleNum });
            var paddleName = vipInfo?.Item2 ?? "";


            string switchSql = """
SELECT TOP 1 [StringValue]
FROM [LiveSession] (NOLOCK)
WHERE [StateName] = 'DonationSwitch'
""";

            var switchInfo = await conn.QueryFirstOrDefaultAsync<DonationSwitchInfo>(switchSql);
            bool isEnabled = switchInfo?.StringValue == "on";

            if (!isEnabled)
            {
                return Ok(new CommonResult<DonateData>(false, null, "捐款功能目前未開放"));
            }

            // 插入捐款記錄
            string insertSql = """
INSERT INTO [DonationRecord]
    ([PaddleNum], [PaddleName], [Amount], [Timestamp], [HasPaid], [PaidDtm], [PaidStaff])
OUTPUT inserted.[Amount], inserted.[Timestamp]
VALUES
    (@PaddleNum, @PaddleName, @Amount, GETDATE(), 'N', NULL, NULL)
""";

            var result = await conn.QueryFirstAsync<DonationInsertResult>(insertSql, new
            {
                PaddleNum = paddleNum,
                PaddleName = paddleName,
                Amount = request.Amount
            });

            var data = new DonateData(
                Amount: result.Amount,
                Timestamp: result.Timestamp.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
            );

            return Ok(new CommonResult<DonateData>(true, data, "捐款成功"));
        }
        catch (Exception ex)
        {
            string errMsg = string.Format("Exception！{0}", ex.Message);
            _logger.LogError(ex, errMsg);
            return Ok(new CommonResult<DonateData>(false, null, errMsg));
        }
    }
}
