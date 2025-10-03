# 慈善募款活動系統 - 統一 API 規格書

## 1. API 基礎設定

### 1.1 基礎 URL
```
Production: 
Staging: 
```

### 1.2 認證機制
- 前台賓客：使用 JWT Token 進行身份認證
- 大螢幕：使用 API Key 或無需認證（僅讀取公開資料）
- Token 放置於 HTTP Header: `Authorization: Bearer {token}`
- Token 有效期：6 小時
- 支援 Token 刷新機制

### 1.3 通用回應格式
```json
{
  "success": boolean,
  "data": object | array | null,
  "message": string,
  "error": {
    "code": string,
    "details": string
  } | null
}
```

### 1.4 錯誤代碼
- `400` Bad Request - 請求參數錯誤
- `401` Unauthorized - 未授權
- `403` Forbidden - 無權限
- `404` Not Found - 資源不存在
- `409` Conflict - 資源衝突
- `500` Internal Server Error - 伺服器錯誤

### 1.5 資料更新策略 (Polling)
取代 WebSocket，所有即時更新採用 Polling 機制：

**前台 Polling 頻率：**
- 競標狀態更新：每 5 秒
- 通知檢查：每 10 秒
- 活動狀態：每 30 秒

**大螢幕 Polling 頻率：**
- Live Auction 競標價格：每 2 秒
- Open Ask 募款金額：每 3 秒
- Silent Auction 倒數計時：每 1 秒
- 其他靜態內容：每 10 秒

## 2. 賓客認證 API

### 2.1 賓客名單查詢
**POST** `/api/auth/vip/GuestList`

查詢可登入的賓客名單（用於登入前的自動完成功能）。

**Request Body:**
```json
{
  "credential": "string"  //查詢憑證（如員工代碼）
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "guests": [
      {
        "name": "string",  //賓客姓名
        "email": "string"  //賓客email
      }
    ]
  }
}
```

### 2.2 賓客登入
**POST** `/api/auth/vip/login`

進行登入驗證。

**Request Body:**
```json
{
  "name": "string",  //賓客姓名
  "email": "string"  //賓客email
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "string",  //Authorization token
    "guest": {
      "paddleNum": "string",  //賓客ID
      "name": "string",  //賓客姓名
      "email": "string",  //賓客email
      "tableNumber": "string"  //賓客桌號
    }
  }
}
```

## 3. 活動狀態 API

### 3.1 取得所有活動狀態
**GET** `/api/activities/status`

**標示：大螢幕可沿用**

取得六種活動的當前狀態。

**Response:**
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "type": "raffle" | "give" | "liveAuction" | "silentAuction" | "openAsk" | "donation",  //活動ID
        "name": "Raffle Ticket",  //活動名稱
        "status": "active" | "upcoming" | "ended",  //活動狀態
      }
    ]
  }
}
```

## 4. 大螢幕控制 API (大螢幕專用)

**顯示模式描述**

系統支援8種主要顯示模式：

1. **Live Auction** (`liveAuction`) - 現場拍賣商品展示與競標頁面
2. **Open Ask** (`open-ask`) - 募款活動進度顯示（支援多Round）
3. **Raffle Ticket - 抽獎進行中** (`raffleTicketDrawing`) - 抽獎滾動動畫頁面
4. **Raffle Ticket - 單一獎品展示** (`raffleTicketPrizeDisplay`) - 抽獎前獎品預覽頁面
5. **Raffle Ticket - 得獎名單輪播** (`raffleTicketWinnersCarousel`) - 所有得獎者名單展示
6. **Silent Auction** (`silentAuction`) - 靜態拍賣商品輪播與倒數計時
7. **Give to Win - 抽獎進行中** (`giveToWin`) - 福袋抽獎動畫與結果顯示
7. **Give to Win - 單一獎品展示** (`giveToWinGiftsDisplay`) - 福袋抽獎前獎品預覽頁面
### 4.1 大螢幕狀態查詢
**GET** `/api/display/status`

**Response:**
```json
{
  "success": true,
  "data": {
    "currentMode": "liveAuction" | "openAsk" | "raffleTicketDrawing" | "raffleTicketPrizeDisplay" | "raffleTicketWinnersCarousel" | "silentAuction" | "giveToWin" | "giveToWinGiftsDisplay", //當前顯示模式
    "isActive": boolean, //大螢幕是否啟動
    "currentItemId": "string" //當前顯示項目的唯一識別碼
  }
}
```

### 4.2 切換顯示模式
**POST** `/api/display/switch`

**Request Body:**
```json
{
  "mode": "liveAuction" | "openAsk" | "raffleTicketDrawing" | "raffleTicketPrizeDisplay" | "raffleTicketWinnersCarousel" | "silentAuction" | "giveToWin" | "giveToWinGiftsDisplay", //當前顯示模式
  "itemId": "string", //項目ID（選填）
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "currentMode": "string",
    "message": "string"
  }
}
```

## 5. Raffle Ticket API

### 5.1 取得獎品清單
**GET** `/api/raffleticket/prizes`

**標示：大螢幕可沿用**

**Response:**
```json
{
  "success": true,
  "data": {
    "prizes": [
      {
        "prizeId": "string", //獎品ID
        "name": "string", //獎品名稱
        "description": "string", //獎品描述
        "image": "string", //獎品圖片URL
        "value": "string", //獎品價值
        "category": "major" | "minor" //大獎或小獎分類
      }
    ]
  }
}
```

### 5.2 取得指定獎品詳情
**GET** `/api/raffleticket/prize/{prizeId}`

**Response:**
```json
{
  "success": true,
  "data": {
    "prize": {
      "prizeId": "string", //獎品ID
      "name": "string", //獎品名稱
      "description": "string", //獎品描述
      "image": "string", //獎品圖片URL
      "value": "string", //獎品價值
      "category": "major" | "minor" //大獎或小獎分類
    }
  }
}
```

### 5.3 取得我的票券
**GET** `/api/raffleticket/mytickets`

**Headers:**
- `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "raffleTicketNo": "string", //票券編號
        "purchaseTime": "ISO 8601", //購買時間
        "isWinner": boolean, //是否中獎
        "prizeId": "string" | null, //中獎獎品ID
        "prizeName": "string" | null //中獎獎品名稱
      }
    ],
    "totalCount": number
  }
}
```

### 5.4 取得中獎結果
**GET** `/api/raffleticket/winner/{prizeId}`

**Response:**
```json
{
  "success": true,
  "data": {
    "winner": {
      "prizeId": "string", //獎品ID
      "prizeName": "string", //獎品名稱
      "winnerID": "string",  //中獎賓客ID
      "winnerName": "string",  //中獎賓客姓名
      "ticketNumber": "string", //中獎票號
      "drawTime": "ISO 8601"  //抽獎時間
    }
  }
}
```

### 5.5 取得所有得獎名單
**GET** `/api/raffleticket/winners`

**Response:**
```json
{
  "success": true,
  "data": {
    "winners": [
      {
        "prizeId": "string", //獎品ID
        "prizeName": "string", //獎品名稱
        "prizeDescription": "string", //獎品描述
        "prizeImage": "string", //獎品圖片URL
        "prizeValue": "string", //獎品價值
        "winnerID": "string",  //中獎賓客ID
        "winnerName": "string",  //中獎賓客姓名
        "ticketNumber": "string",  //中獎票號
        "drawTime": "ISO 8601"  //抽獎時間
      }
    ]
  }
}
```

### 5.6 輪播設定
**GET** `/api/raffleticket/carousel/settings`

**Response:**
```json
{
  "success": true,
  "data": {
    "interval": number,  // 輪播間隔（秒）
    "autoPlay": boolean, // 是否自動輪播
    "showConfetti": boolean // 是否顯示慶祝動畫
  }
}
```

### 5.7 抽獎通知 (Polling)
**GET** `/api/raffleticket/notifications/check`

**Headers:**
- `Authorization: Bearer {token}`

前台定期呼叫此 API 檢查是否中獎。

**Response:**
```json
{
  "success": true,
  "data": {
    "hasNewWin": boolean,
    "wins": [
      {
        "ticketNumber": "string",  //中獎票號
        "prizeId": "string", //獎品ID
        "prizeName": "string", //獎品名稱
        "timestamp": "ISO 8601"  //抽獎時間
      }
    ]
  }
}
```

## 6. Give to Win API

### 6.1 取得福袋清單
**GET** `/api/givetowin/gifts`

**標示：大螢幕可沿用**

**Response:**
```json
{
  "success": true,
  "data": {
    "packages": [
      {
        "giftId": "string", // 福袋類型唯一識別碼
        "name": "string", // 福袋名稱
        "description": "string", // 福袋描述
        "image": "string", // 福袋圖片URL
        "value": "string" // 福袋價值
      }
    ]
  }
}
```

### 6.2 取得單一福袋詳情
**GET** `/api/givetowin/gifts/{giftId}`

**Response:**
```json
{
  "success": true,
  "data": {
    "package": {
      "giftId": "string", // 福袋類型唯一識別碼
      "name": "string", // 福袋名稱
      "description": "string", // 福袋描述
      "image": "string", // 福袋圖片URL
      "value": "string" // 福袋價值
    }
  }
}
```

### 6.3 取得我的福袋
**GET** `/api/givetowin/mytickets/{giftId}`

**Headers:**
- `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "giveTicketNo": "string", // 福袋票券編號
        "purchaseTime": "ISO 8601", //購買時間
        "isWinner": boolean //是否中獎
      }
    ],
    "totalCount": number
  }
}
```

### 6.4 取得福袋中獎結果
**GET** `/api/givetowin/result/{giftId}`

**Response:**
```json
{
  "success": true,
  "data": {
    "giftId": "string", // 福袋類型ID
    "giftName": "string", // 福袋名稱
    "winnerID": "string",  //中獎賓客ID
    "winnerName": "string", // 中獎者姓名
    "giftNumber": "string", // 中獎福袋編號
    "prizeDetails": {
      "name": "string", // 實際獎品名稱
      "value": "string", // 實際獎品價值
      "image": "string" // 實際獎品圖片URL
    },
    "drawTime": "string" // 抽獎時間（ISO 8601）
  }
}
```

## 7. Live Auction API

### 7.1 取得拍賣商品預覽
**GET** `/api/liveauction/preview`

**標示：大螢幕可沿用**

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "itemId": "string", // 商品ID
        "name": "string", // 商品名稱
        "description": "string", // 商品描述
        "image": "string", // 商品圖片URL
        "startingPrice": number, // 起標價
        "reservePrice": number, // 底價
        "status": "active" | "ended" // 拍賣狀態
      }
    ]
  }
}
```

### 7.2 取得指定拍賣商品詳情
**GET** `/api/liveauction/preview/{itemId}`

**Response:**
```json
{
  "success": true,
  "data": {
    "item": {
      "itemId": "string", // 商品ID
      "name": "string", // 商品名稱
      "description": "string", // 商品描述
      "image": "string", // 商品圖片URL
      "startingPrice": number, // 起標價
      "reservePrice": number, // 底價
      "status": "active" | "ended" // 拍賣狀態
    }
  }
}
```

### 7.3 取得即時競標狀態
**GET** `/api/liveauction/status/{itemId}`

**Response:**
```json
{
  "success": true,
  "data": {
    "currentPrice": number, // 當前最高價格
    "bidderID": "string", // 出價者ID
    "bidderName": "string", // 出價者姓名
    "timestamp": "string", // 出價時間戳記
    "isEnded": boolean, // 是否已結標
    "finalWinnerID": "string", // 最終得標者ID（結標後顯示）
    "finalWinnerName": "string" // 最終得標者姓名（結標後顯示）
  }
}
```

## 8. Silent Auction API

### 8.1 取得商品清單
**GET** `/api/silentauction/items`

**標示：大螢幕可沿用**

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "itemId": "string", // 商品ID
        "name": "string", // 商品名稱
        "description": "string", // 商品描述
        "image": "string", // 商品圖片URL
        "startPrice": number, // 起標價
        "currentPrice": number,  //當前價格
        "minIncrement": number,  //最低加價
        "currentBidderPaddleNum": "string",  //最高出價者
        "currentBidderPaddleName": "string", //最高出價者姓名
        "endTime": "ISO 8601"  //結標時間
      }
    ]
  }
}
```

### 8.2 取得單一商品詳情
**GET** `/api/silentauction/items/{itemId}`

**標示：大螢幕可沿用**

**Response:**
```json
{
  "success": true,
  "data": {
    "item": {
      "itemId": "string", // 商品ID
      "name": "string", // 商品名稱
      "description": "string", // 商品描述
      "image": "string", // 商品圖片URL
      "startPrice": number, // 起標價
      "currentPrice": number,  //當前價格
      "minIncrement": number,  //最低加價
      "currentBidderPaddleNum": "string",  //最高出價者
      "currentBidderPaddleName": "string", //最高出價者姓名
      "endTime": "ISO 8601",  //結標時間
      "timeRemaining": number,  //剩餘秒數
      "status": "active" | "ended",  //拍賣狀態
      "bidHistory": [
        {
          "bidderPaddleNum": "string",  //出價者
          "bidderPaddleName": "string", // 出價者姓名
          "amount": number,  //出價價格
          "timestamp": "ISO 8601"  //出價時間
        }
      ]
    }
  }
}
```

### 8.3 取得出價歷史
**GET** `/api/silentauction/items/{itemId}/bidHistory`

**Headers:**
- `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "data": {
    "item": {
      "itemId": "string", // 商品ID
      "currentPrice": number,  //當前價格
      "isCurrentBidder": boolean,  //是否最高出價者
      "bidHistory": [
        {
          "amount": number,  //出價價格
          "timestamp": "ISO 8601"  //出價時間
        }
      ],
      "userCurrentBid": number | null //用戶當前出價
    }
  }
}
```

### 8.4 提交出價
**POST** `/api/silentauction/items/{itemId}/bid`

**Headers:**
- `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "amount": number  //出價價格
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "itemId": "string", // 商品ID
    "amount": number,  //出價價格
    "isHighestBid": boolean,  //是最高出價
    "currentHighestBid": number,  //當前價格
    "timestamp": "ISO 8601"  //出價時間
  }
}
```

### 8.5 輪播設定
**GET** `/api/silentauction/carousel/settings`

**Response:**
```json
{
  "success": true,
  "data": {
    "interval": number, // 輪播間隔（秒）
    "autoPlay": boolean, // 是否自動輪播
    "itemOrder": ["string"] // 商品顯示順序
  }
}
```

### 8.6 出價通知檢查 (Polling)
**GET** `/api/silentauction/notifications/check`

**Headers:**
- `Authorization: Bearer {token}`

前台每 10 秒 Polling 此 API 檢查出價是否被超越。

**Response:**
```json
{
  "success": true,
  "data": {
    "hasNewOvertaken": boolean,  //是否已有新超越
    "overtakenBids": [
      {
        "itemId": "string", // 商品ID
        "itemName": "string", // 商品名稱
        "yourBid": number,  //你的出價價格
        "newHighestBid": number,  //當前價格
        "timestamp": "ISO 8601"  //出價時間
      }
    ]
  }
}
```

## 9. Open Ask API

### 9.1 取得募款狀態
**GET** `/api/openask/status/{roundNumber}`

**Response:**
```json
{
  "success": true,
  "data": {
    "roundNumber": "string",  // 當前Round募款金額
    "currentAmount": number, // 當前Round募款金額
    "donorCount": number,  // 當前Round捐款人數
    "isActive": boolean   // 募款是否進行中
  }
}
```

### 9.2 取得最新捐款記錄
**GET** `/api/openask/donations/recent/{roundNumber}`

**Query Parameters:**
- `limit`: number (預設: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "donations": [
      {
        "paddleNum": "string",  // 捐款者ID
        "paddleName": "string", // 捐款者姓名
        "amount": number, // 捐款金額
        "timestamp": "ISO 8601" // 捐款時間
      }
    ]
  }
}
```

## 10. Donation API

### 10.1 取得捐款功能狀態
**GET** `/api/donation/status`

**標示：大螢幕可沿用**

**Response:**
```json
{
  "success": true,
  "data": {
    "isEnabled": boolean, // 捐款功能是否開放
    "minAmount": number, // 最小捐款金額
    "totalAmount": number, // 總捐款金額
    "donorCount": number, // 總捐款人數
  }
}
```

### 10.2 提交捐款
**POST** `/api/donation/donate`

**Headers:**
- `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "amount": number  //捐款金額
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "amount": number,  //捐款金額
    "timestamp": "ISO 8601"  // 捐款時間
  }
}
```

## 11. 消費明細 API

### 11.1 取得消費明細
**GET** `/api/transactions/summary`

取得賓客的所有消費記錄、中獎票券、付款狀態與收據資訊。

**Headers:**
- `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "data": {
    "winningTickets": {
      "raffle": [
        {
          "ticketNumber": "string",  //中獎票號
          "prize": "string",  //獎品名稱
          "value": number  //獎品價值
        }
      ],
      "gift": [
        {
          "ticketNumber": "string",  //中獎福袋編號
          "type": "string",  //福袋類型
          "content": "string",  //福袋內容
          "value": number  //福袋價值
        }
      ]
    },
    "summary": {
      "totalAmount": number,  //消費總金額
      "paidAmount": number,  //已支付金額
      "unpaidAmount": number  //未支付金額
    },
    "transactions": [
      {
        "transactionId": "string",  //交易識別碼
        "type": "silentAuction" | "liveAuction" | "openAsk" | "donation",  //消費類型
        "name": "string",  //消費項目名稱（例如: "得標: 神秘藝術品 #001", "愛心捐款"）
        "amount": number,  //消費金額
        "status": "unpaid" | "partial" | "paid",  //付款狀態
        "paidAmount": number | null,  //已支付金額（僅在 status 為 "partial" 時提供）
        "time": "string"  //消費時間（格式: "MM-dd HH:mm"）
      }
    ],
    "receiptInfo": {
      "receiptType": "none" | "individual" | "company",  //收據類型
      "receiptTitle": "string",  //收據抬頭
      "receiptTaxId": "string",  //統一編號/身份證號
      "receiptEmail": "string"  //收據 Email
    }
  }
}
```

**說明：**
- 透過 JWT Token 自動識別賓客身份
- `winningTickets`: 顯示所有中獎的抽獎券與福袋
- `transactions`: 僅顯示需要付款的活動（Silent Auction、Live Auction、Open Ask、Donation）
- Raffle Ticket 和 Give to Win 因為購買時已付款，不會出現在 transactions 列表中

### 11.2 更新收據資訊
**POST** `/api/transactions/receipt`

更新賓客的收據資訊，用於開立收據。全額付清時系統將自動發送感謝函。

**Headers:**
- `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "receiptType": "none" | "individual" | "company",  //收據類型
  "receiptTitle": "string",  //收據抬頭（當 receiptType 不為 "none" 時必填）
  "receiptTaxId": "string",  //統一編號/身份證號（當 receiptType 為 "company" 時必填）
  "receiptEmail": "string"  //收據 Email（選填）
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "string"  //顯示訊息（例如: "🎉 感謝您的參與。\n系統將自動發送感謝函給您。"）
  }
}
```

**說明：**
- 透過 JWT Token 自動識別賓客身份
- 當 `receiptType` 為 "none" 時，不需要填寫 `receiptTitle` 和 `receiptTaxId`
- 當 `receiptType` 為 "individual" 時，必須填寫 `receiptTitle`
- 當 `receiptType` 為 "company" 時，必須填寫 `receiptTitle` 和 `receiptTaxId`（統一編號）
- 系統會自動檢查是否全額付清，若是則觸發感謝函發送

## 12. 通知管理 API

### 12.1 取得通知列表
**GET** `/api/notifications`

**Headers:**
- `Authorization: Bearer {token}`

**Query Parameters:**
- `type`: "all" | "auction" | "raffle" | "system"
- `isRead`: boolean
- `limit`: number

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "notificationId": "string",  //通知ID
        "type": "auctionOvertaken" | "raffleWinner" | "auctionEnding" | "paymentReminder",
        "title": "string",  //標題
        "message": "string",  //訊息
        "timestamp": "ISO 8601",  //通知時間
        "isRead": boolean,  //是否已讀
        "actionUrl": "string" | null  //通知連結
      }
    ],
    "unreadCount": number  //未讀數
  }
}
```

### 12.2 標記通知已讀
**PUT** `/api/notifications/{notificationId}/read`

**Headers:**
- `Authorization: Bearer {token}`
