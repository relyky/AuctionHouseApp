# Silent Auction Database Schema

## 概述
Silent Auction（靜態拍賣）資料庫架構，支援線上競標、倒數計時、隱私競標等功能。

## 主要資料表

### 1. SilentPrize - 靜態拍賣商品表
存放所有靜態拍賣商品的基本資訊。

```sql
CREATE TABLE SilentPrize (
    [ItemId] [varchar](10) PRIMARY KEY,           -- 商品唯一識別碼
    [Name] [NVARCHAR](100) NOT NULL,               -- 商品名稱
    [Description] [NVARCHAR](500),                 -- 商品描述
    [Image] [NVARCHAR](500),                       -- 商品圖片URL
    [StartingPrice][DECIMAL](18,0) NOT NULL,      -- 起標價
    [MinIncrement] [DECIMAL](18,0) NOT NULL DEFAULT 1000, -- 最低加價金額
    [StartTime] [char](5) NOT NULL,               -- 競標開始時間
    [EndTime] [char](5) NOT NULL,                 -- 競標結束時間
    [Status] [NVARCHAR](20) NOT NULL DEFAULT 'active', -- 拍賣狀態: active, ended, passed
    [DisplayOrder] [int] DEFAULT 0,                -- 大螢幕輪播順序
    [CreatedAt] [DATETIME] DEFAULT GETUTCDATE(),   -- 建立時間
    [UpdatedAt] [DATETIME] DEFAULT GETUTCDATE(),   -- 更新時間
    [CreatedBy] [NVARCHAR](100),                   -- 建立者

    INDEX IX_SilentPrize_Status (Status),
    INDEX IX_SilentPrize_EndTime (EndTime),
    INDEX IX_SilentPrize_DisplayOrder (DisplayOrder)
);
```

### 2. SilentBidEvent - 競標事件記錄表
記錄所有線上競標歷程，與現有 VIP 和 Staff 系統整合。

```sql
CREATE TABLE [dbo].[SilentBidEvent](
    [BidId] [bigint] IDENTITY(1,1) PRIMARY KEY,     -- 競標記錄ID
    [ItemId] [varchar](10) NOT NULL,                -- 商品ID (對應 SilentPrize.ItemId)
    [PaddleNum] [varchar](10) NOT NULL,             -- 出價者號牌 (對應 Vip.PaddleNum)
    [PaddleName] [nvarchar](100) NOT NULL,          -- 出價者姓名 (對應 Vip.VipName)
    [BidAmount] [decimal](18, 0) NOT NULL,          -- 出價金額 (與系統金額格式一致)
    [PreviousHighestBid] [decimal](18, 0),          -- 前一最高出價 (追蹤競標歷程)
    [BidType] [varchar](10) NOT NULL DEFAULT 'Online', -- 出價類型: Online(線上), Staff(後台)
    [Timestamp] [datetime] NOT NULL DEFAULT GETDATE(), -- 出價時間
    [IsValid] [char](1) NOT NULL DEFAULT 'Y',       -- 是否有效: Y/N
    [IsOutbid] [char](1) NOT NULL DEFAULT 'N',      -- 是否被超越: Y/N
    [OutbidTime] [datetime] NULL,                   -- 被超越時間
    [Notes] [nvarchar](500) NULL,                   -- 備註
    [SessionId] [varchar](100) NULL,                -- 使用者Session (防重複提交)
    [IPAddress] [varchar](45) NULL,                 -- 出價者IP位址

    FOREIGN KEY ([ItemId]) REFERENCES [SilentPrize]([ItemId]) ON DELETE CASCADE,
    FOREIGN KEY ([PaddleNum]) REFERENCES [Vip]([PaddleNum]),

    INDEX IX_SilentBidEvent_ItemId ([ItemId]),
    INDEX IX_SilentBidEvent_Timestamp ([Timestamp] DESC),
    INDEX IX_SilentBidEvent_PaddleNum ([PaddleNum]),
    INDEX IX_SilentBidEvent_ItemId_Timestamp ([ItemId], [Timestamp] DESC),
    INDEX IX_SilentBidEvent_IsValid_IsOutbid ([IsValid], [IsOutbid])
);
```

### 3. SilentHammered - 結標記錄表
記錄最終結標資訊（包含流標），整合付款和交貨管理。

```sql
CREATE TABLE [dbo].[SilentHammered](
    [HammerId] [bigint] IDENTITY(1,1) PRIMARY KEY, -- 結標記錄ID
    [ItemId] [varchar](10) NOT NULL UNIQUE,        -- 商品ID (一個商品只能有一次結標)
    [AuctionResult] [varchar](10) NOT NULL,        -- 拍賣結果: Hammered(成交), Passed(流標)
    [WinnerPaddleNum] [varchar](10) NULL,          -- 得標者號牌 (對應 Vip.PaddleNum)
    [WinnerName] [nvarchar](100) NULL,             -- 得標者姓名 (對應 Vip.VipName)
    [HammerPrice] [decimal](18, 0) NULL,           -- 落槌價格 (流標時為 NULL)
    [HighestBidAmount] [decimal](18, 0) NULL,      -- 最高出價金額
    [TotalBidCount] [int] DEFAULT 0,               -- 總競標次數
    [UniqueBidderCount] [int] DEFAULT 0,           -- 不重複競標者數量
    [PassedReason] [varchar](20) NULL,             -- 流標原因: NoBids(無人出價), TimedOut(超時結標)
    [HammerDtm] [datetime] NOT NULL DEFAULT GETDATE(), -- 落槌/流標時間
    [AutoHammered] [char](1) DEFAULT 'N',          -- 是否自動結標: Y/N (時間到自動結標)
    [PaymentStatus] [varchar](10) DEFAULT 'Unpaid', -- 付款狀態: Unpaid/Partial/Paid/NA(流標)
    [PaidAmount] [decimal](18, 0) DEFAULT 0,       -- 已付金額
    [PaymentDtm] [datetime] NULL,                  -- 付款時間
    [PaymentStaff] [varchar](50) NULL,             -- 收款員工 (對應 Staff.UserId)
    [PaymentNotes] [nvarchar](500) NULL,           -- 付款備註
    [IsDelivered] [char](1) DEFAULT 'N',           -- 是否已交貨: Y/N
    [DeliveryDtm] [datetime] NULL,                 -- 交貨時間
    [DeliveryStaff] [varchar](50) NULL,            -- 交貨員工 (對應 Staff.UserId)
    [Notes] [nvarchar](500) NULL,                  -- 備註
    [CreatedDtm] [datetime] DEFAULT GETDATE(),     -- 建立時間

    FOREIGN KEY ([ItemId]) REFERENCES [SilentPrize]([ItemId]) ON DELETE CASCADE,
    FOREIGN KEY ([WinnerPaddleNum]) REFERENCES [Vip]([PaddleNum]),
    FOREIGN KEY ([PaymentStaff]) REFERENCES [Staff]([UserId]),
    FOREIGN KEY ([DeliveryStaff]) REFERENCES [Staff]([UserId]),

    -- 約束：成交時必須有得標者和價格
    CHECK (
        ([AuctionResult] = 'Hammered' AND [WinnerPaddleNum] IS NOT NULL AND [HammerPrice] IS NOT NULL) OR
        ([AuctionResult] = 'Passed' AND [WinnerPaddleNum] IS NULL AND [HammerPrice] IS NULL)
    ),

    INDEX IX_SilentHammered_Result ([AuctionResult]),
    INDEX IX_SilentHammered_Winner ([WinnerPaddleNum]),
    INDEX IX_SilentHammered_Payment ([PaymentStatus]),
    INDEX IX_SilentHammered_Time ([HammerDtm] DESC),
    INDEX IX_SilentHammered_AutoHammered ([AutoHammered])
);
```

## 系統整合架構

### 資料表關聯圖
```
慈善募款活動系統整合架構:

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Staff (員工)   │    │   Vip (貴賓)     │    │ LiveSession     │
│  - UserId       │    │  - PaddleNum    │    │ (即時狀態)       │
│  - RoleList     │    │  - VipName      │    │  - StateName    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Silent Auction 靜態拍賣系統                   │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   SilentPrize   │ SilentBidEvent  │      SilentHammered         │
│  - ItemId (PK)  │  - BidId (PK)   │      - HammerId (PK)        │
│  - Name         │  - ItemId (FK)  │      - ItemId (FK)          │
│  - StartPrice   │  - PaddleNum(FK)│      - WinnerPaddleNum(FK)  │
│  - MinIncrement │  - BidAmount    │      - PaymentStaff(FK)     │
│  - EndTime      │  - IsOutbid     │      - AutoHammered         │
└─────────────────┴─────────────────┴─────────────────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │

關聯說明:
- SilentPrize (1) ←→ (N) SilentBidEvent
- SilentPrize (1) ←→ (1) SilentHammered
- Vip.PaddleNum ←→ SilentBidEvent.PaddleNum
- Vip.PaddleNum ←→ SilentHammered.WinnerPaddleNum
- Staff.UserId ←→ SilentHammered.PaymentStaff
```

## 主要功能對應

### 整合 LiveSession 狀態管理
```sql
-- 與現有 LiveSession 表整合，管理靜態拍賣即時狀態
-- 使用現有的狀態參數架構

-- 使用現有的 DisplayCurrentMode 來管理顯示狀態
-- 設定為 'silentAuction' 表示進入靜態拍賣模式
UPDATE [dbo].[LiveSession]
SET [StringValue] = 'silentAuction'
WHERE [StateName] = 'DisplayCurrentMode';

-- 輪播設定：直接在大螢幕程式中寫死
-- carouselInterval: 10秒 (程式常數)
-- autoPlay: true (程式常數)
```

### 建立最高出價 View
```sql
-- 建立最高出價 View，供多個查詢重複使用
CREATE VIEW [dbo].[vw_SilentLatestBid] AS
SELECT
    [ItemId],
    [PaddleNum],
    [PaddleName],
    [BidAmount],
    [Timestamp],
    [IsOutbid],
    ROW_NUMBER() OVER (PARTITION BY [ItemId] ORDER BY [Timestamp] DESC) as rn
FROM [dbo].[SilentBidEvent]
WHERE [IsValid] = 'Y';
```

### 競標狀態檢查函數
```sql
-- 檢查商品競標狀態的函數
CREATE FUNCTION [dbo].[CheckSilentAuctionStatus](@ItemId VARCHAR(10))
RETURNS TABLE
AS
RETURN
(
    SELECT
        sp.[ItemId],
        sp.[Name],
        sp.[StartingPrice],
        sp.[MinIncrement],
        sp.[EndTime],
        COALESCE(lb.[BidAmount], sp.[StartingPrice]) as CurrentPrice,
        lb.[PaddleNum] as CurrentBidderPaddle,
        lb.[PaddleName] as CurrentBidderName,
        lb.[Timestamp] as LastBidTime,
        CASE
            WHEN GETDATE() > sp.[EndTime] THEN 'ended'
            WHEN GETDATE() < sp.[StartTime] THEN 'upcoming'
            ELSE 'active'
        END as TimeStatus,
        DATEDIFF(SECOND, GETDATE(), sp.[EndTime]) as TimeRemaining,
        COALESCE(bid_count.BidCount, 0) as TotalBids,
        CASE WHEN sh.[ItemId] IS NOT NULL THEN 1 ELSE 0 END as IsHammered
    FROM [dbo].[SilentPrize] sp
    LEFT JOIN [dbo].[vw_SilentLatestBid] lb ON sp.[ItemId] = lb.[ItemId] AND lb.rn = 1
    LEFT JOIN [dbo].[SilentHammered] sh ON sp.[ItemId] = sh.[ItemId]
    LEFT JOIN (
        SELECT [ItemId], COUNT(*) as BidCount
        FROM [dbo].[SilentBidEvent]
        WHERE [IsValid] = 'Y'
        GROUP BY [ItemId]
    ) bid_count ON sp.[ItemId] = bid_count.[ItemId]
    WHERE sp.[ItemId] = @ItemId
);
```

### API 端點對應的資料操作

#### 1. `/api/silentauction/items` - 取得商品清單
```sql
-- 查詢所有商品清單 (整合最高出價資訊)
SELECT
    sp.[ItemId],
    sp.[Name],
    sp.[Description],
    sp.[Image],
    sp.[StartingPrice],
    sp.[MinIncrement],
    sp.[EndTime],
    COALESCE(latest_bid.[BidAmount], sp.[StartingPrice]) as CurrentPrice,
    latest_bid.[PaddleNum] as CurrentBidderPaddle,
    latest_bid.[PaddleName] as CurrentBidderName,
    CASE
        WHEN sh.[ItemId] IS NOT NULL THEN sh.[AuctionResult]
        WHEN GETDATE() > sp.[EndTime] THEN 'ended'
        WHEN GETDATE() < sp.[StartTime] THEN 'upcoming'
        ELSE 'active'
    END as Status,
    DATEDIFF(SECOND, GETDATE(), sp.[EndTime]) as TimeRemaining,
    bid_count.BidCount,
    sp.[DisplayOrder]
FROM [dbo].[SilentPrize] sp
LEFT JOIN [dbo].[vw_SilentLatestBid] latest_bid ON sp.[ItemId] = latest_bid.[ItemId] AND latest_bid.rn = 1
LEFT JOIN [dbo].[SilentHammered] sh ON sp.[ItemId] = sh.[ItemId]
LEFT JOIN (
    SELECT [ItemId], COUNT(*) as BidCount
    FROM [dbo].[SilentBidEvent]
    WHERE [IsValid] = 'Y'
    GROUP BY [ItemId]
) bid_count ON sp.[ItemId] = bid_count.[ItemId]
ORDER BY
    CASE WHEN sh.[AuctionResult] IS NULL AND GETDATE() <= sp.[EndTime] THEN 1 ELSE 2 END,
    sp.[DisplayOrder],
    sp.[ItemId];
```

#### 2. `/api/silentauction/items/{itemId}` - 取得指定商品詳情
```sql
-- 查詢單一商品詳細資訊 (含競標歷程和時間狀態)
SELECT
    sp.*,
    COALESCE(latest_bid.[BidAmount], sp.[StartingPrice]) as CurrentPrice,
    latest_bid.[PaddleNum] as CurrentBidderPaddle,
    latest_bid.[PaddleName] as CurrentBidderName,
    latest_bid.[Timestamp] as LastBidTime,
    CASE
        WHEN sh.[ItemId] IS NOT NULL THEN sh.[AuctionResult]
        WHEN GETDATE() > sp.[EndTime] THEN 'ended'
        WHEN GETDATE() < sp.[StartTime] THEN 'upcoming'
        ELSE 'active'
    END as Status,
    DATEDIFF(SECOND, GETDATE(), sp.[EndTime]) as TimeRemaining,
    bid_count.BidCount,
    bid_count.UniqueBidders,
    sh.[WinnerPaddleNum],
    sh.[WinnerName],
    sh.[HammerPrice],
    sh.[PaymentStatus]
FROM [dbo].[SilentPrize] sp
LEFT JOIN [dbo].[vw_SilentLatestBid] latest_bid ON sp.[ItemId] = latest_bid.[ItemId] AND latest_bid.rn = 1
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
WHERE sp.[ItemId] = @ItemId;
```

#### 3. `/api/silentauction/items/{itemId}/bidHistory` - 取得競標歷程
```sql
-- 查詢競標歷程 (隱藏其他競標者身份，僅顯示當前用戶的出價)
SELECT
    sbe.[BidAmount],
    sbe.[Timestamp],
    CASE WHEN sbe.[PaddleNum] = @UserPaddleNum THEN 'Y' ELSE 'N' END as IsMyBid,
    CASE WHEN sbe.[IsOutbid] = 'N' AND sbe.[PaddleNum] = @UserPaddleNum THEN 'Y' ELSE 'N' END as IsCurrentBidder
FROM [dbo].[SilentBidEvent] sbe
WHERE sbe.[ItemId] = @ItemId
  AND sbe.[IsValid] = 'Y'
  AND (sbe.[PaddleNum] = @UserPaddleNum OR sbe.[BidId] IN (
      SELECT MAX([BidId]) FROM [dbo].[SilentBidEvent]
      WHERE [ItemId] = @ItemId AND [IsValid] = 'Y'
      GROUP BY [PaddleNum]
  ))
ORDER BY sbe.[Timestamp] DESC;
```

### 後台管理功能

#### 1. 線上競標處理 (用戶提交出價)
```sql
-- 競標提交前驗證和記錄
DECLARE @CurrentPrice DECIMAL(18,0), @MinIncrement DECIMAL(18,0), @EndTime DATETIME;
DECLARE @VipExists INT, @IsActive INT;

-- 檢查商品是否還在競標中
SELECT @CurrentPrice = COALESCE(MAX(sbe.[BidAmount]), sp.[StartingPrice]),
       @MinIncrement = sp.[MinIncrement],
       @EndTime = sp.[EndTime],
       @IsActive = CASE WHEN GETDATE() <= sp.[EndTime] AND sp.[Status] = 'active' THEN 1 ELSE 0 END
FROM [dbo].[SilentPrize] sp
LEFT JOIN [dbo].[SilentBidEvent] sbe ON sp.[ItemId] = sbe.[ItemId] AND sbe.[IsValid] = 'Y'
WHERE sp.[ItemId] = @ItemId
GROUP BY sp.[StartingPrice], sp.[MinIncrement], sp.[EndTime], sp.[Status];

-- 檢查 VIP 是否存在且有效
SELECT @VipExists = COUNT(*) FROM [dbo].[Vip] WHERE [PaddleNum] = @PaddleNum;

-- 驗證通過後插入競標記錄
IF @VipExists > 0 AND @IsActive = 1 AND @BidAmount >= @CurrentPrice + @MinIncrement
BEGIN
    -- 標記之前的出價為被超越
    UPDATE [dbo].[SilentBidEvent]
    SET [IsOutbid] = 'Y', [OutbidTime] = GETDATE()
    WHERE [ItemId] = @ItemId AND [IsValid] = 'Y' AND [IsOutbid] = 'N';

    -- 插入新的出價記錄
    INSERT INTO [dbo].[SilentBidEvent] (
        [ItemId], [PaddleNum], [PaddleName], [BidAmount], [PreviousHighestBid],
        [BidType], [SessionId], [IPAddress], [Notes]
    )
    SELECT @ItemId, @PaddleNum, v.[VipName], @BidAmount, @CurrentPrice,
           'Online', @SessionId, @IPAddress, @Notes
    FROM [dbo].[Vip] v WHERE v.[PaddleNum] = @PaddleNum;
END
```

#### 2. 自動結標處理 (時間到期)
```sql
-- 自動結標處理 - 時間到期後自動執行
CREATE PROCEDURE [dbo].[AutoHammerExpiredSilentAuctions]
AS
BEGIN
    -- 查找所有已過期但未結標的商品
    INSERT INTO [dbo].[SilentHammered] (
        [ItemId], [AuctionResult], [WinnerPaddleNum], [WinnerName],
        [HammerPrice], [HighestBidAmount], [TotalBidCount], [UniqueBidderCount],
        [PassedReason], [AutoHammered], [PaymentStatus], [Notes]
    )
    SELECT
        sp.[ItemId],
        CASE WHEN latest_bid.[BidAmount] IS NOT NULL THEN 'Hammered' ELSE 'Passed' END as AuctionResult,
        latest_bid.[PaddleNum] as WinnerPaddleNum,
        latest_bid.[PaddleName] as WinnerName,
        latest_bid.[BidAmount] as HammerPrice,
        latest_bid.[BidAmount] as HighestBidAmount,
        COALESCE(bid_stats.BidCount, 0) as TotalBidCount,
        COALESCE(bid_stats.UniqueBidders, 0) as UniqueBidderCount,
        CASE WHEN latest_bid.[BidAmount] IS NULL THEN 'NoBids' ELSE NULL END as PassedReason,
        'Y' as AutoHammered,
        CASE WHEN latest_bid.[BidAmount] IS NOT NULL THEN 'Unpaid' ELSE 'NA' END as PaymentStatus,
        '系統自動結標 - 競標時間已結束'
    FROM [dbo].[SilentPrize] sp
    LEFT JOIN [dbo].[vw_SilentLatestBid] latest_bid ON sp.[ItemId] = latest_bid.[ItemId] AND latest_bid.rn = 1
    LEFT JOIN (
        SELECT
            [ItemId],
            COUNT(*) as BidCount,
            COUNT(DISTINCT [PaddleNum]) as UniqueBidders
        FROM [dbo].[SilentBidEvent]
        WHERE [IsValid] = 'Y'
        GROUP BY [ItemId]
    ) bid_stats ON sp.[ItemId] = bid_stats.[ItemId]
    WHERE GETDATE() > sp.[EndTime]
      AND sp.[Status] = 'active'
      AND NOT EXISTS (SELECT 1 FROM [dbo].[SilentHammered] WHERE [ItemId] = sp.[ItemId]);

    -- 更新商品狀態為結束
    UPDATE [dbo].[SilentPrize]
    SET [Status] = 'ended', [UpdatedAt] = GETUTCDATE()
    WHERE GETDATE() > [EndTime] AND [Status] = 'active';
END;
```

#### 3. 手動結標處理 (後台強制結標)
```sql
-- 手動結標處理 - 後台管理員強制結標
INSERT INTO [dbo].[SilentHammered] (
    [ItemId], [AuctionResult], [WinnerPaddleNum], [WinnerName],
    [HammerPrice], [HighestBidAmount], [TotalBidCount], [UniqueBidderCount],
    [AutoHammered], [PaymentStatus], [Notes]
)
SELECT
    @ItemId,
    CASE WHEN latest_bid.[BidAmount] IS NOT NULL THEN 'Hammered' ELSE 'Passed' END,
    latest_bid.[PaddleNum],
    latest_bid.[PaddleName],
    latest_bid.[BidAmount],
    latest_bid.[BidAmount],
    COALESCE(bid_stats.BidCount, 0),
    COALESCE(bid_stats.UniqueBidders, 0),
    'N',
    CASE WHEN latest_bid.[BidAmount] IS NOT NULL THEN 'Unpaid' ELSE 'NA' END,
    '後台管理員手動結標'
FROM [dbo].[vw_SilentLatestBid] latest_bid
LEFT JOIN (
    SELECT
        [ItemId],
        COUNT(*) as BidCount,
        COUNT(DISTINCT [PaddleNum]) as UniqueBidders
    FROM [dbo].[SilentBidEvent]
    WHERE [ItemId] = @ItemId AND [IsValid] = 'Y'
    GROUP BY [ItemId]
) bid_stats ON latest_bid.[ItemId] = bid_stats.[ItemId]
WHERE latest_bid.[ItemId] = @ItemId AND latest_bid.rn = 1;

-- 更新商品狀態
UPDATE [dbo].[SilentPrize] SET [Status] = 'ended', [UpdatedAt] = GETUTCDATE() WHERE [ItemId] = @ItemId;
```

## 索引策略

### 主要查詢模式優化
- `SilentBidEvent`: 依商品和時間排序的競標歷程查詢，使用複合索引優化最新出價查詢
- `SilentHammered`: 得標者和付款狀態查詢
- `vw_SilentLatestBid`: 透過 View 封裝最新出價邏輯，提供統一的查詢介面

### 效能考量
- 使用適當的索引配置支援大螢幕的輪播查詢 (每10秒)
- 透過 `vw_SilentLatestBid` View 統一最新出價查詢邏輯，提升查詢效能和可維護性
- 透過 ROW_NUMBER() 視窗函數快速取得最新出價
- 使用時間範圍索引支援倒數計時功能

### View 建議索引
```sql
-- 為 vw_SilentLatestBid View 的底層表建立複合索引，優化效能
CREATE INDEX IX_SilentBidEvent_ItemId_Valid_Timestamp
ON [dbo].[SilentBidEvent] ([ItemId], [IsValid], [Timestamp] DESC);

-- 支援時間範圍查詢的索引
CREATE INDEX IX_SilentPrize_EndTime_Status
ON [dbo].[SilentPrize] ([EndTime], [Status]);

-- 支援出價者查詢的複合索引
CREATE INDEX IX_SilentBidEvent_PaddleNum_ItemId_Outbid
ON [dbo].[SilentBidEvent] ([PaddleNum], [ItemId], [IsOutbid]);
```

## 資料完整性

### 約束條件
- 每個商品只能有一個結標記錄（包含成交或流標）
- 出價金額必須大於當前最高價 + 最低加價金額
- 競標時間必須在商品的開始和結束時間之間
- 成交時必須有得標者和落槌價格
- 流標時不能有得標者和落槌價格

### 觸發器建議
```sql
-- 確保出價金額遞增的觸發器
CREATE TRIGGER TR_SilentBidEvent_ValidateBid
ON [dbo].[SilentBidEvent]
AFTER INSERT
AS
BEGIN
    DECLARE @ItemId VARCHAR(10), @BidAmount DECIMAL(18,0), @CurrentPrice DECIMAL(18,0), @StartingPrice DECIMAL(18,0), @MinIncrement DECIMAL(18,0);
    DECLARE @EndTime DATETIME;

    SELECT @ItemId = ItemId, @BidAmount = BidAmount FROM inserted;

    -- 取得商品資訊
    SELECT @StartingPrice = StartingPrice, @MinIncrement = MinIncrement, @EndTime = EndTime
    FROM SilentPrize WHERE ItemId = @ItemId;

    -- 取得當前最高價
    SELECT @CurrentPrice = COALESCE(MAX(BidAmount), @StartingPrice)
    FROM SilentBidEvent
    WHERE ItemId = @ItemId AND IsValid = 'Y' AND BidId NOT IN (SELECT BidId FROM inserted);

    -- 驗證出價規則
    IF @BidAmount < @CurrentPrice + @MinIncrement
    BEGIN
        RAISERROR('出價金額必須高於當前最高價加上最低加價金額', 16, 1);
        ROLLBACK TRANSACTION;
    END

    -- 驗證競標時間
    IF GETDATE() > @EndTime
    BEGIN
        RAISERROR('競標時間已結束', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
```

## 通知機制設計

### 出價被超越通知
```sql
-- 建立出價被超越的通知記錄
CREATE TABLE [dbo].[SilentBidNotification](
    [NotificationId] [bigint] IDENTITY(1,1) PRIMARY KEY,
    [PaddleNum] [varchar](10) NOT NULL,              -- 被通知的用戶
    [ItemId] [varchar](10) NOT NULL,                 -- 商品ID
    [ItemName] [nvarchar](100) NOT NULL,             -- 商品名稱
    [YourBid] [decimal](18, 0) NOT NULL,             -- 用戶的出價
    [NewHighestBid] [decimal](18, 0) NOT NULL,       -- 新的最高價
    [NewHighestBidder] [varchar](10) NOT NULL,       -- 新的最高出價者
    [Timestamp] [datetime] NOT NULL DEFAULT GETDATE(), -- 通知時間
    [IsRead] [char](1) NOT NULL DEFAULT 'N',         -- 是否已讀
    [ReadTime] [datetime] NULL,                      -- 已讀時間

    FOREIGN KEY ([PaddleNum]) REFERENCES [Vip]([PaddleNum]),
    FOREIGN KEY ([ItemId]) REFERENCES [SilentPrize]([ItemId]),

    INDEX IX_SilentBidNotification_PaddleNum_Read ([PaddleNum], [IsRead]),
    INDEX IX_SilentBidNotification_Timestamp ([Timestamp] DESC)
);
```

### 自動通知觸發器
```sql
-- 出價時自動產生被超越通知
CREATE TRIGGER TR_SilentBidEvent_GenerateNotification
ON [dbo].[SilentBidEvent]
AFTER INSERT
AS
BEGIN
    -- 為被超越的用戶產生通知
    INSERT INTO [dbo].[SilentBidNotification] (
        [PaddleNum], [ItemId], [ItemName], [YourBid], [NewHighestBid], [NewHighestBidder]
    )
    SELECT
        prev_bid.[PaddleNum],
        i.[ItemId],
        sp.[Name],
        prev_bid.[BidAmount],
        i.[BidAmount],
        i.[PaddleNum]
    FROM inserted i
    INNER JOIN [dbo].[SilentPrize] sp ON i.[ItemId] = sp.[ItemId]
    INNER JOIN [dbo].[SilentBidEvent] prev_bid ON i.[ItemId] = prev_bid.[ItemId]
        AND prev_bid.[IsOutbid] = 'Y'
        AND prev_bid.[OutbidTime] = (SELECT MAX([OutbidTime]) FROM [dbo].[SilentBidEvent]
                                    WHERE [ItemId] = i.[ItemId] AND [IsOutbid] = 'Y')
    WHERE prev_bid.[PaddleNum] != i.[PaddleNum]; -- 不通知自己
END;
```

## 系統整合完成度

### 與現有模組的整合優勢
1. **統一認證體系**: 使用既有的 `Vip` 表的號牌系統，無需重複建立競標者資料
2. **員工權限管理**: 透過 `Staff` 表管理付款和交貨員工權限
3. **即時狀態管理**: 透過 `LiveSession` 表管理輪播設定和顯示模式
4. **資料格式一致**: 採用與系統其他表格相同的欄位類型和命名規範
5. **隱私保護**: 競標過程中隱藏其他競標者身份，僅在結標後公開得標者
6. **自動化結標**: 支援時間到期自動結標，減少人工介入

### 技術架構特色
- **金額格式**: 使用 `DECIMAL(18,0)` 與系統其他金額欄位保持一致
- **時間管理**: 支援開始/結束時間控制，自動處理過期商品
- **競標追蹤**: 透過 `IsOutbid` 和 `OutbidTime` 追蹤競標被超越狀態
- **通知機制**: 內建出價被超越通知系統
- **批次處理**: 支援自動結標批次處理程序

### 與慈善活動整體流程整合
```
慈善募款活動完整流程:
1. VIP 報到 → Vip 表
2. 抽獎活動 → Raffle* 系列表
3. 現場拍賣 → AuctionPrize + AuctionBidLog + AuctionHammered
4. 靜態拍賣 → SilentPrize + SilentBidEvent + SilentHammered
5. 募款活動 → OpenAsk 相關表
6. 贈品發放 → GivePrize 表
7. 員工管理 → Staff 表 (橫跨所有模組)
8. 系統參數 → SysParameter 表 (系統設定)
9. 即時狀態 → LiveSession 表 (大螢幕顯示)
```

### 效能與擴展性考量
- 使用 `vw_SilentLatestBid` View 統一最新競標查詢邏輯，提升維護性
- 使用視窗函數 (`ROW_NUMBER()`) 優化最新競標查詢
- 建立適當索引支援大螢幕輪播和用戶查詢需求
- 輪播設定直接在大螢幕程式中寫死，確保穩定運行
- 支援未來擴展手機推播通知功能
- 自動化結標程序，提升系統可靠性

### 資料完整性保證
- 外鍵約束確保 VIP 和員工資料一致性
- CHECK 約束防止無效的結標狀態組合
- 競標金額遞增和時間驗證機制
- 觸發器保證通知及時產生
- 完整的審計追蹤記錄

### Silent Auction 特殊功能
1. **隱私競標**: 競標過程中不顯示其他競標者身份
2. **時間管理**: 自動倒數計時和到期結標
3. **輪播展示**: 大螢幕商品輪播顯示功能
4. **智慧通知**: 出價被超越即時通知系統
5. **批次結標**: 支援多商品同時到期的批次處理
6. **QR Code 整合**: 每個商品可生成獨立 QR Code 供現場掃描競標