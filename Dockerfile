# 使用官方的 ASP.NET Core 執行階段作為基礎映像
FROM mcr.microsoft.com/dotnet/aspnet:8.0

# 在容器內建立一個工作目錄
WORKDIR /app

# 將 _publish 目錄中的所有檔案複製到容器的 /app 目錄中
COPY ["_publish/", "."]

# 公開容器的 8080 連接埠，讓外部可以存取
EXPOSE 8080

# 設定容器啟動時執行的命令
# 這裡假設您的啟動專案是 AuctionHouseApp.Server.dll
ENTRYPOINT ["dotnet", "AuctionHouseApp.Server.dll"]