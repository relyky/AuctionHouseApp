using Reinforced.Typings.Attributes;

namespace AuctionHouseApp.Server.Controllers;

// ========== 11.1 取得消費明細 ==========
[TsInterface(Namespace = "dto.transactions")]
public record TransactionSummaryResult_Data(
  TransactionWinningTickets WinningTickets,
  TransactionSummary Summary,
  List<TransactionItem> Transactions,
  ReceiptInfo ReceiptInfo
);

[TsInterface(Namespace = "dto.transactions")]
public record TransactionWinningTickets(
  List<RaffleWinningTicket> Raffle,
  List<GiftWinningTicket> Gift
);

[TsInterface(Namespace = "dto.transactions")]
public record RaffleWinningTicket(
  string TicketNumber,
  string Prize,
  decimal Value
);

[TsInterface(Namespace = "dto.transactions")]
public record GiftWinningTicket(
  string TicketNumber,
  string Type,
  string Content,
  decimal Value
);

[TsInterface(Namespace = "dto.transactions")]
public record TransactionSummary(
  decimal TotalAmount,
  decimal PaidAmount,
  decimal UnpaidAmount
);

[TsInterface(Namespace = "dto.transactions")]
public record TransactionItem(
  string Type,
  string TransactionId,
  string Name,
  decimal Amount,
  string Status,
  decimal? PaidAmount,
  string Time
);

[TsInterface(Namespace = "dto.transactions")]
public record ReceiptInfo(
  string ReceiptType,
  string ReceiptTitle,
  string ReceiptTaxId,
  string ReceiptEmail
);

// ========== 11.2 更新收據資訊 ==========

[TsInterface(Namespace = "dto.transactions")]
public record UpdateReceiptArgs(
  string ReceiptType,
  string? ReceiptTitle,
  string? ReceiptTaxId,
  string? ReceiptEmail
);

[TsInterface(Namespace = "dto.transactions")]
public record UpdateReceiptResult_Data(
  string Message
);

// ========== 11.3 更新付款狀態 ==========

[TsInterface(Namespace = "dto.transactions")]
public record UpdatePaymentArgs(
  string PaddleNum,
  string Type,
  string TransactionId,
  string PaymentStatus,
  decimal PaidAmount,
  string? PaymentNotes
);

[TsInterface(Namespace = "dto.transactions")]
public record UpdatePaymentResult_Data(
  string Message
);

// ========== 11.4 批次更新付款狀態 ==========

[TsInterface(Namespace = "dto.transactions")]
public record BatchUpdatePaymentArgs(
  string PaddleNum,
  List<BatchPaymentItem> Transactions,
  string PaymentStatus,
  string? PaymentNotes
);

[TsInterface(Namespace = "dto.transactions")]
public record BatchPaymentItem(
  string Type,
  string TransactionId
);

[TsInterface(Namespace = "dto.transactions")]
public record BatchUpdatePaymentResult_Data(
  int UpdatedCount,
  string Message
);
