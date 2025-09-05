using AuctionHouseTpl.Server.DTO;
using Dapper;
using System.Collections.Concurrent;
using System.Collections.Immutable;
using Vista.DB;
using Vista.DB.Schema;
using Vista.DbPanda;

namespace AuctionHouseTpl.Server.Services;

/// <summary>
/// 拍賣現在狀態資訊暫存庫。
/// 必需註冊成 singleton。
/// </summary>
public class LiveAuctionStatusService(ILogger<LiveAuctionStatusService> _logger)
{
  /// <summary>
  /// 資源：Rowversion 累進種子。
  /// </summary>
  static uint _rowversionCounter = 0;

  /// <summary>
  /// 資源：競標開啟序號累進種子。
  /// </summary>
  static int _bidOpenSnCounter = 0;

  /// <summary>
  /// 資源：鎖定物件。
  /// </summary>
  readonly object _lock = new();

  readonly LiveAuctionStatus _empty = new();

  /// <summary>
  /// 拍賣現在狀態資訊。
  /// </summary>
  LiveAuctionStatus? _status = null;

  /// <summary>
  /// 所有競價資訊統一以資料庫的為準。故不做中介緩存。
  /// </summary>
  //List<BiddingEvent> biddingEventList = [];

  /// <summary>
  /// 廣播台競價訊息泡泡緩衝區 Queue。
  /// ※ 停用中!!!
  /// ※ 只能有一個廣播台。不然訊息會打散到不同廣播台。
  /// </summary>
  public ConcurrentQueue<BiddingEvent> BroadcastBiddingEventBubble = new();

  public LiveAuctionStatus LiveStatus => _status ?? _empty;

  /// <summary>
  /// 選取拍品以開始競價。
  /// </summary>
  public void SelectLotForBidding(string lotNo)
  {
    lock (_lock)
    {
      // validation
      if (_status?.IsLocked ?? false) return;

      // 取得是否已落槌
      using var conn = Vista.DB.DBHelper.AUCDB.Open();
      var info = conn.GetEx<HammeredRecord>(new { LotNo = lotNo });
      Boolean IsHammered = (info != null);

      // GO
      _logger.LogInformation("SelectLotForBidding {LotNo} IsHammered={IsHammered}", lotNo, IsHammered);
      _status = new LiveAuctionStatus
      {
        CurLotNo = lotNo,
        IsHammered = IsHammered,
        Rowversion = Interlocked.Increment(ref _rowversionCounter) // 加入版次判斷有否異動。
      };
    }
  }

  /// <summary>
  /// 鎖住拍品才可開始競標。
  /// </summary>
  public string LockLotForBidding()
  {
    lock (_lock)
    {
      if (_status is null)
        return "非預期狀態不可執行！";

      // GO
      _status = _status with
      {
        IsLocked = true,
        Step = StepEnum.Step2_StartPrice,
        Rowversion = Interlocked.Increment(ref _rowversionCounter) // 加入版次判斷有否異動。
      };

      return "SUCCESS";
    }
  }

  public string UnlockLot()
  {
    lock (_lock)
    {
      if (_status is null)
        return "非預期狀態不可執行！";

      // GO
      _status = _status with
      {
        IsLocked = false,
        Step = StepEnum.Step1_PickLot,
        Rowversion = Interlocked.Increment(ref _rowversionCounter) // 加入版次判斷有否異動。
      };

      return "SUCCESS";
    }
  }

  /// <summary>
  /// 設定起拍金增/現在出價。
  /// </summary>
  public string SetCurBidPrice(decimal curBidPrice)
  {
    lock (_lock)
    {
      if (_status is null)
        return "非預期狀態不可執行！";

      // GO
      _status = _status with
      {
        CurBidPrice = curBidPrice,
        Rowversion = Interlocked.Increment(ref _rowversionCounter) // 加入版次判斷有否異動。
      };

      return "SUCCESS";
    }
  }

  /// <summary>
  /// 設定出價增額/一刀增額。
  /// </summary>
  public string SetBidIncrement(decimal bidInc)
  {
    lock (_lock)
    {
      if (_status is null)
        return "非預期狀態不可執行！";

      // GO
      _status = _status with
      {
        BidIncrement = bidInc,
        Rowversion = Interlocked.Increment(ref _rowversionCounter) // 加入版次判斷有否異動。
      };

      return "SUCCESS";
    }
  }

  public string StartBidding()
  {
    lock (_lock)
    {
      if (_status is null)
        return "非預期狀態不可執行！";

      if (_status.CurBidPrice <= 0m)
        return "出價金額不可為 0！";

      if (_status.BidIncrement <= 0m)
        return "一刀增額不可為 0！";

      // GO
      _status = _status with
      {
        IsBidOpen = true, // 開啟競標。
        BidOpenSn = Interlocked.Increment(ref _bidOpenSnCounter), // 產生一個新的競標開啟序號。
        ThisBidOpenTime = DateTime.Now,
        ThisBidCloseTime = null,
        Step = StepEnum.Step3_Bidding,
        Rowversion = Interlocked.Increment(ref _rowversionCounter) // 加入版次判斷有否異動。
      };

      return "SUCCESS";
    }
  }

  public string StopBidding()
  {
    lock (_lock)
    {
      if (_status is null)
        return "非預期狀態不可執行！";

      // GO
      _status = _status with
      {
        IsBidOpen = false, // 開啟競標。
        ThisBidCloseTime = DateTime.Now,
        Step = StepEnum.Step4_CheckBid,
        Rowversion = Interlocked.Increment(ref _rowversionCounter) // 加入版次判斷有否異動。
      };

      return "SUCCESS";
    }
  }

  /// <summary>
  /// 變更狀態:落槌成交或流標。
  /// </summary>
  public string UpdateHammered() 
  {
    lock (_lock)
    {
      if (_status is null)
        return "非預期狀態不可執行！";

      // GO
      _status = _status with
      {
        LastBiddingEventUpdDtm = DateTime.Now, // 更新最後出價事件時間。以刷新相關前端 UI。
        Step = StepEnum.Step5_Hammer,
        Rowversion = Interlocked.Increment(ref _rowversionCounter) // 加入版次判斷有否異動。
      };

      return "SUCCESS";
    }
  }

  /// <summary>
  /// 變更狀態:開始下一筆拍品競標。
  /// </summary>
  public string NextLotForBidding()
  {
    lock (_lock)
    {
      if (_status is null)
        return "非預期狀態不可執行！";

      // GO
      _status = _status with
      {
        CurLotNo = string.Empty,
        CurBidPrice = 0m,
        BidIncrement = 0m,
        IsLocked = false,
        IsBidOpen = false,
        Step = StepEnum.Step1_PickLot,
        Rowversion = Interlocked.Increment(ref _rowversionCounter) // 加入版次判斷有否異動。
      };

      return "SUCCESS";
    }
  }

  /// <summary>
  /// 謹用於拍賣現場【拍賣官檢選(變更)有效出價】時通知前端 UI 進行有關聯的刷新。
  /// </summary>
  public string NotifyUiBiddingEventUpdate()
  {
    lock (_lock)
    {
      if (_status is null)
        return "非預期狀態不可執行！";

      // GO
      _status = _status with
      {
        LastBiddingEventUpdDtm = DateTime.Now,
        Rowversion = Interlocked.Increment(ref _rowversionCounter) // 加入版次判斷有否異動。
      };

      return "SUCCESS";
    }
  }

  /// <summary>
  /// 準備下一輪競價。設定下一輪的一的增額。
  /// </summary>
  public string PrepareNextBidding()
  {
    lock (_lock)
    {
      if (_status is null)
        return "非預期狀態不可執行！";

      //# 取最新有效出價，設定到下一輪出價金額
      string sql = """
SELECT TOP 1 * FROM [BiddingEvent]
WHERE LotNo = @LotNo
AND IsValid = 'Y'
ORDER BY BiddingSn DESC
""";

      using var conn = DBHelper.AUCDB.Open();
      var info = conn.QueryFirstOrDefault<BiddingEvent>(sql, new { LotNo = _status.CurLotNo });

      // GO
      _status = _status with
      {
        CurBidPrice = info?.BidPrice ?? _status.CurBidPrice,
        Step = StepEnum.Step2A_IncPrice,
        Rowversion = Interlocked.Increment(ref _rowversionCounter) // 加入版次判斷有否異動。
      };

      return "SUCCESS";
    }
  }
}

