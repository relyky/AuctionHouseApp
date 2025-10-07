using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;
using System.IO;
using System.Security.Claims;
using Vista.DB;
using Vista.DB.Schema;
using Vista.DbPanda;

namespace AuctionHouseApp.Server.Controllers;

[Route("api/[controller]")]
[ApiController]
public class LiveAuctionController(
    ILogger<LiveAuctionController> _logger
) : ControllerBase
{
    /// <summary>
    /// 取得拍賣商品預覽
    /// 大螢幕可沿用 → 不管制授權。
    /// </summary>
    /// <returns>
    /// **Response:**
    /// ```json
    /// {
    ///   "success": true,
    ///   "data": {
    ///     "items": [
    ///       {
    ///         "itemId": "string", // 商品ID
    ///         "name": "string", // 商品名稱
    ///         "description": "string", // 商品描述
    ///         "image": "string", // 商品圖片URL
    ///         "startingPrice": number, // 起標價
    ///         "reservePrice": number, // 底價
    ///         "status": "active" | "ended" // 拍賣狀態
    ///       }
    ///     ]
    ///   }
    /// }
    /// ```
    /// </returns>
    [AllowAnonymous]
    [HttpGet("[action]")]
    public async Task<ActionResult<CommonResult<LiveAuctionPreviewResponse>>> Preview()
    {
        try
        {
            var request = HttpContext.Request;
            string publicWebRoot = $"{request.Scheme}://{request.Host}";

            // 查詢所有商品預覽 (整合 VIP 和員工資訊)
            string sql = @"
                SELECT
                    ap.[ItemId],
                    ap.[Name],
                    ap.[Description],
                    ap.[Image],
                    ap.[StartPrice] as StartingPrice,
                    ap.[ReservePrice],
                    CASE
                        WHEN ah.[ItemId] IS NOT NULL THEN ah.[AuctionResult]
                        ELSE 'active'
                    END as Status
                FROM [dbo].[AuctionPrize] ap (NOLOCK)
                LEFT JOIN [dbo].[AuctionHammered] ah (NOLOCK) ON ap.[ItemId] = ah.[ItemId]
                ORDER BY
                    CASE
                        WHEN ah.[AuctionResult] IS NULL THEN 1  -- Active
                        WHEN ah.[AuctionResult] = 'Hammered' THEN 2  -- Ended
                        WHEN ah.[AuctionResult] = 'Passed' THEN 3    -- Passed
                    END,
                    ap.[ItemId]";

            using var conn = await DBHelper.AUCDB.OpenAsync();
            var queryResults = await conn.QueryAsync<AuctionPreviewQueryResult>(sql);
            var items = queryResults.Select(row => new LiveAuctionItem(
                ItemId: row.ItemId,
                Name: row.Name,
                Description: row.Description,
                Image: $"{publicWebRoot}{row.Image}",
                StartingPrice: row.StartingPrice,
                ReservePrice: row.ReservePrice,
                Status: row.Status == "Hammered" || row.Status == "Passed" ? "ended" : "active"
            )).ToArray();

            var result = new CommonResult<LiveAuctionPreviewResponse>(
                true,
                new LiveAuctionPreviewResponse(items),
                null);

            return Ok(result);
        }
        catch (Exception ex)
        {
            string errMsg = string.Format("Exception！{0}", ex.Message);
            _logger.LogError(ex, errMsg);
            return Ok(new CommonResult<LiveAuctionPreviewResponse>(false, null, errMsg));
        }
    }

    /// <summary>
    /// 取得指定拍賣商品詳情
    /// 大螢幕可沿用 → 不管制授權。
    /// </summary>
    /// <param name="itemId">商品ID</param>
    /// <returns>
    /// **Response:**
    /// ```json
    /// {
    ///   "success": true,
    ///   "data": {
    ///     "item": {
    ///       "itemId": "string", // 商品ID
    ///       "name": "string", // 商品名稱
    ///       "description": "string", // 商品描述
    ///       "image": "string", // 商品圖片URL
    ///       "startingPrice": number, // 起標價
    ///       "reservePrice": number, // 底價
    ///       "status": "active" | "ended" // 拍賣狀態
    ///     }
    ///   }
    /// }
    /// ```
    /// </returns>
    [AllowAnonymous]
    [HttpGet("preview/{itemId}")]
    public async Task<ActionResult<CommonResult<LiveAuctionItemDetailResponse>>> PreviewItem(string itemId)
    {
        try
        {
            var request = HttpContext.Request;
            string publicWebRoot = $"{request.Scheme}://{request.Host}";

            // 查詢單一商品詳細資訊 (含結標狀態)
            string sql = @"
                SELECT
                    ap.*,
                    ah.[AuctionResult]
                FROM [dbo].[AuctionPrize] ap (NOLOCK)
                LEFT JOIN [dbo].[AuctionHammered] ah (NOLOCK) ON ap.[ItemId] = ah.[ItemId]
                WHERE ap.[ItemId] = @ItemId";

            using var conn = await DBHelper.AUCDB.OpenAsync();
            var itemData = await conn.QueryFirstOrDefaultAsync<AuctionItemDetailQueryResult>(sql, new { ItemId = itemId });

            if (itemData == null)
            {
                return Ok(new CommonResult<LiveAuctionItemDetailResponse>(false, null, "商品不存在"));
            }

            var item = new LiveAuctionItemDetail(
                ItemId: itemData.ItemId,
                Name: itemData.Name,
                Description: itemData.Description,
                Image: $"{publicWebRoot}{itemData.Image}",
                StartingPrice: itemData.StartPrice,
                ReservePrice: itemData.ReservePrice,
                Status: itemData.AuctionResult == "Hammered" || itemData.AuctionResult == "Passed" ? "ended" : "active"
            );

            var result = new CommonResult<LiveAuctionItemDetailResponse>(
                true,
                new LiveAuctionItemDetailResponse(item),
                null);

            return Ok(result);
        }
        catch (Exception ex)
        {
            string errMsg = string.Format("Exception！{0}", ex.Message);
            _logger.LogError(ex, errMsg);
            return Ok(new CommonResult<LiveAuctionItemDetailResponse>(false, null, errMsg));
        }
    }

    /// <summary>
    /// 取得即時競標狀態
    /// 大螢幕可沿用 → 不管制授權。
    /// 大螢幕每 2 秒 Polling 此 API 以取得最新出價。
    /// </summary>
    /// <param name="itemId">商品ID</param>
    /// <returns>
    /// **Response:**
    /// ```json
    /// {
    ///   "success": true,
    ///   "data": {
    ///     "currentPrice": number, // 當前最高價格
    ///     "bidderID": "string", // 出價者ID
    ///     "bidderName": "string", // 出價者姓名
    ///     "timestamp": "string", // 出價時間戳記
    ///     "isEnded": boolean, // 是否已結標
    ///     "finalWinnerID": "string", // 最終得標者ID（結標後顯示）
    ///     "finalWinnerName": "string" // 最終得標者姓名（結標後顯示）
    ///   }
    /// }
    /// ```
    /// </returns>
    [AllowAnonymous]
    [HttpGet("status/{itemId}")]
    public ActionResult<CommonResult<LiveAuctionStatusResponse>> Status(string itemId)
    {
        try
        {
            using var conn = DBHelper.AUCDB.Open();

            // 查詢即時競標狀態 (大螢幕輪詢)
            string sql = @"
                SELECT
                    ap.[ItemId],
                    ap.[Name],
                    ap.[StartPrice] as StartingPrice,
                    -- 當前最高出價：從 AuctionBidLog 取得最新出價，如無出價則使用起標價
                    COALESCE(latest_bid.[BidAmount], ap.[StartPrice]) as CurrentPrice,
                    latest_bid.[PaddleNum] as CurrentBidderPaddle,
                    latest_bid.[PaddleName] as CurrentBidderName,
                    latest_bid.[Timestamp] as LastBidTime,
                    CASE WHEN ah.[ItemId] IS NOT NULL THEN 1 ELSE 0 END as IsEnded,
                    ah.[AuctionResult],
                    ah.[WinnerPaddleNum],
                    ah.[WinnerName],
                    ah.[HammerPrice],
                    ah.[PassedReason],
                    -- 拍賣狀態直接從資料表取得
                    ap.[Status] as ItemStatus
                FROM [dbo].[AuctionPrize] ap
                LEFT JOIN [dbo].[vw_LatestBid] latest_bid ON ap.[ItemId] = latest_bid.[ItemId] AND latest_bid.rn = 1
                LEFT JOIN [dbo].[AuctionHammered] ah ON ap.[ItemId] = ah.[ItemId]
                WHERE ap.[ItemId] = @ItemId";

            var statusData = conn.QueryFirstOrDefault<AuctionStatusQueryResult>(sql, new { ItemId = itemId });

            if (statusData == null)
            {
                return Ok(new CommonResult<LiveAuctionStatusResponse>(false, null, "商品不存在"));
            }

            var status = new LiveAuctionStatus(
                CurrentPrice: statusData.CurrentPrice ?? statusData.StartingPrice,
                BidderID: statusData.CurrentBidderPaddle ?? "",
                BidderName: statusData.CurrentBidderName ?? "",
                Timestamp: statusData.LastBidTime?.ToString("yyyy-MM-ddTHH:mm:ss.fffZ") ?? "",
                IsEnded: statusData.IsEnded == 1,
                FinalWinnerID: statusData.IsEnded == 1 ? statusData.WinnerPaddleNum : null,
                FinalWinnerName: statusData.IsEnded == 1 ? statusData.WinnerName : null
            );

            var result = new CommonResult<LiveAuctionStatusResponse>(
                true,
                new LiveAuctionStatusResponse(status),
                null);

            return Ok(result);
        }
        catch (Exception ex)
        {
            string errMsg = string.Format("Exception！{0}", ex.Message);
            _logger.LogError(ex, errMsg);
            return Ok(new CommonResult<LiveAuctionStatusResponse>(false, null, errMsg));
        }
    }

    /// <summary>
    /// 記錄競標
    /// 工作人員手動記錄現場競標出價
    /// </summary>
    /// <param name="request">競標記錄請求</param>
    /// <returns></returns>
    [Authorize]
    [HttpPost("record-bid")]
    public async Task<ActionResult<CommonResult<RecordBidResponse>>> RecordBid([FromBody] RecordBidRequest request)
    {
        try
        {
            ClaimsIdentity userIdentity = (ClaimsIdentity)HttpContext.User.Identity!;
            var staffId = userIdentity.FindFirst(ClaimTypes.Name)?.Value;

            if (string.IsNullOrEmpty(staffId))
            {
                return Ok(new CommonResult<RecordBidResponse>(false, null, "未授權的操作"));
            }

            using var conn = await DBHelper.AUCDB.OpenAsync();

            // 1. 檢查 VIP 是否存在
            var vipExists = await conn.QueryFirstOrDefaultAsync<int?>(
                "SELECT COUNT(*) FROM [dbo].[Vip] WHERE [PaddleNum] = @PaddleNum",
                new { request.PaddleNum });

            if (vipExists == null || vipExists == 0)
            {
                return Ok(new CommonResult<RecordBidResponse>(false, null, $"Paddle Number {request.PaddleNum} 不存在"));
            }

            // 2. 取得當前最高價
            var currentPrice = await conn.QueryFirstOrDefaultAsync<decimal?>(
                @"SELECT COALESCE(MAX([BidAmount]), 0)
                  FROM [dbo].[AuctionBidLog]
                  WHERE [ItemId] = @ItemId AND [IsValid] = 'Y' AND [Status] = 'Confirmed'",
                new { request.ItemId });

            // 3. 取得商品起標價
            var startPrice = await conn.QueryFirstOrDefaultAsync<decimal?>(
                "SELECT [StartPrice] FROM [dbo].[AuctionPrize] WHERE [ItemId] = @ItemId",
                new { request.ItemId });

            if (startPrice == null)
            {
                return Ok(new CommonResult<RecordBidResponse>(false, null, "商品不存在"));
            }

            var minPrice = currentPrice > 0 ? currentPrice.Value : startPrice.Value;

            // 4. 驗證出價金額
            if (request.BidAmount <= minPrice)
            {
                return Ok(new CommonResult<RecordBidResponse>(false, null,
                    $"出價金額必須大於目前價格 ${minPrice:N0}"));
            }

            // 5. 取得 VIP 資料
            var vip = await conn.QueryFirstOrDefaultAsync<Vip>(
                "SELECT * FROM [dbo].[Vip] WHERE [PaddleNum] = @PaddleNum",
                new { request.PaddleNum });

            // 6. 插入競標記錄
            var sql = @"
                INSERT INTO [dbo].[AuctionBidLog] (
                    [ItemId], [PaddleNum], [PaddleName], [BidAmount],
                    [BidType], [RecordStaff], [Status], [Notes]
                )
                VALUES (
                    @ItemId, @PaddleNum, @PaddleName, @BidAmount,
                    'Live', @RecordStaff, 'Confirmed', @Notes
                );
                SELECT CAST(SCOPE_IDENTITY() as bigint);";

            var bidId = await conn.QuerySingleAsync<long>(sql, new
            {
                request.ItemId,
                request.PaddleNum,
                PaddleName = vip!.VipName,
                request.BidAmount,
                RecordStaff = staffId,
                request.Notes
            });

            var response = new RecordBidResponse(
                BidId: bidId,
                ItemId: request.ItemId,
                PaddleNum: request.PaddleNum,
                PaddleName: vip.VipName,
                BidAmount: request.BidAmount,
                Timestamp: DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
            );

            return Ok(new CommonResult<RecordBidResponse>(true, response, null));
        }
        catch (Exception ex)
        {
            string errMsg = string.Format("Exception！{0}", ex.Message);
            _logger.LogError(ex, errMsg);
            return Ok(new CommonResult<RecordBidResponse>(false, null, errMsg));
        }
    }

    /// <summary>
    /// 結標處理（成交）
    /// 拍賣官確認得標者並結標
    /// </summary>
    /// <param name="request">結標請求</param>
    /// <returns></returns>
    [Authorize]
    [HttpPost("hammer")]
    public async Task<ActionResult<CommonResult<HammerResponse>>> Hammer([FromBody] HammerRequest request)
    {
        try
        {
            ClaimsIdentity userIdentity = (ClaimsIdentity)HttpContext.User.Identity!;
            var staffId = userIdentity.FindFirst(ClaimTypes.Name)?.Value;

            if (string.IsNullOrEmpty(staffId))
            {
                return Ok(new CommonResult<HammerResponse>(false, null, "未授權的操作"));
            }

            using var conn = await DBHelper.AUCDB.OpenAsync();

            // 1. 檢查是否已結標
            var alreadyHammered = await conn.QueryFirstOrDefaultAsync<int?>(
                "SELECT COUNT(*) FROM [dbo].[AuctionHammered] WHERE [ItemId] = @ItemId",
                new { request.ItemId });

            if (alreadyHammered > 0)
            {
                return Ok(new CommonResult<HammerResponse>(false, null, "此商品已結標"));
            }

            // 2. 取得最高出價記錄
            var latestBid = await conn.QueryFirstOrDefaultAsync<LatestBidResult>(
                @"SELECT TOP 1 [PaddleNum], [PaddleName], [BidAmount]
                  FROM [dbo].[AuctionBidLog]
                  WHERE [ItemId] = @ItemId AND [IsValid] = 'Y' AND [Status] = 'Confirmed'
                  ORDER BY [Timestamp] DESC",
                new { request.ItemId });

            if (latestBid == null)
            {
                return Ok(new CommonResult<HammerResponse>(false, null, "無出價記錄，無法結標"));
            }

            // 3. 插入結標記錄
            var sql = @"
                INSERT INTO [dbo].[AuctionHammered] (
                    [ItemId], [AuctionResult], [WinnerPaddleNum], [WinnerName],
                    [HammerPrice], [HighestBidAmount], [AuctioneerStaff]
                )
                VALUES (
                    @ItemId, 'Hammered', @WinnerPaddleNum, @WinnerName,
                    @HammerPrice, @HighestBidAmount, @AuctioneerStaff
                )";

            await conn.ExecuteAsync(sql, new
            {
                request.ItemId,
                WinnerPaddleNum = latestBid.PaddleNum,
                WinnerName = latestBid.PaddleName,
                HammerPrice = latestBid.BidAmount,
                HighestBidAmount = latestBid.BidAmount,
                AuctioneerStaff = staffId
            });

            // 4. 更新商品狀態為結束
            await conn.ExecuteAsync(
                "UPDATE [dbo].[AuctionPrize] SET [Status] = 'ended' WHERE [ItemId] = @ItemId",
                new { request.ItemId });

            var response = new HammerResponse(
                ItemId: request.ItemId,
                AuctionResult: "Hammered",
                WinnerPaddleNum: latestBid.PaddleNum,
                WinnerName: latestBid.PaddleName,
                HammerPrice: latestBid.BidAmount
            );

            return Ok(new CommonResult<HammerResponse>(true, response, null));
        }
        catch (Exception ex)
        {
            string errMsg = string.Format("Exception！{0}", ex.Message);
            _logger.LogError(ex, errMsg);
            return Ok(new CommonResult<HammerResponse>(false, null, errMsg));
        }
    }

    /// <summary>
    /// 流標處理
    /// 拍賣官確認商品流標（無人出價或未達底價）
    /// </summary>
    /// <param name="request">流標請求</param>
    /// <returns></returns>
    [Authorize]
    [HttpPost("pass")]
    public async Task<ActionResult<CommonResult<PassResponse>>> Pass([FromBody] PassRequest request)
    {
        try
        {
            ClaimsIdentity userIdentity = (ClaimsIdentity)HttpContext.User.Identity!;
            var staffId = userIdentity.FindFirst(ClaimTypes.Name)?.Value;

            if (string.IsNullOrEmpty(staffId))
            {
                return Ok(new CommonResult<PassResponse>(false, null, "未授權的操作"));
            }

            using var conn = await DBHelper.AUCDB.OpenAsync();

            // 1. 檢查是否已結標/流標
            var alreadyEnded = await conn.QueryFirstOrDefaultAsync<int?>(
                "SELECT COUNT(*) FROM [dbo].[AuctionHammered] WHERE [ItemId] = @ItemId",
                new { request.ItemId });

            if (alreadyEnded > 0)
            {
                return Ok(new CommonResult<PassResponse>(false, null, "此商品已結標或流標"));
            }

            // 2. 取得最高出價（如果有）
            var highestBid = await conn.QueryFirstOrDefaultAsync<decimal?>(
                @"SELECT MAX([BidAmount])
                  FROM [dbo].[AuctionBidLog]
                  WHERE [ItemId] = @ItemId AND [IsValid] = 'Y' AND [Status] = 'Confirmed'",
                new { request.ItemId });

            // 3. 決定流標原因
            string passedReason = request.PassedReason ?? (highestBid == null || highestBid == 0 ? "NoBids" : "BelowReserve");

            // 4. 插入流標記錄
            var sql = @"
                INSERT INTO [dbo].[AuctionHammered] (
                    [ItemId], [AuctionResult], [HighestBidAmount], [PassedReason],
                    [AuctioneerStaff], [PaymentStatus], [Notes]
                )
                VALUES (
                    @ItemId, 'Passed', @HighestBidAmount, @PassedReason,
                    @AuctioneerStaff, 'NA', @Notes
                )";

            await conn.ExecuteAsync(sql, new
            {
                request.ItemId,
                HighestBidAmount = highestBid ?? 0,
                PassedReason = passedReason,
                AuctioneerStaff = staffId,
                request.Notes
            });

            // 5. 更新商品狀態為流標
            await conn.ExecuteAsync(
                "UPDATE [dbo].[AuctionPrize] SET [Status] = 'passed' WHERE [ItemId] = @ItemId",
                new { request.ItemId });

            var response = new PassResponse(
                ItemId: request.ItemId,
                AuctionResult: "Passed",
                PassedReason: passedReason,
                HighestBidAmount: highestBid ?? 0
            );

            return Ok(new CommonResult<PassResponse>(true, response, null));
        }
        catch (Exception ex)
        {
            string errMsg = string.Format("Exception！{0}", ex.Message);
            _logger.LogError(ex, errMsg);
            return Ok(new CommonResult<PassResponse>(false, null, errMsg));
        }
    }
}