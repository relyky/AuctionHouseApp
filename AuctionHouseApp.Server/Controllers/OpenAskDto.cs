using Reinforced.Typings.Attributes;

namespace AuctionHouseApp.Server.Controllers;

// ========== Internal Query Models ==========

internal record OpenAskRoundInfo(
  int Round,
  decimal Amount,
  string IsActive
);

internal record OpenAskStats(
  decimal CurrentAmount,
  int DonorCount
);

internal record OpenAskRecordItem(
  string PaddleNum,
  string PaddleName,
  decimal Amount,
  DateTime RecordDtm
);

// ========== 9.1 取得募款狀態 ==========

[TsInterface(Namespace = "dto.openask")]
public record OpenAskStatusResponse(
  OpenAskStatusData Data
);

[TsInterface(Namespace = "dto.openask")]
public record OpenAskStatusData(
  string RoundNumber,
  decimal CurrentAmount,
  int DonorCount,
  bool IsActive
);

// ========== 9.2 取得最新捐款記錄 ==========

[TsInterface(Namespace = "dto.openask")]
public record RecentDonationsResponse(
  RecentDonationsData Data
);

[TsInterface(Namespace = "dto.openask")]
public record RecentDonationsData(
  List<DonationItem> Donations
);

[TsInterface(Namespace = "dto.openask")]
public record DonationItem(
  string PaddleNum,
  string PaddleName,
  decimal Amount,
  string Timestamp
);
