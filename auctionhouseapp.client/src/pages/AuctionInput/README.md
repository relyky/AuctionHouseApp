# Live Auction 現場輸入功能

## 功能說明

此模組實作 Live Auction 的「記錄競標」、「結標處理」、「流標處理」三項核心功能。

## 檔案結構

```
AuctionInput/
├── index.tsx           # 主入口，根據 mode 切換視圖
├── atom.ts             # Jotai 狀態管理
├── useFormHand.ts      # 自訂 Hook，處理所有 API 呼叫
├── ListView.tsx        # 商品列表視圖
├── RecordBidView.tsx   # 記錄競標視圖
├── PassView.tsx        # 流標處理視圖
└── README.md           # 本文件
```

## 功能特點

### 1. ListView (商品列表)

- 顯示所有拍賣商品及其狀態
- 提供「記錄競標」、「結標」、「流標」操作按鈕
- 商品狀態區分：進行中 / 已結束

### 2. RecordBidView (記錄競標)

- 使用 `SelectVipWidget` 選擇競標者 (Paddle Number)
- 顯示商品資訊：起標價、底價、目前價格
- 快速出價按鈕：建議加價 +$1000、+$2000、+$5000
- 即時驗證：出價必須高於目前價格
- 支援備註欄位

### 3. PassView (流標處理)

- 兩種流標原因選擇：
  - 無人出價 (NoBids)
  - 未達底價 (BelowReserve)
- 顯示警告訊息，提醒操作不可撤銷
- 支援備註說明

### 4. 結標處理

- 直接從 ListView 點擊「結標」按鈕
- 系統自動取得最高出價記錄
- 顯示得標者資訊和落槌價
- 操作前需二次確認

## API 端點

### 後端 API (C#)

所有 API 端點位於 `AuctionHouseApp.Server/Controllers/LiveAuctionController.cs`

1. **GET /api/LiveAuction/Preview**
   - 取得所有拍賣商品列表

2. **GET /api/LiveAuction/status/{itemId}**
   - 取得指定商品的即時競標狀態

3. **POST /api/LiveAuction/record-bid**
   - 記錄競標
   - Request: `{ itemId, paddleNum, bidAmount, notes }`

4. **POST /api/LiveAuction/hammer**
   - 結標處理（成交）
   - Request: `{ itemId }`

5. **POST /api/LiveAuction/pass**
   - 流標處理
   - Request: `{ itemId, passedReason, notes }`

## 資料庫結構

使用三個主要資料表（詳見 `_doc/Live Auction.MD`）：

1. **AuctionPrize** - 拍賣商品表
2. **AuctionBidLog** - 競標記錄表
3. **AuctionHammered** - 結標記錄表

## 使用流程

### 記錄競標

1. 在 ListView 點擊「記錄競標」
2. 選擇競標者 Paddle Number
3. 輸入出價金額（可使用快速按鈕）
4. 選填備註
5. 確認記錄

### 結標處理

1. 在 ListView 點擊「結標」
2. 系統顯示確認對話框
3. 確認後自動取得最高出價並結標
4. 顯示得標者和落槌價

### 流標處理

1. 在 ListView 點擊「流標」
2. 選擇流標原因
3. 輸入備註說明
4. 確認流標

## TypeScript 介面

所有介面定義位於 `src/dto/liveAuction/`：

- `ILiveAuctionItem` - 商品資訊
- `ILiveAuctionStatus` - 即時狀態
- `IRecordBidRequest/Response` - 記錄競標
- `IHammerRequest/Response` - 結標
- `IPassRequest/Response` - 流標

## 狀態管理

使用 Jotai 管理狀態：

```typescript
interface AuctionInput_BizState {
  mode: 'List' | 'RecordBid' | 'Hammer' | 'Pass'
  itemList: ILiveAuctionItem[]
  selectedItem: ILiveAuctionItem | null
  currentStatus: ILiveAuctionStatus | null
}
```

## 注意事項

1. 所有 API 呼叫（除 Preview 和 Status）需要員工授權
2. 結標和流標操作不可撤銷
3. 出價金額必須高於目前最高價
4. 系統會自動更新商品狀態
5. 使用 SweetAlert2 顯示操作結果

## 參考文件

- FSD: `_doc/FSD.md`
- 資料庫架構: `_doc/Live Auction.MD`
- 參考實作: `pages/Admin/Vip`
