using Reinforced.Typings.Attributes;

namespace AuctionHouseApp.Server.Controllers;

// ========== Internal Query Models ==========

internal record DonationSwitchInfo(
  string StringValue
);

internal record DonationStats(
  decimal TotalAmount,
  int DonorCount
);

internal record DonationInsertResult(
  decimal Amount,
  DateTime Timestamp
);

// ========== 10.1 取得捐款功能狀態 ==========

[TsInterface(Namespace = "dto.donation")]
public record DonationStatusResponse(
  DonationStatusData Data
);

[TsInterface(Namespace = "dto.donation")]
public record DonationStatusData(
  bool IsEnabled,
  decimal MinAmount,
  decimal TotalAmount,
  int DonorCount
);

// ========== 10.2 提交捐款 ==========

[TsInterface(Namespace = "dto.donation")]
public record DonateRequest(
  decimal Amount
);

[TsInterface(Namespace = "dto.donation")]
public record DonateResponse(
  DonateData Data
);

[TsInterface(Namespace = "dto.donation")]
public record DonateData(
  decimal Amount,
  string Timestamp
);
