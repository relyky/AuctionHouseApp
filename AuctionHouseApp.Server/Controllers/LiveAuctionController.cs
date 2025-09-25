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
    public ActionResult<CommonResult<LiveAuctionPreviewResponse>> Preview()
    {
        try
        {
            using var conn = DBHelper.AUCDB.Open();

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
                FROM [dbo].[AuctionPrize] ap
                LEFT JOIN [dbo].[AuctionHammered] ah ON ap.[ItemId] = ah.[ItemId]
                ORDER BY
                    CASE
                        WHEN ah.[AuctionResult] IS NULL THEN 1  -- Active
                        WHEN ah.[AuctionResult] = 'Hammered' THEN 2  -- Ended
                        WHEN ah.[AuctionResult] = 'Passed' THEN 3    -- Passed
                    END,
                    ap.[ItemId]";

            var queryResults = conn.Query<AuctionPreviewQueryResult>(sql);
            var items = queryResults.Select(row => new LiveAuctionItem(
                ItemId: row.ItemId,
                Name: row.Name,
                Description: row.Description,
                Image: row.Image,
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
    public ActionResult<CommonResult<LiveAuctionItemDetailResponse>> PreviewItem(string itemId)
    {
        try
        {
            using var conn = DBHelper.AUCDB.Open();

            // 查詢單一商品詳細資訊 (含結標狀態)
            string sql = @"
                SELECT
                    ap.*,
                    ah.[AuctionResult]
                FROM [dbo].[AuctionPrize] ap
                LEFT JOIN [dbo].[AuctionHammered] ah ON ap.[ItemId] = ah.[ItemId]
                WHERE ap.[ItemId] = @ItemId";

            var itemData = conn.QueryFirstOrDefault<AuctionItemDetailQueryResult>(sql, new { ItemId = itemId });

            if (itemData == null)
            {
                return Ok(new CommonResult<LiveAuctionItemDetailResponse>(false, null, "商品不存在"));
            }

            var item = new LiveAuctionItemDetail(
                ItemId: itemData.ItemId,
                Name: itemData.Name,
                Description: itemData.Description,
                Image: itemData.Image,
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
}