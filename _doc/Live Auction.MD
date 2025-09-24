# Live Auction Database Schema

## 概述
Live Auction（現場拍賣）資料庫架構，支援即時拍賣、競標記錄、結標管理等功能。

## 主要資料表

### 1. AuctionPrize - 拍賣商品表
存放所有拍賣商品的基本資訊。

```sql
CREATE TABLE AuctionPrize (
    [ItemId] [varchar](10) PRIMARY KEY,           -- 商品唯一識別碼
    [Name] [NVARCHAR](100) NOT NULL,               -- 商品名稱
    [Description] [NVARCHAR](500),                 -- 商品描述
    [Image] [NVARCHAR](500),                       -- 商品圖片URL
    [StartingPrice][DECIMAL](18,0) NOT NULL,      -- 起標價
    [ReservePrice] [DECIMAL](18,0),                -- 底價
    [Status] [NVARCHAR](20) NOT NULL DEFAULT '', -- 拍賣狀態: active, ended, passed
    [CreatedAt] [DATETIME] DEFAULT GETUTCDATE(),  -- 建立時間
    [UpdatedAt] [DATETIME] DEFAULT GETUTCDATE(),  -- 更新時間
    [CreatedBy] [NVARCHAR](100),                   -- 建立者

    INDEX IX_AuctionPrize_Status (Status)
);
```

### 2. AuctionBidLog - 競標記錄表
記錄所有的競標歷程，與現有 VIP 和 Staff 系統整合。

```sql
CREATE TABLE [dbo].[AuctionBidLog](
    [BidId] [bigint] IDENTITY(1,1) PRIMARY KEY,     -- 競標記錄ID
    [ItemId] [varchar](10) NOT NULL,                -- 商品ID (對應 AuctionPrize.ItemId)
    [PaddleNum] [varchar](10) NOT NULL,             -- 出價者號牌 (對應 Vip.PaddleNum)
    [PaddleName] [nvarchar](100) NOT NULL,          -- 出價者姓名 (對應 Vip.VipName)
    [BidAmount] [decimal](18, 0) NOT NULL,          -- 出價金額 (與系統金額格式一致)
    [BidType] [varchar](10) NOT NULL DEFAULT 'Live', -- 出價類型: Live(現場), Online(線上)
    [Timestamp] [datetime] NOT NULL DEFAULT GETDATE(), -- 出價時間
    [IsValid] [char](1) NOT NULL DEFAULT 'Y',       -- 是否有效: Y/N
    [Notes] [nvarchar](500) NULL,                   -- 備註
    [RecordStaff] [varchar](50) NOT NULL,           -- 記錄員工 (對應 Staff.UserId)
    [ConfirmStaff] [varchar](50) NULL,              -- 確認員工 (雙重確認機制)
    [Status] [varchar](10) NOT NULL DEFAULT 'Pending', -- 狀態: Pending/Confirmed/Rejected

    FOREIGN KEY ([ItemId]) REFERENCES [AuctionPrize]([ItemId]) ON DELETE CASCADE,
    FOREIGN KEY ([PaddleNum]) REFERENCES [Vip]([PaddleNum]),
    FOREIGN KEY ([RecordStaff]) REFERENCES [Staff]([UserId]),
    FOREIGN KEY ([ConfirmStaff]) REFERENCES [Staff]([UserId]),

    INDEX IX_AuctionBidLog_ItemId ([ItemId]),
    INDEX IX_AuctionBidLog_Timestamp ([Timestamp] DESC),
    INDEX IX_AuctionBidLog_PaddleNum ([PaddleNum]),
    INDEX IX_AuctionBidLog_Status ([Status])
);
```

### 3. AuctionHammered - 結標記錄表
記錄最終結標資訊（包含流標），整合付款和交貨管理。

```sql
CREATE TABLE [dbo].[AuctionHammered](
    [HammerId] [bigint] IDENTITY(1,1) PRIMARY KEY, -- 結標記錄ID
    [ItemId] [varchar](10) NOT NULL UNIQUE,        -- 商品ID (一個商品只能有一次結標)
    [AuctionResult] [varchar](10) NOT NULL,        -- 拍賣結果: Hammered(成交), Passed(流標)
    [WinnerPaddleNum] [varchar](10) NULL,          -- 得標者號牌 (對應 Vip.PaddleNum)
    [WinnerName] [nvarchar](100) NULL,             -- 得標者姓名 (對應 Vip.VipName)
    [HammerPrice] [decimal](18, 0) NULL,           -- 落槌價格 (流標時為 NULL)
    [HighestBidAmount] [decimal](18, 0) NULL,      -- 最高出價金額
    [PassedReason] [varchar](20) NULL,             -- 流標原因: NoBids(無人出價), BelowReserve(未達底價)
    [HammerDtm] [datetime] NOT NULL DEFAULT GETDATE(), -- 落槌/流標時間
    [AuctioneerStaff] [varchar](50) NOT NULL,      -- 拍賣官 (對應 Staff.UserId)
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

    FOREIGN KEY ([ItemId]) REFERENCES [AuctionPrize]([ItemId]) ON DELETE CASCADE,
    FOREIGN KEY ([WinnerPaddleNum]) REFERENCES [Vip]([PaddleNum]),
    FOREIGN KEY ([AuctioneerStaff]) REFERENCES [Staff]([UserId]),
    FOREIGN KEY ([PaymentStaff]) REFERENCES [Staff]([UserId]),
    FOREIGN KEY ([DeliveryStaff]) REFERENCES [Staff]([UserId]),

    -- 約束：成交時必須有得標者和價格
    CHECK (
        ([AuctionResult] = 'Hammered' AND [WinnerPaddleNum] IS NOT NULL AND [HammerPrice] IS NOT NULL) OR
        ([AuctionResult] = 'Passed' AND [WinnerPaddleNum] IS NULL AND [HammerPrice] IS NULL)
    ),

    INDEX IX_AuctionHammered_Result ([AuctionResult]),
    INDEX IX_AuctionHammered_Winner ([WinnerPaddleNum]),
    INDEX IX_AuctionHammered_Payment ([PaymentStatus]),
    INDEX IX_AuctionHammered_Time ([HammerDtm] DESC)
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
│                    Live Auction 現場拍賣系統                     │
├─────────────────┬─────────────────┬─────────────────────────────┤
│  AuctionPrize   │  AuctionBidLog  │      AuctionHammered        │
│  - ItemId (PK)  │  - BidId (PK)   │      - HammerId (PK)        │
│  - Name         │  - ItemId (FK)  │      - ItemId (FK)          │
│  - StartPrice   │  - PaddleNum(FK)│      - WinnerPaddleNum(FK)  │
│  - ReservePrice │  - RecordStaff  │      - AuctioneerStaff(FK)  │
└─────────────────┴─────────────────┴─────────────────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │

關聯說明:
- AuctionPrize (1) ←→ (N) AuctionBidLog
- AuctionPrize (1) ←→ (1) AuctionHammered
- Vip.PaddleNum ←→ AuctionBidLog.PaddleNum
- Vip.PaddleNum ←→ AuctionHammered.WinnerPaddleNum
- Staff.UserId ←→ AuctionBidLog.RecordStaff
- Staff.UserId ←→ AuctionHammered.AuctioneerStaff
```

## 主要功能對應

### 整合 LiveSession 狀態管理
```sql
-- 與現有 LiveSession 表整合，管理拍賣即時狀態
-- 使用現有的狀態參數架構

-- 使用現有的 DisplayCurrentItemId 來管理當前拍賣商品
-- 當切換到現場拍賣模式時，更新商品ID
UPDATE [dbo].[LiveSession]
SET [StringValue] = @CurrentAuctionItemId
WHERE [StateName] = 'DisplayCurrentItemId';

-- 使用現有的 DisplayCurrentMode 來管理拍賣狀態
-- 設定為 'liveAuction' 表示進入現場拍賣模式
UPDATE [dbo].[LiveSession]
SET [StringValue] = 'liveAuction'
WHERE [StateName] = 'DisplayCurrentMode';

-- 拍賣狀態直接從資料表查詢，無需額外維護 LiveSession 參數
-- LiveAuctionCurrentPrice: 直接從 AuctionBidLog 查詢最新出價
-- LiveAuctionCurrentBidder: 直接從 AuctionBidLog 查詢最新出價者
-- LiveAuctionStatus: 直接從 AuctionPrize.Status 欄位查詢商品狀態
```

### 建立 Latest Bid View
```sql
-- 建立最新出價 View，供多個查詢重複使用
CREATE VIEW [dbo].[vw_LatestBid] AS
SELECT
    [ItemId],
    [PaddleNum],
    [PaddleName],
    [BidAmount],
    [Timestamp],
    ROW_NUMBER() OVER (PARTITION BY [ItemId] ORDER BY [Timestamp] DESC) as rn
FROM [dbo].[AuctionBidLog]
WHERE [IsValid] = 'Y' AND [Status] = 'Confirmed';
```

### 流標檢查函數
```sql
-- 檢查是否應該流標的函數 (使用 View 簡化查詢)
CREATE FUNCTION [dbo].[CheckShouldPass](@ItemId VARCHAR(10))
RETURNS TABLE
AS
RETURN
(
    SELECT
        ap.[ItemId],
        ap.[ReservePrice],
        COALESCE(lb.[BidAmount], 0) as HighestBid,
        COALESCE(bid_count.BidCount, 0) as BidCount,
        CASE
            WHEN COALESCE(bid_count.BidCount, 0) = 0 THEN 'NoBids'
            WHEN ap.[ReservePrice] IS NOT NULL AND lb.[BidAmount] < ap.[ReservePrice] THEN 'BelowReserve'
            ELSE 'ShouldHammer'
        END as Recommendation
    FROM [dbo].[AuctionPrize] ap
    LEFT JOIN [dbo].[vw_LatestBid] lb ON ap.[ItemId] = lb.[ItemId] AND lb.rn = 1
    LEFT JOIN (
        SELECT [ItemId], COUNT(*) as BidCount
        FROM [dbo].[AuctionBidLog]
        WHERE [IsValid] = 'Y' AND [Status] = 'Confirmed'
        GROUP BY [ItemId]
    ) bid_count ON ap.[ItemId] = bid_count.[ItemId]
    WHERE ap.[ItemId] = @ItemId
);
```

### API 端點對應的資料操作

#### 1. `/api/liveauction/preview` - 取得拍賣商品預覽
```sql
-- 查詢所有商品預覽 (整合 VIP 和員工資訊)
SELECT
    ap.[ItemId],
    ap.[Name],
    ap.[Description],
    ap.[Image],
    ap.[StartPrice],
    ap.[ReservePrice],
    COALESCE(latest_bid.[BidAmount], ap.[StartPrice]) as CurrentPrice,
    latest_bid.[PaddleName] as CurrentBidder,
    CASE
        WHEN ah.[ItemId] IS NOT NULL THEN ah.[AuctionResult]
        ELSE 'Active'
    END as Status,
    bid_count.BidCount
FROM [dbo].[AuctionPrize] ap
LEFT JOIN [dbo].[vw_LatestBid] latest_bid ON ap.[ItemId] = latest_bid.[ItemId] AND latest_bid.rn = 1
LEFT JOIN [dbo].[AuctionHammered] ah ON ap.[ItemId] = ah.[ItemId]
LEFT JOIN (
    SELECT [ItemId], COUNT(*) as BidCount
    FROM [dbo].[AuctionBidLog]
    WHERE [IsValid] = 'Y' AND [Status] = 'Confirmed'
    GROUP BY [ItemId]
) bid_count ON ap.[ItemId] = bid_count.[ItemId]
ORDER BY
    CASE
        WHEN ah.[AuctionResult] IS NULL THEN 1  -- Active
        WHEN ah.[AuctionResult] = 'Hammered' THEN 2  -- Ended
        WHEN ah.[AuctionResult] = 'Passed' THEN 3    -- Passed
    END,
    ap.[ItemId];
```

#### 2. `/api/liveauction/preview/{itemId}` - 取得指定商品詳情
```sql
-- 查詢單一商品詳細資訊 (含 VIP 資訊和結標狀態)
SELECT
    ap.*,
    COALESCE(latest_bid.[BidAmount], ap.[StartPrice]) as CurrentPrice,
    latest_bid.[PaddleNum] as CurrentBidderPaddle,
    latest_bid.[PaddleName] as CurrentBidderName,
    v.[VipEmail],
    v.[VipPhone],
    v.[TableNumber],
    bid_count.BidCount,
    ah.[AuctionResult],
    ah.[WinnerPaddleNum],
    ah.[WinnerName],
    ah.[HammerPrice],
    ah.[PassedReason],
    ah.[PaymentStatus]
FROM [dbo].[AuctionPrize] ap
LEFT JOIN [dbo].[vw_LatestBid] latest_bid ON ap.[ItemId] = latest_bid.[ItemId] AND latest_bid.rn = 1
LEFT JOIN [dbo].[Vip] v ON latest_bid.[PaddleNum] = v.[PaddleNum]
LEFT JOIN [dbo].[AuctionHammered] ah ON ap.[ItemId] = ah.[ItemId]
LEFT JOIN (
    SELECT [ItemId], COUNT(*) as BidCount
    FROM [dbo].[AuctionBidLog]
    WHERE [IsValid] = 'Y' AND [Status] = 'Confirmed'
    GROUP BY [ItemId]
) bid_count ON ap.[ItemId] = bid_count.[ItemId]
WHERE ap.[ItemId] = @ItemId;
```

#### 3. `/api/liveauction/status/{itemId}` - 取得即時競標狀態
```sql
-- 查詢即時競標狀態 (大螢幕輪詢，整合 LiveSession 狀態)
-- 當前最高出價直接從 AuctionBidLog 查詢，確保資料一致性
SELECT
    ap.[ItemId],
    ap.[Name],
    ap.[StartingPrice],
    -- 當前最高出價：從 AuctionBidLog 取得最新出價，如無出價則使用起標價
    COALESCE(latest_bid.[BidAmount], ap.[StartingPrice]) as CurrentPrice,
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
    ap.[Status] as ItemStatus,  -- 商品狀態: active, ended, passed
    ls_current.[StringValue] as CurrentAuctionItem,
    ls_mode.[StringValue] as DisplayMode,
    -- 確認當前商品是否為正在拍賣的商品
    CASE WHEN ls_current.[StringValue] = ap.[ItemId] AND ls_mode.[StringValue] = 'liveAuction' THEN 1 ELSE 0 END as IsCurrentItem
FROM [dbo].[AuctionPrize] ap
LEFT JOIN [dbo].[vw_LatestBid] latest_bid ON ap.[ItemId] = latest_bid.[ItemId] AND latest_bid.rn = 1
LEFT JOIN [dbo].[AuctionHammered] ah ON ap.[ItemId] = ah.[ItemId]
LEFT JOIN [dbo].[LiveSession] ls_current ON ls_current.[StateName] = 'DisplayCurrentItemId'
LEFT JOIN [dbo].[LiveSession] ls_mode ON ls_mode.[StateName] = 'DisplayCurrentMode'
WHERE ap.[ItemId] = @ItemId;
```

### 後台管理功能

#### 1. 記錄競標 (工作人員手動輸入，整合VIP驗證)
```sql
-- 競標記錄前先驗證 VIP 資格和出價金額
DECLARE @VipExists INT, @CurrentPrice DECIMAL(18,0), @MinIncrement DECIMAL(18,0) = 1000;

-- 檢查 VIP 是否存在且有效
SELECT @VipExists = COUNT(*) FROM [dbo].[Vip] WHERE [PaddleNum] = @PaddleNum;

-- 取得當前最高價
SELECT @CurrentPrice = COALESCE(MAX([BidAmount]), 0)
FROM [dbo].[AuctionBidLog]
WHERE [ItemId] = @ItemId AND [IsValid] = 'Y' AND [Status] = 'Confirmed';

-- 取得商品起標價
SELECT @CurrentPrice = CASE WHEN @CurrentPrice = 0 THEN [StartPrice] ELSE @CurrentPrice END
FROM [dbo].[AuctionPrize] WHERE [ItemId] = @ItemId;

-- 驗證通過後插入競標記錄
IF @VipExists > 0 AND @BidAmount > @CurrentPrice + @MinIncrement
BEGIN
    INSERT INTO [dbo].[AuctionBidLog] (
        [ItemId], [PaddleNum], [PaddleName], [BidAmount],
        [BidType], [RecordStaff], [Status], [Notes]
    )
    SELECT @ItemId, @PaddleNum, v.[VipName], @BidAmount,
           'Live', @StaffId, 'Pending', @Notes
    FROM [dbo].[Vip] v WHERE v.[PaddleNum] = @PaddleNum;

    -- 不需要更新 LiveSession 狀態，所有拍賣狀態直接從資料表查詢
    -- LiveAuctionCurrentPrice: 從 AuctionBidLog 最新記錄取得
    -- LiveAuctionCurrentBidder: 從 AuctionBidLog 最新記錄取得
    -- LiveAuctionStatus: 從 AuctionPrize.Status 取得
END
```

#### 2. 結標處理（成交）
```sql
-- 結標並記錄得標者
INSERT INTO AuctionHammered (ItemId, AuctionResult, FinalWinnerID, FinalWinnerName, HammerPrice, HighestBidAmount, AuctioneerStaffId)
SELECT
    @ItemId,
    'hammered',
    abl_latest.BidderID,
    abl_latest.BidderName,
    abl_latest.BidAmount,
    abl_latest.BidAmount,
    @AuctioneerStaffId
FROM (
    SELECT BidderID, BidderName, BidAmount,
           ROW_NUMBER() OVER (ORDER BY Timestamp DESC) as rn
    FROM AuctionBidLog
    WHERE ItemId = @ItemId AND IsValid = 1
) abl_latest
WHERE abl_latest.rn = 1;

-- 更新商品狀態為結束
UPDATE AuctionPrize SET Status = 'ended', UpdatedAt = GETUTCDATE() WHERE ItemId = @ItemId;
```

#### 3. 流標處理
```sql
-- 流標處理 - 無人出價
INSERT INTO AuctionHammered (ItemId, AuctionResult, HighestBidAmount, PassedReason, AuctioneerStaffId, PaymentStatus, Notes)
VALUES (
    @ItemId,
    'passed',
    0,
    'no_bids',
    @AuctioneerStaffId,
    'n/a',
    '無人出價，商品流標'
);

-- 流標處理 - 未達底價
INSERT INTO AuctionHammered (ItemId, AuctionResult, HighestBidAmount, PassedReason, AuctioneerStaffId, PaymentStatus, Notes)
SELECT
    @ItemId,
    'passed',
    COALESCE(abl_latest.BidAmount, 0),
    'below_reserve',
    @AuctioneerStaffId,
    'n/a',
    '未達底價，商品流標'
FROM (
    SELECT BidAmount,
           ROW_NUMBER() OVER (ORDER BY Timestamp DESC) as rn
    FROM AuctionBidLog
    WHERE ItemId = @ItemId AND IsValid = 1
) abl_latest
WHERE abl_latest.rn = 1;

-- 更新商品狀態為流標
UPDATE AuctionPrize SET Status = 'passed', UpdatedAt = GETUTCDATE() WHERE ItemId = @ItemId;
```

## 索引策略

### 主要查詢模式優化
- `AuctionBidLog`: 依商品和時間排序的競標歷程查詢，使用複合索引優化最新出價查詢
- `AuctionHammered`: 得標者和付款狀態查詢
- `vw_LatestBid`: 透過 View 封裝最新出價邏輯，提供統一的查詢介面

### 效能考量
- 使用適當的索引配置支援大螢幕的高頻率輪詢 (每2秒)
- 透過 `vw_LatestBid` View 統一最新出價查詢邏輯，提升查詢效能和可維護性
- 透過 ROW_NUMBER() 視窗函數快速取得最新出價
- 分頁查詢支援大量競標記錄的瀏覽

### View 建議索引
```sql
-- 為 vw_LatestBid View 的底層表建立複合索引，優化效能
CREATE INDEX IX_AuctionBidLog_ItemId_Status_Timestamp
ON [dbo].[AuctionBidLog] ([ItemId], [IsValid], [Status], [Timestamp] DESC);
```

## 資料完整性

### 約束條件
- 每個商品只能有一個結標記錄（包含成交或流標）
- 出價金額必須大於0
- 成交價格不能低於起標價
- 成交時必須有得標者和落槌價格
- 流標時不能有得標者和落槌價格

### 觸發器建議
```sql
-- 確保出價金額遞增的觸發器
CREATE TRIGGER TR_AuctionBidLog_ValidateBid
ON AuctionBidLog
AFTER INSERT
AS
BEGIN
    DECLARE @ItemId NVARCHAR(50), @BidAmount DECIMAL(18,2), @CurrentPrice DECIMAL(18,2), @StartingPrice DECIMAL(18,2);

    SELECT @ItemId = ItemId, @BidAmount = BidAmount FROM inserted;

    -- 取得當前最高價和起標價
    SELECT @StartingPrice = StartingPrice FROM AuctionPrize WHERE ItemId = @ItemId;

    SELECT @CurrentPrice = COALESCE(MAX(BidAmount), @StartingPrice)
    FROM AuctionBidLog
    WHERE ItemId = @ItemId AND IsValid = 1 AND BidId NOT IN (SELECT BidId FROM inserted);

    IF @BidAmount <= @CurrentPrice
    BEGIN
        RAISERROR('出價金額必須高於當前最高價', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
```

## 流標機制說明

### 流標判斷邏輯
1. **無人出價流標**：整個拍賣過程中沒有任何有效出價
2. **未達底價流標**：有出價但最高價未達到設定的底價 (ReservePrice)

### 流標處理流程
1. 拍賣官宣布流標
2. 系統記錄流標原因 (no_bids 或 below_reserve)
3. 更新商品狀態為 'passed'
4. 在 AuctionHammered 表中記錄流標資訊
5. 大螢幕顯示流標結果

### API 回應中的流標資訊
- `IsEnded`: true (已結束)
- `AuctionResult`: "passed" (流標)
- `FinalWinnerID`: null
- `FinalWinnerName`: null
- `PassedReason`: "no_bids" 或 "below_reserve"

## 系統整合完成度

### 與現有模組的整合優勢
1. **統一認證體系**: 使用既有的 `Staff` 表管理拍賣官和記錄員工權限
2. **VIP 整合**: 直接利用 `Vip` 表的號牌系統，無需重複建立競標者資料
3. **即時狀態管理**: 透過 `LiveSession` 表的 `DisplayCurrentItemId` 和 `DisplayCurrentMode` 管理當前拍賣項目
4. **資料格式一致**: 採用與系統其他表格相同的欄位類型和命名規範
5. **員工追蹤**: 記錄所有操作的員工資訊，支援審計追蹤
6. **單一資料來源**: 所有拍賣狀態直接從核心資料表查詢，避免資料同步問題

### 技術架構特色
- **金額格式**: 使用 `DECIMAL(18,0)` 與系統其他金額欄位保持一致
- **時間格式**: 使用 `DATETIME` 搭配 `GETDATE()` 符合現有系統標準
- **狀態管理**: 僅使用 `LiveSession` 表管理當前拍賣項目，其他狀態直接從資料表查詢
- **雙重確認**: 競標記錄支援 `RecordStaff` 和 `ConfirmStaff` 雙重確認機制
- **完整追蹤**: 從競標到付款交貨的完整生命週期管理

### 與慈善活動整體流程整合
```
慈善募款活動完整流程:
1. VIP 報到 → Vip 表
2. 抽獎活動 → Raffle* 系列表
3. 現場拍賣 → AuctionPrize + AuctionBidLog + AuctionHammered
4. 贈品發放 → GivePrize 表
5. 員工管理 → Staff 表 (橫跨所有模組)
6. 系統參數 → SysParameter 表 (系統設定)
7. 即時狀態 → LiveSession 表 (大螢幕顯示)
```

### 效能與擴展性考量
- 使用 `vw_LatestBid` View 統一最新競標查詢邏輯，提升維護性
- 使用視窗函數 (`ROW_NUMBER()`) 優化最新競標查詢
- 建立適當索引支援大螢幕高頻率輪詢需求
- 透過 `LiveSession` 表管理當前拍賣項目，其他狀態直接查詢確保資料一致性
- 支援未來擴展線上競標功能 (`BidType`: Live/Online)

### 資料完整性保證
- 外鍵約束確保 VIP 和員工資料一致性
- CHECK 約束防止無效的結標狀態組合
- 競標金額遞增驗證機制
- 完整的審計追蹤記錄