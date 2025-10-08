using AuctionHouseApp.Server.Services;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Vista.DB;
using Vista.DB.Schema;
using Vista.DbPanda;

namespace AuctionHouseApp.Server.Controllers;

[Route("api/[controller]")]
[ApiController]
public class SilentAuctionController(
    ILogger<SilentAuctionController> _logger,
    SysParamsService _prmSvc,
    AuthVipService _vipSvc
) : ControllerBase
{
    /// <summary>
    /// 取得商品清單
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
    public ActionResult<CommonResult<SilentAuctionItemsResponse>> Items()
    {
        try
        {
            var request = HttpContext.Request;
            string publicWebRoot = $"{request.Scheme}://{request.Host}";

            using var conn = DBHelper.AUCDB.Open();

            // 查詢所有商品清單 (整合最高出價資訊)
            string sql = @"
                SELECT
                    sp.[ItemId],
                    sp.[Name],
                    sp.[Description],
                    sp.[Image],
                    sp.[StartPrice],
                    sp.[MinIncrement],
                    sp.[EndTime],
                    COALESCE(latest_bid.[BidAmount], sp.[StartPrice]) as CurrentPrice,
                    latest_bid.[PaddleNum] as CurrentBidderPaddleNum,
                    latest_bid.[PaddleName] as CurrentBidderPaddleName,
                    CASE
                        WHEN sh.[ItemId] IS NOT NULL THEN sh.[AuctionResult]
                        WHEN CONVERT(TIME, GETDATE()) > CONVERT(TIME, sp.[EndTime]) THEN 'ended'
                        WHEN CONVERT(TIME, GETDATE()) < CONVERT(TIME, sp.[StartTime]) THEN 'upcoming'
                        ELSE 'active'
                    END as Status,
                    CASE
                        WHEN CONVERT(TIME, sp.[EndTime]) > CONVERT(TIME, GETDATE()) THEN
                            DATEDIFF(SECOND, CONVERT(TIME, GETDATE()), CONVERT(TIME, sp.[EndTime]))
                        ELSE 0
                    END as TimeRemaining,
                    COALESCE(bid_count.BidCount, 0) as BidCount,
                    sp.[DisplayOrder]
                FROM [dbo].[SilentPrize] sp
                LEFT JOIN (
                    SELECT
                        sbe.[ItemId],
                        sbe.[PaddleNum],
                        sbe.[PaddleName],
                        sbe.[BidAmount],
                        ROW_NUMBER() OVER (PARTITION BY sbe.[ItemId] ORDER BY sbe.[Timestamp] DESC) as rn
                    FROM [dbo].[SilentBidEvent] sbe
                    WHERE sbe.[IsValid] = 'Y'
                ) latest_bid ON sp.[ItemId] = latest_bid.[ItemId] AND latest_bid.rn = 1
                LEFT JOIN [dbo].[SilentHammered] sh ON sp.[ItemId] = sh.[ItemId]
                LEFT JOIN (
                    SELECT [ItemId], COUNT(*) as BidCount
                    FROM [dbo].[SilentBidEvent]
                    WHERE [IsValid] = 'Y'
                    GROUP BY [ItemId]
                ) bid_count ON sp.[ItemId] = bid_count.[ItemId]
                ORDER BY
                    CASE WHEN sh.[AuctionResult] IS NULL AND CONVERT(TIME, GETDATE()) <= CONVERT(TIME, sp.[EndTime]) THEN 1 ELSE 2 END,
                    sp.[DisplayOrder],
                    sp.[ItemId]";

            var queryResults = conn.Query<SilentAuctionItemQueryResult>(sql);
            var items = queryResults.Select(row => new SilentAuctionItem(
                ItemId: row.ItemId,
                Name: row.Name,
                Description: row.Description,
                Image: $"{publicWebRoot}{row.Image}",
                StartPrice: row.StartPrice ?? 0,
                CurrentPrice: row.CurrentPrice ?? row.StartPrice ?? 0,
                MinIncrement: row.MinIncrement,
                CurrentBidderPaddleNum: row.CurrentBidderPaddleNum ?? "",
                CurrentBidderPaddleName: row.CurrentBidderPaddleName ?? "",
                EndTime: row.EndTime
            )).ToArray();

            var result = new CommonResult<SilentAuctionItemsResponse>(
                true,
                new SilentAuctionItemsResponse(items),
                null);

            return Ok(result);
        }
        catch (Exception ex)
        {
            string errMsg = string.Format("Exception！{0}", ex.Message);
            _logger.LogError(ex, errMsg);
            return Ok(new CommonResult<SilentAuctionItemsResponse>(false, null, errMsg));
        }
    }

    /// <summary>
    /// 取得單一商品詳情
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
    public ActionResult<CommonResult<SilentAuctionItemDetailResponse>> GetItemDetail(string itemId)
    {
        try
        {
            var request = HttpContext.Request;
            string publicWebRoot = $"{request.Scheme}://{request.Host}";

            using var conn = DBHelper.AUCDB.Open();

            // 查詢單一商品詳細資訊 (含競標歷程和時間狀態)
            string sql = @"
                SELECT
                    sp.*,
                    COALESCE(latest_bid.[BidAmount], sp.[StartPrice]) as CurrentPrice,
                    latest_bid.[PaddleNum] as CurrentBidderPaddleNum,
                    latest_bid.[PaddleName] as CurrentBidderPaddleName,
                    latest_bid.[Timestamp] as LastBidTime,
                    CASE
                        WHEN sh.[ItemId] IS NOT NULL THEN sh.[AuctionResult]
                        WHEN CONVERT(TIME, GETDATE()) > CONVERT(TIME, sp.[EndTime]) THEN 'ended'
                        WHEN CONVERT(TIME, GETDATE()) < CONVERT(TIME, sp.[StartTime]) THEN 'upcoming'
                        ELSE 'active'
                    END as Status,
                    CASE
                        WHEN CONVERT(TIME, sp.[EndTime]) > CONVERT(TIME, GETDATE()) THEN
                            DATEDIFF(SECOND, CONVERT(TIME, GETDATE()), CONVERT(TIME, sp.[EndTime]))
                        ELSE 0
                    END as TimeRemaining,
                    COALESCE(bid_count.BidCount, 0) as TotalBids,
                    COALESCE(bid_count.UniqueBidders, 0) as UniqueBidders,
                    sh.[WinnerPaddleNum],
                    sh.[WinnerName],
                    sh.[HammerPrice],
                    sh.[PaymentStatus]
                FROM [dbo].[SilentPrize] sp
                LEFT JOIN (
                    SELECT
                        sbe.[ItemId],
                        sbe.[PaddleNum],
                        sbe.[PaddleName],
                        sbe.[BidAmount],
                        sbe.[Timestamp],
                        ROW_NUMBER() OVER (PARTITION BY sbe.[ItemId] ORDER BY sbe.[Timestamp] DESC) as rn
                    FROM [dbo].[SilentBidEvent] sbe
                    WHERE sbe.[IsValid] = 'Y'
                ) latest_bid ON sp.[ItemId] = latest_bid.[ItemId] AND latest_bid.rn = 1
                LEFT JOIN [dbo].[SilentHammered] sh ON sp.[ItemId] = sh.[ItemId]
                LEFT JOIN (
                    SELECT
                        [ItemId],
                        COUNT(*) as BidCount,
                        COUNT(DISTINCT [PaddleNum]) as UniqueBidders
                    FROM [dbo].[SilentBidEvent]
                    WHERE [IsValid] = 'Y'
                    GROUP BY [ItemId]
                ) bid_count ON sp.[ItemId] = bid_count.[ItemId]
                WHERE sp.[ItemId] = @ItemId";

            var itemData = conn.QueryFirstOrDefault<SilentAuctionItemDetailQueryResult>(sql, new { ItemId = itemId });

            if (itemData == null)
            {
                return Ok(new CommonResult<SilentAuctionItemDetailResponse>(false, null, "商品不存在"));
            }

            // 查詢競標歷程
            string bidHistorySql = @"
                SELECT
                    sbe.[PaddleNum] as BidderPaddleNum,
                    sbe.[PaddleName] as BidderPaddleName,
                    sbe.[BidAmount],
                    sbe.[Timestamp]
                FROM [dbo].[SilentBidEvent] sbe
                WHERE sbe.[ItemId] = @ItemId
                  AND sbe.[IsValid] = 'Y'
                ORDER BY sbe.[Timestamp] DESC";

            var bidHistoryData = conn.Query<SilentAuctionBidHistoryQueryResult>(bidHistorySql, new { ItemId = itemId });
            var bidHistory = bidHistoryData.Select(bid => new SilentAuctionBidHistoryItem(
                BidderPaddleNum: bid.BidderPaddleNum,
                BidderPaddleName: bid.BidderPaddleName,
                Amount: bid.BidAmount,
                Timestamp: bid.Timestamp.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
            )).ToArray();

            var item = new SilentAuctionItemDetail(
                ItemId: itemData.ItemId,
                Name: itemData.Name,
                Description: itemData.Description,
                Image: $"{publicWebRoot}{itemData.Image}",
                StartPrice: itemData.StartPrice ?? 0,
                CurrentPrice: itemData.CurrentPrice ?? itemData.StartPrice ?? 0,
                MinIncrement: itemData.MinIncrement,
                CurrentBidderPaddleNum: itemData.CurrentBidderPaddleNum ?? "",
                CurrentBidderPaddleName: itemData.CurrentBidderPaddleName ?? "",
                EndTime: itemData.EndTime,
                TimeRemaining: itemData.TimeRemaining ?? 0,
                Status: itemData.Status == "Hammered" || itemData.Status == "Passed" || itemData.Status == "ended" ? "ended" : "active",
                BidHistory: bidHistory
            );

            var result = new CommonResult<SilentAuctionItemDetailResponse>(
                true,
                new SilentAuctionItemDetailResponse(item),
                null);

            return Ok(result);
        }
        catch (Exception ex)
        {
            string errMsg = string.Format("Exception！{0}", ex.Message);
            _logger.LogError(ex, errMsg);
            return Ok(new CommonResult<SilentAuctionItemDetailResponse>(false, null, errMsg));
        }
    }

    /// <summary>
    /// 取得單一商品競標歷程（隱私版本）
    /// 需要授權 → 僅顯示使用者自己的出價記錄
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
    ///       "currentPrice": number,  //當前價格
    ///       "isCurrentBidder": boolean,  //是否最高出價者
    ///       "bidHistory": [
    ///         {
    ///           "amount": number,  //出價價格
    ///           "timestamp": "ISO 8601"  //出價時間
    ///         }
    ///       ],
    ///       "userCurrentBid": number | null //用戶當前出價
    ///     }
    ///   }
    /// }
    /// ```
    /// </returns>
    [Authorize(AuthenticationSchemes = "Bearer")]
    [HttpGet("items/{itemId}/bidHistory")]
    public ActionResult<CommonResult<SilentAuctionBidHistoryResponse>> GetBidHistory(string itemId)
    {
        try
        {
            // 取得當前用戶的 PaddleNum
            string userPaddleNum = _vipSvc.PaddleNum;
            if (string.IsNullOrEmpty(userPaddleNum))
            {
                return Ok(new CommonResult<SilentAuctionBidHistoryResponse>(false, null, "未找到用戶資訊"));
            }

            using var conn = DBHelper.AUCDB.Open();

            // 取得當前價格和用戶是否為最高出價者
            string currentPriceSql = @"
                SELECT
                    COALESCE(latest_bid.[BidAmount], sp.[StartPrice]) as CurrentPrice,
                    CASE WHEN latest_bid.[PaddleNum] = @UserPaddleNum THEN 1 ELSE 0 END as IsCurrentBidder
                FROM [dbo].[SilentPrize] sp
                LEFT JOIN (
                    SELECT
                        sbe.[ItemId],
                        sbe.[PaddleNum],
                        sbe.[BidAmount],
                        ROW_NUMBER() OVER (PARTITION BY sbe.[ItemId] ORDER BY sbe.[Timestamp] DESC) as rn
                    FROM [dbo].[SilentBidEvent] sbe
                    WHERE sbe.[IsValid] = 'Y'
                ) latest_bid ON sp.[ItemId] = latest_bid.[ItemId] AND latest_bid.rn = 1
                WHERE sp.[ItemId] = @ItemId";

            var currentPriceData = conn.QueryFirstOrDefault(currentPriceSql, new { ItemId = itemId, UserPaddleNum = userPaddleNum });

            if (currentPriceData == null)
            {
                return Ok(new CommonResult<SilentAuctionBidHistoryResponse>(false, null, "商品不存在"));
            }

            // 查詢競標歷程 (隱藏其他競標者身份，僅顯示當前用戶的出價)
            string sql = @"
                SELECT
                    sbe.[BidAmount],
                    sbe.[Timestamp],
                    CASE WHEN sbe.[PaddleNum] = @UserPaddleNum THEN 1 ELSE 0 END as IsMyBid,
                    CASE WHEN sbe.[IsOutbid] = 'N' AND sbe.[PaddleNum] = @UserPaddleNum THEN 1 ELSE 0 END as IsCurrentBidder
                FROM [dbo].[SilentBidEvent] sbe
                WHERE sbe.[ItemId] = @ItemId
                  AND sbe.[IsValid] = 'Y'
                  AND (sbe.[PaddleNum] = @UserPaddleNum OR sbe.[BidId] IN (
                      SELECT MAX([BidId]) FROM [dbo].[SilentBidEvent]
                      WHERE [ItemId] = @ItemId AND [IsValid] = 'Y'
                      GROUP BY [PaddleNum]
                  ))
                ORDER BY sbe.[Timestamp] DESC";

            var bidHistoryData = conn.Query<SilentAuctionPrivateBidHistoryQueryResult>(sql, new { ItemId = itemId, UserPaddleNum = userPaddleNum });

            // 僅返回用戶自己的出價記錄
            var userBidHistory = bidHistoryData.Where(b => b.IsMyBid).Select(bid => new SilentAuctionPrivateBidHistoryItem(
                Amount: bid.BidAmount,
                Timestamp: bid.Timestamp.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
            )).ToArray();

            // 取得用戶目前最高出價
            decimal? userCurrentBid = bidHistoryData.Where(b => b.IsMyBid).OrderByDescending(b => b.Timestamp).FirstOrDefault()?.BidAmount;

            var item = new SilentAuctionBidHistoryDetail(
                ItemId: itemId,
                CurrentPrice: currentPriceData.CurrentPrice,
                IsCurrentBidder: currentPriceData.IsCurrentBidder == 1,
                BidHistory: userBidHistory,
                UserCurrentBid: userCurrentBid
            );

            var result = new CommonResult<SilentAuctionBidHistoryResponse>(
                true,
                new SilentAuctionBidHistoryResponse(item),
                null);

            return Ok(result);
        }
        catch (Exception ex)
        {
            string errMsg = string.Format("Exception！{0}", ex.Message);
            _logger.LogError(ex, errMsg);
            return Ok(new CommonResult<SilentAuctionBidHistoryResponse>(false, null, errMsg));
        }
    }

    /// <summary>
    /// 提交出價
    /// 需要授權
    /// </summary>
    /// <param name="itemId">商品ID</param>
    /// <param name="request">出價請求</param>
    /// <returns>
    /// **Response:**
    /// ```json
    /// {
    ///   "success": true,
    ///   "data": {
    ///     "itemId": "string", // 商品ID
    ///     "amount": number,  //出價價格
    ///     "isHighestBid": boolean,  //是最高出價
    ///     "currentHighestBid": number,  //當前價格
    ///     "timestamp": "ISO 8601"  //出價時間
    ///   }
    /// }
    /// ```
    /// </returns>
    [Authorize(AuthenticationSchemes = "Bearer")]
    [HttpPost("items/{itemId}/bid")]
    public ActionResult<CommonResult<SilentAuctionBidResponse>> SubmitBid(string itemId, [FromBody] SilentAuctionBidRequest request)
    {
        try
        {
            // 取得當前用戶資訊
            string userPaddleNum = _vipSvc.PaddleNum;
            if (string.IsNullOrEmpty(userPaddleNum))
            {
                return Ok(new CommonResult<SilentAuctionBidResponse>(false, null, "未找到用戶資訊"));
            }

            using var conn = DBHelper.AUCDB.Open();

            // 競標提交前驗證和記錄
            decimal currentPrice = 0;
            decimal minIncrement = 0;
            string endTime = "";
            int vipExists = 0;
            int isActive = 0;
            string vipName = "";

            // 檢查商品是否還在競標中
            string checkSql = @"
                SELECT
                    COALESCE(MAX(sbe.[BidAmount]), sp.[StartPrice]) as CurrentPrice,
                    sp.[MinIncrement],
                    sp.[EndTime],
                    CASE WHEN CONVERT(TIME, GETDATE()) >= CONVERT(TIME, sp.[StartTime]) 
                        AND CONVERT(TIME, GETDATE()) <= CONVERT(TIME, sp.[EndTime]) 
                        AND sp.[Status] = 'active' THEN 1 ELSE 0 END as IsActive
                FROM [dbo].[SilentPrize] sp
                LEFT JOIN [dbo].[SilentBidEvent] sbe ON sp.[ItemId] = sbe.[ItemId] AND sbe.[IsValid] = 'Y'
                WHERE sp.[ItemId] = @ItemId
                GROUP BY sp.[StartPrice], sp.[MinIncrement], sp.[StartTime], sp.[EndTime], sp.[Status]";

            var itemStatus = conn.QueryFirstOrDefault(checkSql, new { ItemId = itemId });

            if (itemStatus == null)
            {
                return Ok(new CommonResult<SilentAuctionBidResponse>(false, null, "商品不存在"));
            }

            currentPrice = itemStatus.CurrentPrice;
            minIncrement = itemStatus.MinIncrement;
            endTime = itemStatus.EndTime;
            isActive = itemStatus.IsActive;

            // 檢查 VIP 是否存在且有效
            string vipCheckSql = "SELECT COUNT(*) AS Item1, MAX([VipName]) AS Item2 FROM [dbo].[Vip] WHERE [PaddleNum] = @PaddleNum";
            var vipInfo = conn.QueryFirstOrDefault(vipCheckSql, new { PaddleNum = userPaddleNum });
            vipExists = vipInfo?.Item1 ?? 0;
            vipName = vipInfo?.Item2 ?? "";

            // 驗證出價條件
            if (vipExists == 0)
            {
                return Ok(new CommonResult<SilentAuctionBidResponse>(false, null, "VIP 用戶不存在"));
            }

            if (isActive == 0)
            {
                return Ok(new CommonResult<SilentAuctionBidResponse>(false, null, "競標已結束或未開始"));
            }

            if (request.Amount < currentPrice + minIncrement)
            {
                return Ok(new CommonResult<SilentAuctionBidResponse>(false, null, $"出價必須高於目前最高價 {currentPrice:C} 加上最低加價 {minIncrement:C}"));
            }

            using var transaction = conn.BeginTransaction();

            try
            {
                // 標記之前的出價為被超越
                string updateOutbidSql = @"
                    UPDATE [dbo].[SilentBidEvent]
                    SET [IsOutbid] = 'Y', [OutbidTime] = GETDATE()
                    WHERE [ItemId] = @ItemId AND [IsValid] = 'Y' AND [IsOutbid] = 'N'";

                conn.Execute(updateOutbidSql, new { ItemId = itemId }, transaction);

                // 插入新的出價記錄
                string insertBidSql = @"
                    INSERT INTO [dbo].[SilentBidEvent] (
                        [ItemId], [PaddleNum], [PaddleName], [BidAmount], [PreviousHighestBid],
                        [BidType], [SessionId], [IPAddress], [Notes], [Timestamp], [IsValid], [IsOutbid]
                    ) VALUES (
                        @ItemId, @PaddleNum, @PaddleName, @BidAmount, @PreviousHighestBid,
                        'Online', @SessionId, @IPAddress, @Notes, GETDATE(), 'Y', 'N'
                    )";

                var insertParams = new
                {
                    ItemId = itemId,
                    PaddleNum = userPaddleNum,
                    PaddleName = vipName,
                    BidAmount = request.Amount,
                    PreviousHighestBid = currentPrice,
                    SessionId = "",
                    IPAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "",
                    Notes = "線上出價"
                };

                conn.Execute(insertBidSql, insertParams, transaction);

                transaction.Commit();

                var response = new SilentAuctionBidResponse(
                    ItemId: itemId,
                    Amount: request.Amount,
                    IsHighestBid: true,
                    CurrentHighestBid: request.Amount,
                    Timestamp: DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
                );

                return Ok(new CommonResult<SilentAuctionBidResponse>(true, response, null));
            }
            catch (Exception transactionEx)
            {
                _logger.LogError(transactionEx, "Transaction rollback failed");
                transaction.Rollback();
                throw;
            }
        }
        catch (Exception ex)
        {
            string errMsg = string.Format("Exception！{0}", ex.Message);
            _logger.LogError(ex, errMsg);
            return Ok(new CommonResult<SilentAuctionBidResponse>(false, null, errMsg));
        }
    }

    [AllowAnonymous]
    [HttpGet("[action]")]
    public async Task<ActionResult<CommonResult<dynamic>>> FrontUrlBase()
    {
        try
        {
            await Task.Yield();
            string frontUrlBase = _prmSvc.GetFrontWeb_PublicUrlBase();

            var result = new CommonResult<dynamic>(
                true,
                frontUrlBase,
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
    /// 手動結標所有過期的靜態拍賣商品
    /// Manual Hammer - 後台管理員手動結標所有過期商品
    /// </summary>
    /// <returns>
    /// **Response:**
    /// ```json
    /// {
    ///   "success": true,
    ///   "data": {
    ///     "hammeredCount": number,  // 成交商品數量
    ///     "passedCount": number,    // 流標商品數量
    ///     "totalCount": number,     // 總結標商品數量
    ///     "items": [
    ///       {
    ///         "itemId": "string",
    ///         "itemName": "string",
    ///         "result": "Hammered" | "Passed",
    ///         "winnerPaddleNum": "string",
    ///         "hammerPrice": number
    ///       }
    ///     ]
    ///   }
    /// }
    /// ```
    /// </returns>
    [Authorize]
    [HttpPost("[action]")]
    public ActionResult<CommonResult<SilentAuctionManualHammerResponse>> ManualHammer()
    {
        try
        {
            ClaimsIdentity userIdentity = (ClaimsIdentity)HttpContext.User.Identity!;
            var staffId = userIdentity.FindFirst(ClaimTypes.Name)?.Value;

            using var conn = DBHelper.AUCDB.Open();
            using var transaction = conn.BeginTransaction();

            try
            {
                // 查找所有已過期但未結標的商品
                string findExpiredSql = @"
                SELECT
                    sp.[ItemId],
                    sp.[Name],
                    latest_bid.[PaddleNum] as WinnerPaddleNum,
                    latest_bid.[PaddleName] as WinnerName,
                    latest_bid.[BidAmount] as HammerPrice,
                    COALESCE(bid_stats.BidCount, 0) as TotalBidCount,
                    COALESCE(bid_stats.UniqueBidders, 0) as UniqueBidderCount
                FROM [dbo].[SilentPrize] sp
                LEFT JOIN (
                    SELECT
                        sbe.[ItemId],
                        sbe.[PaddleNum],
                        sbe.[PaddleName],
                        sbe.[BidAmount],
                        ROW_NUMBER() OVER (PARTITION BY sbe.[ItemId] ORDER BY sbe.[Timestamp] DESC) as rn
                    FROM [dbo].[SilentBidEvent] sbe
                    WHERE sbe.[IsValid] = 'Y'
                ) latest_bid ON sp.[ItemId] = latest_bid.[ItemId] AND latest_bid.rn = 1
                LEFT JOIN (
                    SELECT
                        [ItemId],
                        COUNT(*) as BidCount,
                        COUNT(DISTINCT [PaddleNum]) as UniqueBidders
                    FROM [dbo].[SilentBidEvent]
                    WHERE [IsValid] = 'Y'
                    GROUP BY [ItemId]
                ) bid_stats ON sp.[ItemId] = bid_stats.[ItemId]
                WHERE CONVERT(TIME, GETDATE()) > CONVERT(TIME, sp.[EndTime])
                  AND sp.[Status] = 'active'
                  AND NOT EXISTS (SELECT 1 FROM [dbo].[SilentHammered] WHERE [ItemId] = sp.[ItemId])";

                var expiredItems = conn.Query<SilentAuctionExpiredItemResult>(findExpiredSql, transaction: transaction).ToList();

                if (expiredItems.Count == 0)
                {
                    transaction.Rollback();
                    return Ok(new CommonResult<SilentAuctionManualHammerResponse>(
                        true,
                        new SilentAuctionManualHammerResponse(0, 0, 0, Array.Empty<SilentAuctionManualHammerItem>()),
                        "沒有需要結標的商品"));
                }

                // 插入結標記錄
                string insertHammerSql = @"
                INSERT INTO [dbo].[SilentHammered] (
                    [ItemId], [AuctionResult], [WinnerPaddleNum], [WinnerName],
                    [HammerPrice], [HighestBidAmount], [TotalBidCount], [UniqueBidderCount],
                    [PassedReason], [AutoHammered], [PaymentStatus], [Notes]
                ) VALUES (
                    @ItemId,
                    @AuctionResult,
                    @WinnerPaddleNum,
                    @WinnerName,
                    @HammerPrice,
                    @HighestBidAmount,
                    @TotalBidCount,
                    @UniqueBidderCount,
                    @PassedReason,
                    'N',
                    @PaymentStatus,
                    '後台管理員手動結標'
                )";

                var hammerRecords = expiredItems.Select(item => new
                {
                    ItemId = item.ItemId,
                    AuctionResult = item.HammerPrice.HasValue && item.HammerPrice > 0 ? "Hammered" : "Passed",
                    WinnerPaddleNum = item.WinnerPaddleNum,
                    WinnerName = item.WinnerName,
                    HammerPrice = item.HammerPrice,
                    HighestBidAmount = item.HammerPrice,
                    TotalBidCount = item.TotalBidCount,
                    UniqueBidderCount = item.UniqueBidderCount,
                    PassedReason = !item.HammerPrice.HasValue || item.HammerPrice == 0 ? "NoBids" : (string?)null,
                    PaymentStatus = item.HammerPrice.HasValue && item.HammerPrice > 0 ? "Unpaid" : "NA"
                }).ToList();

                conn.Execute(insertHammerSql, hammerRecords, transaction);

                // 更新商品狀態為結束
                string updateStatusSql = @"
                UPDATE [dbo].[SilentPrize]
                SET [Status] = 'ended', [UpdatedAt] = GETUTCDATE()
                WHERE [ItemId] IN @ItemIds";

                conn.Execute(updateStatusSql, new { ItemIds = expiredItems.Select(i => i.ItemId).ToArray() }, transaction);

                transaction.Commit();

                // 準備回應資料
                var hammeredCount = hammerRecords.Count(r => r.AuctionResult == "Hammered");
                var passedCount = hammerRecords.Count(r => r.AuctionResult == "Passed");
                var items = expiredItems.Zip(hammerRecords, (item, record) => new SilentAuctionManualHammerItem(
                    ItemId: item.ItemId,
                    ItemName: item.Name,
                    Result: record.AuctionResult,
                    WinnerPaddleNum: record.WinnerPaddleNum ?? "",
                    HammerPrice: record.HammerPrice ?? 0
                )).ToArray();

                var response = new SilentAuctionManualHammerResponse(
                    HammeredCount: hammeredCount,
                    PassedCount: passedCount,
                    TotalCount: expiredItems.Count,
                    Items: items
                );

                return Ok(new CommonResult<SilentAuctionManualHammerResponse>(true, response, null));
            }
            catch (Exception transactionEx)
            {
                _logger.LogError(transactionEx, "Manual hammer transaction failed");
                transaction.Rollback();
                throw;
            }
        }
        catch (Exception ex)
        {
            string errMsg = string.Format("Exception！{0}", ex.Message);
            _logger.LogError(ex, errMsg);
            return Ok(new CommonResult<SilentAuctionManualHammerResponse>(false, null, errMsg));
        }
    }
}