# AuctionDB 資料庫結構文件

## 資料庫概述

資料庫名稱: **AuctionDB**
用途: 慈善募款活動拍賣系統

---

## 資料表清單

### 1. 核心拍賣相關

#### 1.1 AuctionPrize (現場競標項目)
存放現場拍賣的商品基本資訊,由拍賣官在後台管理。

| 欄位名稱 | 資料型態 | NULL | 鍵值 | 說明 |
|---------|---------|------|------|------|
| ItemId | VARCHAR(10) | NOT NULL | PK | 項目ID,唯一識別碼,建議格式: A001, A002... |
| Name | NVARCHAR(100) | NOT NULL | | 項目名稱,顯示在大螢幕和拍賣目錄 |
| Description | NVARCHAR(500) | NOT NULL | | 項目描述,詳細說明商品特色和價值 |
| Image | VARCHAR(200) | NOT NULL | | 項目圖片URL,用於大螢幕展示 |
| StartPrice | DECIMAL(18,0) | NOT NULL | | 起標價,拍賣起始金額,必須大於0 |
| ReservePrice | DECIMAL(18,0) | NOT NULL | | 底價(保留價),未達此價格視為流標 |
| Status | NVARCHAR(20) | NOT NULL | | 狀態: 待拍/進行中/已結標/已流標 (預設: 待拍) |
| CreatedAt | DATETIME | NOT NULL | | 建立時間,系統自動記錄 (預設: GETDATE()) |
| UpdatedAt | DATETIME | NOT NULL | | 更新時間,每次修改時更新 (預設: GETDATE()) |
| CreatedBy | VARCHAR(100) | NOT NULL | | 建立者帳號,記錄哪位員工建立 (預設: '') |

**業務規則**:
- StartPrice 必須小於等於 ReservePrice
- Status 變更需記錄在 AuctionHammered
- 圖片建議尺寸: 1920x1080 (大螢幕顯示)

#### 1.2 AuctionBidLog (競標紀錄)
記錄現場拍賣的所有競標歷程,支援雙重確認機制,確保出價準確性。

| 欄位名稱 | 資料型態 | NULL | 鍵值 | 說明 |
|---------|---------|------|------|------|
| BidId | BIGINT | NOT NULL | PK (IDENTITY) | 競標ID,系統自動產生流水號 |
| ItemId | VARCHAR(10) | NOT NULL | | 項目ID,對應 AuctionPrize.ItemId |
| PaddleNum | VARCHAR(10) | NOT NULL | | 舉牌號碼,對應 Vip.PaddleNum |
| PaddleName | NVARCHAR(100) | NOT NULL | | 舉牌者姓名,從 Vip 表自動帶入 |
| BidAmount | DECIMAL(18,0) | NOT NULL | | 競標金額,必須高於當前最高價 |
| BidType | VARCHAR(10) | NOT NULL | | 競標類型: Live(現場)/Online(線上) (預設: Live) |
| Timestamp | DATETIME | NOT NULL | | 時間戳記,記錄出價時間 (預設: GETDATE()) |
| IsValid | CHAR(1) | NOT NULL | | 是否有效: Y(有效)/N(無效,如誤輸入) (預設: Y) |
| Notes | NVARCHAR(500) | NULL | | 備註,記錄特殊情況或修正原因 |
| RecordStaff | VARCHAR(50) | NOT NULL | | 記錄人員,對應 Staff.UserId,第一位確認者 |
| ConfirmStaff | VARCHAR(50) | NULL | | 確認人員,對應 Staff.UserId,第二位確認者(雙重確認) |
| Status | VARCHAR(10) | NOT NULL | | 狀態: Pending(待確認)/Confirmed(已確認)/Rejected(已拒絕) (預設: Pending) |

**業務規則**:
- BidAmount 必須 > (當前最高價 + 最低加價單位 1000)
- IsValid='N' 的記錄不計入最高價計算
- Status='Confirmed' 且 IsValid='Y' 才算有效出價
- 支援雙重確認: RecordStaff 記錄, ConfirmStaff 確認
- 索引: ItemId, PaddleNum, Status, Timestamp (優化查詢效能)

#### 1.3 AuctionHammered (現場競標落槌紀錄)
記錄拍賣最終結果(成交或流標),整合付款與交貨流程管理。每個商品只能有一筆落槌記錄。

| 欄位名稱 | 資料型態 | NULL | 鍵值 | 說明 |
|---------|---------|------|------|------|
| HammerId | BIGINT | NOT NULL | PK (IDENTITY) | 落槌ID,系統自動產生 |
| ItemId | VARCHAR(10) | NOT NULL | UNIQUE | 項目ID,一個商品只能有一次落槌 |
| AuctionResult | VARCHAR(10) | NOT NULL | | 拍賣結果: Hammered(成交)/Passed(流標) |
| WinnerPaddleNum | VARCHAR(10) | NULL | | 得標者號碼,成交時必填,對應 Vip.PaddleNum |
| WinnerName | NVARCHAR(100) | NULL | | 得標者姓名,成交時必填,從 Vip 表帶入 |
| HammerPrice | DECIMAL(18,0) | NULL | | 落槌價格,成交時的最終價格 |
| HighestBidAmount | DECIMAL(18,0) | NULL | | 最高出價金額,記錄最高出價(可能低於底價) |
| PassedReason | VARCHAR(20) | NULL | | 流標原因: NoBids(無人出價)/BelowReserve(未達底價) |
| HammerDtm | DATETIME | NOT NULL | | 落槌時間,拍賣官宣布成交/流標的時間 (預設: GETDATE()) |
| AuctioneerStaff | VARCHAR(50) | NOT NULL | | 拍賣官人員,對應 Staff.UserId |
| PaymentStatus | VARCHAR(10) | NULL | | 付款狀態: Unpaid(未付)/Partial(部分付)/Paid(已付)/NA(流標) (預設: Unpaid) |
| PaidAmount | DECIMAL(18,0) | NULL | | 已付金額,可分次付款 (預設: 0) |
| PaymentDtm | DATETIME | NULL | | 付款時間,最後一次付款時間 |
| PaymentStaff | VARCHAR(50) | NULL | | 付款人員,對應 Staff.UserId,收款人員 |
| PaymentNotes | NVARCHAR(500) | NULL | | 付款備註,記錄付款方式(現金/刷卡/轉帳)等 |
| IsDelivered | CHAR(1) | NULL | | 是否已交付: Y(已交付)/N(未交付) (預設: N) |
| DeliveryDtm | DATETIME | NULL | | 交付時間,商品實際交付時間 |
| DeliveryStaff | VARCHAR(50) | NULL | | 交付人員,對應 Staff.UserId |
| Notes | NVARCHAR(500) | NULL | | 備註,記錄特殊情況 |
| CreatedDtm | DATETIME | NULL | | 建立時間,系統自動記錄 (預設: GETDATE()) |

**業務規則**:
- 成交時: AuctionResult='Hammered', WinnerPaddleNum/WinnerName/HammerPrice 必填
- 流標時: AuctionResult='Passed', WinnerPaddleNum/HammerPrice 必須為 NULL, PassedReason 必填
- ItemId 唯一性: 透過 UNIQUE 約束確保一個商品只能落槌一次
- 付款流程: Unpaid → Partial(可選) → Paid
- 交付流程: 必須先完成付款(PaymentStatus='Paid')才能交付
- CHECK 約束確保成交/流標資料的一致性

### 2. 靜默拍賣相關

#### 2.1 SilentPrize (靜默拍賣項目)
靜默拍賣商品資料,支援線上競標與時間控制,提供隱私競標環境。

| 欄位名稱 | 資料型態 | NULL | 鍵值 | 說明 |
|---------|---------|------|------|------|
| ItemId | VARCHAR(10) | NOT NULL | PK | 項目ID,唯一識別碼,建議格式: S001, S002... |
| Name | NVARCHAR(100) | NOT NULL | | 項目名稱,顯示在大螢幕輪播和 VIP 競標頁面 |
| Description | NVARCHAR(500) | NOT NULL | | 項目描述,詳細說明商品內容與價值 |
| Image | VARCHAR(200) | NOT NULL | | 項目圖片URL,支援大螢幕輪播展示 |
| StartPrice | DECIMAL(18,0) | NOT NULL | | 起標價,競標起始金額 |
| MinIncrement | DECIMAL(18,0) | NOT NULL | | 最低加價,每次出價必須加價的最小金額 |
| StartTime | CHAR(5) | NOT NULL | | 開始時間,格式 HH:MM (24小時制) |
| EndTime | CHAR(5) | NOT NULL | | 結束時間,格式 HH:MM,時間到自動結標 (預設: '') |
| Status | NVARCHAR(20) | NOT NULL | | 狀態: active(進行中)/ended(已結束)/passed(已流標) (預設: 待拍) |
| DisplayOrder | INT | NOT NULL | | 顯示順序,大螢幕輪播順序,數字越小越優先 (預設: 0) |
| CreatedAt | DATETIME | NOT NULL | | 建立時間,系統自動記錄 (預設: GETDATE()) |
| UpdatedAt | DATETIME | NOT NULL | | 更新時間,每次修改時更新 (預設: GETDATE()) |
| CreatedBy | VARCHAR(100) | NOT NULL | | 建立者,記錄建立人員帳號 (預設: '') |

**業務規則**:
- MinIncrement 建議值: 500 或 1000 (依商品價值調整)
- StartTime/EndTime: 使用活動當天的時間,跨日需特別處理
- 自動結標: 系統排程每分鐘檢查 EndTime,時間到自動執行結標
- 隱私保護: 競標過程中不顯示其他競標者身份,僅顯示當前最高價
- 大螢幕輪播: 依 DisplayOrder 排序,每 10 秒切換下一個商品

#### 2.2 SilentBidEvent (靜默競標事件)
| 欄位名稱 | 資料型態 | NULL | 鍵值 | 說明 |
|---------|---------|------|------|------|
| BidId | BIGINT | NOT NULL | PK (IDENTITY) | 競標ID |
| ItemId | VARCHAR(10) | NOT NULL | | 項目ID |
| PaddleNum | VARCHAR(10) | NOT NULL | | 舉牌號碼 |
| PaddleName | NVARCHAR(100) | NOT NULL | | 舉牌者姓名 |
| BidAmount | DECIMAL(18,0) | NOT NULL | | 競標金額 |
| PreviousHighestBid | DECIMAL(18,0) | NULL | | 前次最高出價 |
| BidType | VARCHAR(10) | NOT NULL | | 競標類型 (預設: Online) |
| Timestamp | DATETIME | NOT NULL | | 時間戳記 (預設: GETDATE()) |
| IsValid | CHAR(1) | NOT NULL | | 是否有效 (Y/N, 預設: Y) |
| IsOutbid | CHAR(1) | NOT NULL | | 是否被超標 (Y/N, 預設: N) |
| OutbidTime | DATETIME | NULL | | 被超標時間 |
| Notes | NVARCHAR(500) | NULL | | 備註 |
| SessionId | VARCHAR(100) | NULL | | 會話ID |
| IPAddress | VARCHAR(45) | NULL | | IP位址 |

#### 2.3 SilentHammered (靜默拍賣落槌紀錄)
| 欄位名稱 | 資料型態 | NULL | 鍵值 | 說明 |
|---------|---------|------|------|------|
| HammerId | BIGINT | NOT NULL | PK (IDENTITY) | 落槌ID |
| ItemId | VARCHAR(10) | NOT NULL | UNIQUE | 項目ID |
| AuctionResult | VARCHAR(10) | NOT NULL | | 拍賣結果 (Hammered/Passed) |
| WinnerPaddleNum | VARCHAR(10) | NULL | | 得標者號碼 |
| WinnerName | NVARCHAR(100) | NULL | | 得標者姓名 |
| HammerPrice | DECIMAL(18,0) | NULL | | 落槌價格 |
| HighestBidAmount | DECIMAL(18,0) | NULL | | 最高出價金額 |
| TotalBidCount | INT | NULL | | 總出價次數 (預設: 0) |
| UniqueBidderCount | INT | NULL | | 不重複出價人數 (預設: 0) |
| PassedReason | VARCHAR(20) | NULL | | 流標原因 |
| HammerDtm | DATETIME | NOT NULL | | 落槌時間 (預設: GETDATE()) |
| AutoHammered | CHAR(1) | NULL | | 自動落槌 (Y/N, 預設: N) |
| PaymentStatus | VARCHAR(10) | NULL | | 付款狀態 (預設: Unpaid) |
| PaidAmount | DECIMAL(18,0) | NULL | | 已付金額 (預設: 0) |
| PaymentDtm | DATETIME | NULL | | 付款時間 |
| PaymentStaff | VARCHAR(50) | NULL | | 付款人員 |
| PaymentNotes | NVARCHAR(500) | NULL | | 付款備註 |
| IsDelivered | CHAR(1) | NULL | | 是否已交付 (Y/N, 預設: N) |
| DeliveryDtm | DATETIME | NULL | | 交付時間 |
| DeliveryStaff | VARCHAR(50) | NULL | | 交付人員 |
| Notes | NVARCHAR(500) | NULL | | 備註 |
| CreatedDtm | DATETIME | NULL | | 建立時間 (預設: GETDATE()) |

### 3. 抽獎相關

#### 3.1 RafflePrize (抽獎獎品)
| 欄位名稱 | 資料型態 | NULL | 鍵值 | 說明 |
|---------|---------|------|------|------|
| PrizeId | VARCHAR(10) | NOT NULL | PK | 獎品ID |
| Name | NVARCHAR(100) | NOT NULL | | 獎品名稱 |
| Description | NVARCHAR(500) | NOT NULL | | 獎品描述 |
| Image | VARCHAR(200) | NOT NULL | | 獎品圖片URL |
| Value | DECIMAL(18,0) | NOT NULL | | 獎品價值 |
| Category | VARCHAR(10) | NOT NULL | | 類別 (major.大獎/minor.小獎) |

#### 3.2 RaffleOrder (抽獎彩券訂單)
| 欄位名稱 | 資料型態 | NULL | 鍵值 | 說明 |
|---------|---------|------|------|------|
| RaffleOrderNo | CHAR(7) | NOT NULL | PK | 訂單編號 (格式: RSnnnnn) |
| BuyerName | NVARCHAR(100) | NOT NULL | | 買家姓名 |
| BuyerEmail | VARCHAR(100) | NOT NULL | | 買家電子郵件 |
| BuyerPhone | VARCHAR(50) | NOT NULL | | 買家手機電話 |
| PurchaseCount | INT | NOT NULL | | 購買數量 |
| PurchaseAmount | DECIMAL(18,0) | NOT NULL | | 購買金額 |
| HasPaid | CHAR(1) | NOT NULL | | 已付款 (Y/N) |
| SalesId | VARCHAR(50) | NOT NULL | | 銷售人員ID |
| SoldDtm | DATETIME | NULL | | 售出時間 |
| Status | VARCHAR(20) | NOT NULL | | 訂單狀態 (ForSale/HasSold/Invalid) |
| Remark | NVARCHAR(500) | NULL | | 備註 |
| IsChecked | CHAR(1) | NULL | | 已核對 (Y/N) |
| Checker | VARCHAR(50) | NULL | | 核對人員 |
| CheckedDtm | DATETIME | NULL | | 核對時間 |

#### 3.3 RaffleTicket (抽獎彩券)
| 欄位名稱 | 資料型態 | NULL | 鍵值 | 說明 |
|---------|---------|------|------|------|
| RaffleTicketNo | CHAR(7) | NOT NULL | PK | 抽獎券號 (格式: RTnnnnn) |
| RaffleSoldNo | CHAR(7) | NOT NULL | | 訂單編號 |
| BuyerName | NVARCHAR(100) | NOT NULL | | 買家姓名 |
| BuyerEmail | VARCHAR(100) | NOT NULL | | 買家電子郵件 |
| BuyerPhone | VARCHAR(50) | NOT NULL | | 買家手機電話 |
| EmailTimes | INT | NOT NULL | | 發送電子郵件次數 (預設: 0) |
| LastEmailDtm | DATETIME | NULL | | 最後發送時間 |

#### 3.4 RaffleWinner (抽獎得獎紀錄)
| 欄位名稱 | 資料型態 | NULL | 鍵值 | 說明 |
|---------|---------|------|------|------|
| PrizeId | VARCHAR(10) | NOT NULL | PK | 獎品ID |
| RaffleTickerNo | CHAR(7) | NOT NULL | | 得獎抽獎券號 |
| DrawDtm | DATETIME | NOT NULL | | 抽獎時間 |

### 4. 贈券抽獎相關

#### 4.1 GivePrize (贈券獎品)
| 欄位名稱 | 資料型態 | NULL | 鍵值 | 說明 |
|---------|---------|------|------|------|
| GiftId | VARCHAR(10) | NOT NULL | PK | 贈券獎品ID |
| Name | NVARCHAR(100) | NOT NULL | | 贈券名稱 |
| Description | NVARCHAR(500) | NOT NULL | | 贈券描述 |
| Image | VARCHAR(200) | NOT NULL | | 贈券圖片URL |
| Value | DECIMAL(18,0) | NOT NULL | | 贈券價值 |

#### 4.2 GiveOrder (贈券訂單)
| 欄位名稱 | 資料型態 | NULL | 鍵值 | 說明 |
|---------|---------|------|------|------|
| GiveOrderNo | CHAR(7) | NOT NULL | PK | 訂單編號 (格式: GSnnnnn) |
| PaddleNum | VARCHAR(10) | NOT NULL | | 賓客號牌 |
| VipName | VARCHAR(100) | NOT NULL | | 賓客姓名 |
| GiftId | VARCHAR(10) | NOT NULL | | 贈券獎品ID |
| PurchaseCount | INT | NOT NULL | | 購買數量 |
| PurchaseAmount | DECIMAL(18,0) | NOT NULL | | 購買金額 |
| HasPaid | CHAR(1) | NOT NULL | | 已付款 (Y/N) |
| SalesId | VARCHAR(50) | NOT NULL | | 銷售人員ID |
| SoldDtm | DATETIME | NULL | | 售出時間 |
| Status | VARCHAR(20) | NOT NULL | | 訂單狀態 (ForSale/HasSold/Invalid) |
| Remark | NVARCHAR(500) | NULL | | 備註 |
| IsChecked | CHAR(1) | NULL | | 已核對 (Y/N) |
| Checker | VARCHAR(50) | NULL | | 核對人員 |
| CheckedDtm | DATETIME | NULL | | 核對時間 |

#### 4.3 GiveTicket (贈券抽獎券)
| 欄位名稱 | 資料型態 | NULL | 鍵值 | 說明 |
|---------|---------|------|------|------|
| GiveTicketNo | CHAR(7) | NOT NULL | PK | 贈券抽獎券號碼 |
| GiveOrderNo | CHAR(7) | NOT NULL | | 訂單編號 |
| GiftId | VARCHAR(10) | NOT NULL | | 贈券獎品ID |
| PaddleNum | VARCHAR(10) | NOT NULL | | 賓客號碼 |
| HolderName | NVARCHAR(100) | NOT NULL | | 抽獎券持有人姓名 |

#### 4.4 GiveWinner (贈券抽獎得獎紀錄)
| 欄位名稱 | 資料型態 | NULL | 鍵值 | 說明 |
|---------|---------|------|------|------|
| GiftId | VARCHAR(10) | NOT NULL | PK | 獎品ID |
| GiveTicketNo | CHAR(7) | NOT NULL | | 得獎券號 |
| DrawDtm | DATETIME | NOT NULL | | 抽獎時間 |

### 5. 捐款相關

#### 5.1 OpenAskRound (公開募捐回合)
| 欄位名稱 | 資料型態 | NULL | 鍵值 | 說明 |
|---------|---------|------|------|------|
| Round | INT | NOT NULL | PK | 募捐回合 |
| Amount | DECIMAL(18,0) | NOT NULL | | 募捐金額 |
| IsActive | CHAR(1) | NOT NULL | | 啟動 (Y/N, 預設: N) |

#### 5.2 OpenAskEntry (公開募捐登記)
| 欄位名稱 | 資料型態 | NULL | 鍵值 | 說明 |
|---------|---------|------|------|------|
| Ssn | INT | NOT NULL | PK (IDENTITY) | 系統序號 |
| Round | INT | NOT NULL | | 募捐回合 |
| Amount | DECIMAL(18,0) | NOT NULL | | 募捐當回金額 |
| PaddleNum | VARCHAR(10) | NOT NULL | | 賓客號碼 |
| RecordStaff | VARCHAR(50) | NOT NULL | | 記錄工作人員 |
| RecordDtm | DATETIME | NOT NULL | | 記錄時間 |

#### 5.3 OpenAskRecord (公開募捐記錄)
| 欄位名稱 | 資料型態 | NULL | 鍵值 | 說明 |
|---------|---------|------|------|------|
| Ssn | INT | NOT NULL | PK (IDENTITY) | 系統序號 |
| Round | INT | NOT NULL | | 公開募捐回合 |
| PaddleNum | VARCHAR(10) | NOT NULL | | 號牌號碼 |
| PaddleName | NVARCHAR(100) | NOT NULL | | 舉牌姓名 |
| Amount | DECIMAL(18,0) | NOT NULL | | 捐款金額 |
| RecordStaff1 | VARCHAR(50) | NULL | | 記錄人員一 |
| RecordDtm1 | DATETIME | NULL | | 記錄時間一 |
| RecordStaff2 | VARCHAR(50) | NULL | | 記錄人員二 |
| RecordDtm2 | DATETIME | NULL | | 記錄時間二 |
| Status | VARCHAR(10) | NOT NULL | | 狀態 (Pending/Confirmed/Invalid, 預設: Pending) |
| HasPaid | CHAR(1) | NOT NULL | | 已付款 (Y/N, 預設: N) |
| PaidDtm | DATETIME | NULL | | 付款時間 |
| PaidStaff | VARCHAR(50) | NULL | | 付款人員 |
| HasFix | CHAR(1) | NULL | | 是否修正 (Y/nil) |
| FixStaff | VARCHAR(50) | NULL | | 修正人員 |
| FixDtm | DATETIME | NULL | | 修正時間 |
| FixRemark | NVARCHAR(500) | NULL | | 修正備註 |

#### 5.4 DonationRecord (捐款記錄)
| 欄位名稱 | 資料型態 | NULL | 鍵值 | 說明 |
|---------|---------|------|------|------|
| Ssn | INT | NOT NULL | PK (IDENTITY) | 系統序號 |
| PaddleNum | VARCHAR(10) | NOT NULL | | 舉牌者ID |
| PaddleName | NVARCHAR(100) | NOT NULL | | 舉牌者姓名 |
| Amount | DECIMAL(18,0) | NOT NULL | | 捐款金額 |
| Timestamp | DATETIME | NOT NULL | | 捐款時間 |
| HasPaid | CHAR(1) | NOT NULL | | 已付款 (Y/N, 預設: N) |
| PaidDtm | DATETIME | NULL | | 付款時間 |
| PaidStaff | VARCHAR(50) | NULL | | 付款人員 |

### 6. 系統管理相關

#### 6.1 Vip (賓客座位資料)
慈善活動的 VIP 賓客資料,整合競標、捐款、抽獎等所有功能的核心識別資料。

| 欄位名稱 | 資料型態 | NULL | 鍵值 | 說明 |
|---------|---------|------|------|------|
| PaddleNum | VARCHAR(10) | NOT NULL | PK | 號牌號碼,唯一識別,建議格式: 001, 002... 或 VIP001 |
| VipName | NVARCHAR(100) | NOT NULL | | 賓客姓名,顯示在競標記錄和得標清單 |
| VipEmail | VARCHAR(100) | NOT NULL | | 賓客電子郵件,用於登入驗證和通知 |
| VipPhone | VARCHAR(50) | NOT NULL | | 賓客手機電話,用於簡訊通知和聯繫 |
| TableNumber | VARCHAR(10) | NOT NULL | | 桌號,座位安排管理 |
| SeatNumber | VARCHAR(10) | NOT NULL | | 座位號碼,精確座位位置 |
| IsEnterprise | CHAR(1) | NOT NULL | | 是否企業: Y(企業)/N(個人),影響發票開立 |
| ReceiptHeader | NVARCHAR(100) | NOT NULL | | 發票抬頭,個人為姓名,企業為公司名稱 |
| TaxNum | VARCHAR(20) | NOT NULL | | 稅編(統一編號),企業必填,個人可為空 |

**業務規則**:
- PaddleNum 為系統核心識別碼,所有模組使用此欄位關聯 VIP
- VipEmail 需唯一,用於登入驗證
- IsEnterprise='Y' 時, TaxNum 必填且格式為 8 位數字
- IsEnterprise='N' 時, ReceiptHeader 使用 VipName
- 使用範圍: 現場拍賣、靜默拍賣、公開募捐、捐款、贈券抽獎
- 索引建議: VipEmail (用於登入查詢)

#### 6.2 Staff (工作人員資料)
管理慈善活動工作人員的帳號、權限和角色,支援多角色授權機制。

| 欄位名稱 | 資料型態 | NULL | 鍵值 | 說明 |
|---------|---------|------|------|------|
| UserId | VARCHAR(50) | NOT NULL | PK | 使用者帳號,唯一識別,建議使用英文帳號 |
| Mima | VARCHAR(50) | NOT NULL | | 密碼,建議加密儲存 (如 BCrypt/PBKDF2) |
| Nickname | NVARCHAR(100) | NOT NULL | | 暱稱/顯示名稱,顯示在操作記錄中 |
| Phone | VARCHAR(50) | NOT NULL | | 聯繫電話,緊急聯絡用 |
| RoleList | NVARCHAR(500) | NOT NULL | | 角色清單,JSON 陣列格式,如: ["Admin","Auctioneer","Cashier"] |
| Remark | NVARCHAR(500) | NULL | | 備註,記錄人員說明或特殊權限 |
| Enable | CHAR(1) | NOT NULL | | 啟用狀態: Y(啟用)/N(停用),停用後無法登入 |

**角色定義**:
- **Admin**: 系統管理員,最高權限
- **Auctioneer**: 拍賣官,可執行落槌操作
- **Recorder**: 記錄人員,可記錄競標和捐款
- **Cashier**: 收銀人員,可處理付款
- **Delivery**: 物流人員,可處理商品交付
- **Sales**: 銷售人員,可銷售抽獎券和贈券

**業務規則**:
- RoleList 使用 JSON 陣列格式: ["Role1","Role2",...]
- 一個帳號可擁有多個角色
- Enable='N' 時帳號立即失效,無法登入
- 所有操作記錄使用 UserId 追蹤審計
- 密碼欄位建議使用雜湊加密,不儲存明碼

#### 6.3 AuthSession (使用者登入權杖 session)
| 欄位名稱 | 資料型態 | NULL | 鍵值 | 說明 |
|---------|---------|------|------|------|
| UserId | VARCHAR(100) | NOT NULL | PK | 使用者識別姓名 |
| ExpiresDtm | DATETIMEOFFSET(7) | NOT NULL | | 權杖到期時間 |
| Session | NVARCHAR(MAX) | NOT NULL | | 權杖內容 |

#### 6.4 SysParameter (系統參數)
| 欄位名稱 | 資料型態 | NULL | 鍵值 | 說明 |
|---------|---------|------|------|------|
| IdName | AS COMPUTED | NOT NULL | PK | 參數識別名稱 (Category_Name) |
| Name | VARCHAR(100) | NOT NULL | | 參數名稱 |
| Value | NVARCHAR(500) | NOT NULL | | 參數值 |
| Category | VARCHAR(100) | NOT NULL | | 參數分類 |
| Remark | NVARCHAR(100) | NOT NULL | | 備註 |

#### 6.5 LiveSession (即席進程狀態)
管理系統即時狀態,支援大螢幕顯示控制、當前拍賣項目管理等動態參數。

| 欄位名稱 | 資料型態 | NULL | 鍵值 | 說明 |
|---------|---------|------|------|------|
| StateName | VARCHAR(50) | NOT NULL | PK | 狀態名稱,唯一鍵值,如: DisplayCurrentMode, DisplayCurrentItemId |
| Descripiton | NVARCHAR(200) | NOT NULL | | 描述,說明此狀態參數的用途 |
| StringValue | NVARCHAR(500) | NULL | | 字串狀態值,存放文字類型的狀態資料 |
| NumValue | DECIMAL(18,4) | NULL | | 數值狀態值,存放數字類型的狀態資料 |

**常用狀態參數**:
- **DisplayCurrentMode**: 大螢幕顯示模式
  - 'liveAuction': 現場拍賣模式
  - 'silentAuction': 靜默拍賣輪播模式
  - 'raffle': 抽獎模式
  - 'openAsk': 公開募捐模式

- **DisplayCurrentItemId**: 當前顯示的項目ID
  - 現場拍賣: 當前拍賣的 AuctionPrize.ItemId
  - 靜默拍賣: 輪播時不使用此參數

- **SilentAuctionCarouselInterval**: 靜默拍賣輪播間隔(秒)
  - NumValue: 建議值 10 秒

**業務規則**:
- 狀態參數採用 Key-Value 架構,靈活擴充
- StringValue 與 NumValue 擇一使用,視資料型態而定
- 大螢幕程式輪詢此表取得即時狀態(建議 2 秒輪詢一次)
- 建議將常用參數預先建立,避免運行時找不到參數

#### 6.6 Notification (通知)
VIP 通知系統,支援多種通知類型,整合靜默拍賣被超越提醒、得標通知等功能。

| 欄位名稱 | 資料型態 | NULL | 鍵值 | 說明 |
|---------|---------|------|------|------|
| NotificationId | BIGINT | NOT NULL | PK (IDENTITY) | 通知ID,系統自動產生 |
| PaddleNum | VARCHAR(10) | NOT NULL | | 號牌號碼,對應 Vip.PaddleNum,通知對象 |
| NotificationType | VARCHAR(20) | NOT NULL | | 通知類型,如: auctionOvertaken, auctionWon, payment |
| Title | NVARCHAR(100) | NOT NULL | | 標題,通知主旨,顯示在通知列表 |
| Message | NVARCHAR(500) | NOT NULL | | 訊息內容,詳細說明 |
| ActionUrl | NVARCHAR(500) | NULL | | 動作URL,點擊通知後導向的頁面,如: /silentauction/items/S001 |
| IsRead | CHAR(1) | NOT NULL | | 是否已讀: Y(已讀)/N(未讀) (預設: N) |
| ReadTime | DATETIME | NULL | | 讀取時間,VIP 點擊查看時更新 |
| CreatedDtm | DATETIME | NOT NULL | | 建立時間,通知產生時間 (預設: GETDATE()) |
| ExpiryDtm | DATETIME | NULL | | 過期時間,超過此時間自動隱藏通知 |
| Priority | INT | NULL | | 優先級: 1(高)/2(中)/3(低),影響顯示順序 (預設: 0) |
| Metadata | NVARCHAR(MAX) | NULL | | 額外資料,JSON 格式,如: {"itemId":"S001","bidAmount":5000} |

**通知類型定義**:
- **auctionOvertaken**: 靜默拍賣出價被超越
  - 觸發時機: 其他 VIP 出價超過當前 VIP 的出價
  - ActionUrl: 導向該商品頁面,方便再次出價

- **auctionWon**: 拍賣得標通知
  - 觸發時機: 拍賣結標,VIP 得標
  - ActionUrl: 導向付款頁面

- **paymentReminder**: 付款提醒
  - 觸發時機: 得標後一段時間未付款

- **raffleWon**: 抽獎中獎通知
  - 觸發時機: 抽獎結果公布

**業務規則**:
- 索引: PaddleNum + IsRead (優化未讀查詢)
- 索引: PaddleNum + CreatedDtm (優化時間序列查詢)
- Priority 越小越優先顯示
- ExpiryDtm 可設為活動結束時間,過期後自動隱藏
- Metadata 提供彈性資料存放,各類型通知可自訂內容

---

## Sequence 序列

1. **GiveSaleSeq** - 贈券銷售序列
2. **GiveTicketSeq** - 贈券抽獎券序列
3. **RaffleSaleSeq** - 抽獎銷售序列
4. **RaffleTicketSeq** - 抽獎券序列

---

## 視圖 (Views)

### vw_LatestBid
最新競標視圖 - 顯示每個項目的最新有效且已確認的競標記錄

---

## 函數 (Functions)

### vfnBillDetail(@PaddleNum)
帳單明細函數 - 查詢指定號牌的所有費用明細
- LiveAuction (現場拍賣得標)
- SilentAuction (靜默拍賣得標)
- OpenAsk (公開募捐)
- Donation (捐款)

### vfnGiftInventory(@PaddleNum)
獎品庫存函數 - 查詢指定號牌得到的所有獎品
- Raffle (抽獎獎品)
- GiveToWin (贈券抽獎)
- LiveAuction (現場拍賣得標)
- SilentAuction (靜默拍賣得標)

---

## 預存程序 (Stored Procedures)

### NotifySilentAuctionOvertaken
當靜默拍賣被超標時發送通知給被超標的出價者

---

## 索引 (Indexes)

### AuctionBidLog
- IX_AuctionBidLog_ItemId
- IX_AuctionBidLog_PaddleNum
- IX_AuctionBidLog_Status
- IX_AuctionBidLog_Timestamp

### AuctionHammered
- IX_AuctionHammered_Payment
- IX_AuctionHammered_Result
- IX_AuctionHammered_Time
- IX_AuctionHammered_Winner

### SilentBidEvent
- IX_SilentBidEvent_IsValid_IsOutbid
- IX_SilentBidEvent_ItemId
- IX_SilentBidEvent_ItemId_Timestamp
- IX_SilentBidEvent_PaddleNum
- IX_SilentBidEvent_Timestamp

### SilentHammered
- IX_SilentHammered_AutoHammered
- IX_SilentHammered_Payment
- IX_SilentHammered_Result
- IX_SilentHammered_Time
- IX_SilentHammered_Winner

### Notification
- IX_Notification_CreatedDtm
- IX_Notification_PaddleNum_CreatedDtm
- IX_Notification_PaddleNum_Read
- IX_Notification_Type

---

## 資料流程概述

### 現場拍賣流程
1. 建立拍賣項目 (AuctionPrize)
2. 進行競標 (AuctionBidLog)
3. 落槌成交 (AuctionHammered)
4. 付款交付

### 靜默拍賣流程
1. 建立拍賣項目 (SilentPrize)
2. 線上出價 (SilentBidEvent)
3. 自動/手動落槌 (SilentHammered)
4. 發送通知 (Notification)
5. 付款交付

### 抽獎流程
1. 設定獎品 (RafflePrize)
2. 銷售彩券 (RaffleOrder → RaffleTicket)
3. 抽獎 (RaffleWinner)

### 贈券抽獎流程
1. 設定獎品 (GivePrize)
2. 銷售贈券 (GiveOrder → GiveTicket)
3. 抽獎 (GiveWinner)

### 募捐流程
1. 設定募捐回合 (OpenAskRound)
2. 登記捐款 (OpenAskEntry)
3. 確認記錄 (OpenAskRecord)
4. 或直接捐款 (DonationRecord)

---

## 備註
- 資料庫相容層級: 150 (SQL Server 2019)
- 所有金額欄位使用 DECIMAL(18,0)
- 時間欄位使用 DATETIME
- 啟用/確認標記使用 CHAR(1) 'Y'/'N'
