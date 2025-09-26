using Dapper;
using Microsoft.Extensions.Caching.Memory;
using System.Collections.Immutable;
using Vista.DB;
using Vista.DB.Schema;

namespace AuctionHouseApp.Server.Services;

/// <summary>
/// 取得系統參數。並放入 cache 以免一直重複抓 DB。
/// 資料相依於 DB，故註冊成 Singleton。
/// </summary>
public class SysParamsService(
  IMemoryCache _cache,
  ILogger<SysParamsService> _logger)
{
  /// <summary>
  /// 系統參數：抽獎券單價
  /// </summary>
  public decimal GetRaffleUnitPrice()
  {
    const string sql = @"SELECT * FROM [dbo].[SysParameter] (NOLOCK) WHERE IdName = 'RaffleUnitPrice' ";
    const string cacheIdName = @"SysParameter_RaffleUnitPrice";

    decimal raffleUnitPrice = 0m;

    //# 若 cache 有值就送回 cache 的值。
    if (_cache.TryGetValue<decimal>(cacheIdName, out raffleUnitPrice))
    {
      _logger.LogDebug("系統參數：抽獎券單價 => 取自 cache => {raffleUnitPrice}", raffleUnitPrice);
      return raffleUnitPrice;
    }

    //# 否則自 DB 取系統參數。
    //※ 失敗或未設定時傳回 0 不讓系統當掉。
    using var conn = DBHelper.AUCDB.Open();
    var info = conn.QueryFirstOrDefault<SysParameter>(sql);
    if (decimal.TryParse(info?.Value, out raffleUnitPrice))
    {
      _logger.LogDebug("系統參數：抽獎券單價 => 取自 DB 成功 => {raffleUnitPrice}。", raffleUnitPrice);

      // 存入 cache 5分鐘並 sliding 3分鐘
      _cache.Set<decimal>(cacheIdName, raffleUnitPrice, new MemoryCacheEntryOptions
      {
        SlidingExpiration = TimeSpan.FromMinutes(5), // 若有存取則延長 5 分鐘
        AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(30) // 最長存活時間
      });
    }
    else
    {
      raffleUnitPrice = 0m;
      _logger.LogDebug("系統參數：抽獎券單價 => 取自 DB 失敗傳回預設值 => {raffleUnitPrice}。", raffleUnitPrice);
    }

    return raffleUnitPrice;
  }

  /// <summary>
  /// 系統參數：抽獎券圖片網址
  /// </summary>
  /// <returns></returns>
  public string GetRaffleTicketImageUrl()
  {
    const string sql = @"SELECT * FROM [dbo].[SysParameter] (NOLOCK) WHERE IdName = 'RaffleTicketImageUrl' ";
    const string cacheIdName = @"SysParameter_RaffleTicketImageUrl";

    string? raffleTicketImageUrl = "unknown";

    //# 若 cache 有值就送回 cache 的值。
    if (_cache.TryGetValue<string>(cacheIdName, out raffleTicketImageUrl))
    {
      _logger.LogDebug("系統參數：抽獎券圖片網址 => 取自 cache 成功");
      return raffleTicketImageUrl!;
    }

    //# 否則自 DB 取系統參數。
    //※ 失敗或未設定時傳回 0 不讓系統當掉。
    using var conn = DBHelper.AUCDB.Open();
    var info = conn.QueryFirstOrDefault<SysParameter>(sql);
    if (info != null)
    {
      raffleTicketImageUrl = info.Value;
      _logger.LogDebug("系統參數：抽獎券圖片網址 => 取自 DB 成功");

      // 存入 cache 5分鐘並 sliding 3分鐘
      _cache.Set<string>(cacheIdName, raffleTicketImageUrl, new MemoryCacheEntryOptions
      {
        SlidingExpiration = TimeSpan.FromMinutes(5), // 若有存取則延長 5 分鐘
        AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(30) // 最長存活時間
      });
    }
    else
    {
      raffleTicketImageUrl = "unknown";
      _logger.LogDebug("系統參數：抽獎券圖片網址 => 取自 DB 失敗傳回預設值");
    }

    return raffleTicketImageUrl;
  }

  /// <summary>
  /// 系統參數：福袋抽獎券單價
  /// </summary>
  public decimal GetGiveUnitPrice()
  {
    const string sql = @"SELECT * FROM [dbo].[SysParameter] (NOLOCK) WHERE IdName = 'GiveUnitPrice' ";
    const string cacheIdName = @"SysParameter_GiveUnitPrice";

    decimal giveUnitPrice = 0m;

    //# 若 cache 有值就送回 cache 的值。
    if (_cache.TryGetValue<decimal>(cacheIdName, out giveUnitPrice))
    {
      _logger.LogDebug("系統參數：福袋抽獎券單價 => 取自 cache => {giveUnitPrice}", giveUnitPrice);
      return giveUnitPrice;
    }

    //# 否則自 DB 取系統參數。
    //※ 失敗或未設定時傳回 0 不讓系統當掉。
    using var conn = DBHelper.AUCDB.Open();
    var info = conn.QueryFirstOrDefault<SysParameter>(sql);
    if (decimal.TryParse(info?.Value, out giveUnitPrice))
    {
      _logger.LogDebug("系統參數：福袋抽獎券單價 => 取自 DB 成功 => {giveUnitPrice}。", giveUnitPrice);

      // 存入 cache 5分鐘並 sliding 3分鐘
      _cache.Set<decimal>(cacheIdName, giveUnitPrice, new MemoryCacheEntryOptions
      {
        SlidingExpiration = TimeSpan.FromMinutes(5), // 若有存取則延長 5 分鐘
        AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(30) // 最長存活時間
      });
    }
    else
    {
      giveUnitPrice = 0m;
      _logger.LogDebug("系統參數：福袋抽獎券單價 => 取自 DB 失敗傳回預設值 => {giveUnitPrice}。", giveUnitPrice);
    }

    return giveUnitPrice;
  }

  /// <summary>
  /// 系統參數：前端網站參數
  /// FrontWeb_PublicUrlBase
  /// </summary>
  public string GetFrontWeb_PublicUrlBase()
  {
    const string sql = @"SELECT * FROM [dbo].[SysParameter] (NOLOCK) WHERE IdName = 'FrontWeb_PublicUrlBase' ";
    const string cacheIdName = @"SysParameter_FrontWeb_PublicUrlBase";

    string? frontWeb_PublicUrlBase = "unknown";

    //# 若 cache 有值就送回 cache 的值。
    if (_cache.TryGetValue<string>(cacheIdName, out frontWeb_PublicUrlBase))
    {
      _logger.LogDebug("系統參數：前端網站參數 => 取自 cache 成功");
      return frontWeb_PublicUrlBase!;
    }

    //# 否則自 DB 取系統參數。
    //※ 失敗或未設定時傳回 0 不讓系統當掉。
    using var conn = DBHelper.AUCDB.Open();
    var info = conn.QueryFirstOrDefault<SysParameter>(sql);
    if (info != null)
    {
      frontWeb_PublicUrlBase = info.Value;
      _logger.LogDebug("系統參數：前端網站參數 => 取自 DB 成功");

      // 存入 cache 5分鐘並 sliding 3分鐘
      _cache.Set<string>(cacheIdName, frontWeb_PublicUrlBase, new MemoryCacheEntryOptions
      {
        SlidingExpiration = TimeSpan.FromMinutes(5), // 若有存取則延長 5 分鐘
        AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(30) // 最長存活時間
      });
    }
    else
    {
      frontWeb_PublicUrlBase = "unknown";
      _logger.LogDebug("系統參數：前端網站參數 => 取自 DB 失敗傳回預設值");
    }

    return frontWeb_PublicUrlBase;
  }
}

