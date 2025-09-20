# AuctionHouseTpl 專案指南 for Gemini

## 專案總覽 (Project Overview)

本專案 (`AuctionHouseTpl`) 是一個功能完整的即時線上拍賣平台範本。它採用了現代化的前後端分離架構，旨在展示如何結合 .NET 後端與 React 前端來打造一個具備即時互動能力的 Web 應用程式。

- **核心功能**: 即時拍賣、線上競標、拍賣品管理。
- **主要角色**: 拍賣官(Auctioneer)、競標者(Bidder)。
- **使用者介面要求**: 競標者的使用者介面需以手機應用來設計。拍賣官的使用者介面則是網頁應用來設計。

## 技術棧 (Technology Stack)

- **後端 (Backend)**:
  - C# 12 / ASP.NET Core 8
- **前端 (Frontend)**:
  - TypeScript
  - React 19
  - Vite (建置工具)
  - Jotai (用於狀態管理，根據 `*Atom.ts` 檔案)
  - Material UI 7 (CSS Framework)
- **資料庫 (Database)**:
  - 一個獨立的 C# 類別庫 (`Vista.DB`) 用於定義資料模型，可能搭配 Entity Framework Core 或 Dapper 使用。

## 專案結構 (Project Structure)

- `AuctionHouseTpl.sln`: Visual Studio 解決方案檔案，整合所有 C# 專案。
- `AuctionHouseTpl.Server/`: ASP.NET Core 後端 Web API 專案。
- `auctionhousetpl.client/`: React + TypeScript 前端 SPA 專案。
- `Vista.DB/`: C# 資料庫模型與資料存取層專案。

## 忽略的檔案與目錄

-   `node_modules`
-   `.next`
-   `.git`
-   `.vscode`
-   `obj`
-   `bin`

## 開發環境設置與指令 (Development Setup & Commands)

- 在操作此前，請確保已安裝 .NET 8 SDK 和 Node.js (LTS 版本)。
- 程式碼檔一律使用 UTF-8 文字編碼。

### 後端 (ASP.NET Core)

所有指令應在 `AuctionHouseTpl.Server` 目錄下執行。

```bash
# 切換到後端專案目錄
cd AuctionHouseTpl.Server

# 還原 NuGet 套件
dotnet restore

# 啟動開發伺服器 (支援熱重載)
dotnet watch run

# 建置專案
dotnet build

# 格式化程式碼
dotnet format
```

### 前端 (React)

所有指令應在 `auctionhousetpl.client` 目錄下執行。

```bash
# 切換到前端專案目錄
cd auctionhousetpl.client

# 安裝 npm 依賴套件
npm install

# 啟動開發伺服器 (Vite)
npm run dev

# 建置用於生產環境的靜態檔案
npm run build

# 執行 ESLint 程式碼檢查
npm run lint
```

## 核心架構概念 (Core Architectural Concepts)

- **前後端分離**: 後端提供 RESTful API 和即時通訊端點，前端負責渲染 UI 和使用者互動。
- **即時通訊**: 後端 `BroadcastController` 和前端 `useBroadcastStream` hook 是實現即時拍賣的核心。當拍賣狀態改變時（如新的出價），後端會主動將更新推播給所有連接的前端客戶端。
- **狀態管理**: 前端使用原子化狀態管理 (Jotai/Recoil) 來處理全域狀態，這使得跨元件的狀態同步變得簡單高效，例如 `accountAtom`，用來告知現在登入者狀態。

## 資料庫 (Database)

- `Vista.DB` 專案定義了資料庫的結構 (Schema)。
- 實際的資料庫連線字串設定在 `AuctionHouseTpl.Server/appsettings.json` 中。
