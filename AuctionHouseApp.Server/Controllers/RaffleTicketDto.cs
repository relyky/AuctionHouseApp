using Reinforced.Typings.Attributes;

namespace AuctionHouseApp.Server.Controllers;

// ========== Internal Query Models ==========

internal record RaffleWinnerQueryResult(
  string PrizeId,
  string RaffleTickerNo,
  DateTime DrawDtm,
  string BuyerName,
  string BuyerEmail,
  string PrizeName
);

internal record VipLookupResult(
  string PaddleNum
);

internal record AllWinnersQueryResult(
  string PrizeId,
  string RaffleTickerNo,
  DateTime DrawDtm,
  string BuyerName,
  string BuyerEmail,
  string PrizeName,
  string PrizeDescription,
  string PrizeImage,
  decimal PrizeValue
);

internal record VipBatchLookupResult(
  string VipEmail,
  string PaddleNum
);

// ========== 5.4 取得中獎結果 ==========

[TsInterface(Namespace = "dto.raffleticket")]
public record RaffleWinnerResponse(
  RaffleWinnerData Data
);

[TsInterface(Namespace = "dto.raffleticket")]
public record RaffleWinnerData(
  string PrizeId,
  string PrizeName,
  string WinnerID,
  string WinnerName,
  string TicketNumber,
  string DrawTime
);

// ========== 5.5 取得所有得獎名單 ==========

[TsInterface(Namespace = "dto.raffleticket")]
public record RaffleWinnersResponse(
  RaffleWinnersData Data
);

[TsInterface(Namespace = "dto.raffleticket")]
public record RaffleWinnersData(
  List<RaffleWinnerItem> Winners
);

[TsInterface(Namespace = "dto.raffleticket")]
public record RaffleWinnerItem(
  string PrizeId,
  string PrizeName,
  string PrizeDescription,
  string PrizeImage,
  string PrizeValue,
  string WinnerID,
  string WinnerName,
  string TicketNumber,
  string DrawTime
);
