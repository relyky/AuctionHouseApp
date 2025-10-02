using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Dapper;
using AuctionHouseApp.Server.Services;
using Vista.DB;

namespace AuctionHouseApp.Server.Controllers;

[Route("api/transactions")]
[ApiController]
public class TransactionsController(
    ILogger<TransactionsController> _logger,
    AuthVipService _vipSvc
  ) : ControllerBase
{
  /// <summary>
  /// 11.1 取得消費明細
  /// GET api/transactions/summary
  /// </summary>
  [Authorize(AuthenticationSchemes = "Bearer")]
  [HttpGet("summary")]
  public async Task<ActionResult<CommonResult<TransactionSummaryResult_Data>>> GetSummary()
  {
    string paddleNum = _vipSvc.PaddleNum;

    try
    {

      using var conn = await DBHelper.AUCDB.OpenAsync();

      // 查詢所有消費記錄
      string transactionsSql = """
-- Silent Auction 得標記錄
SELECT
    'silentAuction' as type,
    sh.[ItemId] as transactionId,
    sp.[Name] as name,
    sh.[HammerPrice] as amount,
    sh.[PaymentStatus] as status,
    sh.[PaidAmount] as paidAmount,
    FORMAT(sh.[HammerDtm], 'MM-dd HH:mm') as time
FROM [dbo].[SilentHammered] sh (NOLOCK)
INNER JOIN [dbo].[SilentPrize] sp (NOLOCK) ON sh.[ItemId] = sp.[ItemId]
WHERE sh.[WinnerPaddleNum] = @PaddleNum
  AND sh.[AuctionResult] = 'Hammered'

UNION ALL

-- Live Auction 得標記錄
SELECT
    'liveAuction' as type,
    ah.[ItemId] as transactionId,
    ap.[Name] as name,
    ah.[HammerPrice] as amount,
    ah.[PaymentStatus] as status,
    ah.[PaidAmount] as paidAmount,
    FORMAT(ah.[HammerDtm], 'MM-dd HH:mm') as time
FROM [dbo].[AuctionHammered] ah (NOLOCK)
INNER JOIN [dbo].[AuctionPrize] ap (NOLOCK) ON ah.[ItemId] = ap.[ItemId]
WHERE ah.[WinnerPaddleNum] = @PaddleNum
  AND ah.[AuctionResult] = 'Hammered'

UNION ALL

-- Open Ask 捐款記錄
SELECT
    'openAsk' as type,
    CAST(oar.[Round] as varchar) + '-' + oar.[PaddleNum] as transactionId,
    N'愛心募款 Round ' + CAST(oar.[Round] as varchar) as name,
    oar.[Amount] as amount,
    'unpaid' as status,
    0 as paidAmount,
    FORMAT(oar.[Timestamp], 'MM-dd HH:mm') as time
FROM [dbo].[OpenAskRecord] oar (NOLOCK)
WHERE oar.[PaddleNum] = @PaddleNum

UNION ALL

-- Donation 捐款記錄
SELECT
    'donation' as type,
    CAST(dr.[Ssn] as varchar) as transactionId,
    N'愛心捐款' as name,
    dr.[Amount] as amount,
    'unpaid' as status,
    0 as paidAmount,
    FORMAT(dr.[Timestamp], 'MM-dd HH:mm') as time
FROM [dbo].[DonationRecord] dr (NOLOCK)
WHERE dr.[PaddleNum] = @PaddleNum

ORDER BY time DESC;
""";

      var transactions = await conn.QueryAsync<TransactionItem>(transactionsSql, new { PaddleNum = paddleNum });

      // 查詢中獎票券 - Raffle Ticket
      string raffleSql = """
SELECT
    rt.[RaffleTicketNo] as ticketNumber,
    rp.[Name] as prize,
    rp.[Value] as value
FROM [dbo].[RaffleTicket] rt (NOLOCK)
INNER JOIN [dbo].[RaffleWinner] rw (NOLOCK) ON rt.[RaffleTicketNo] = rw.[RaffleTickerNo]
INNER JOIN [dbo].[RafflePrize] rp (NOLOCK) ON rw.[PrizeId] = rp.[PrizeId]
WHERE rt.[PaddleNum] = @PaddleNum
ORDER BY rw.[PrizeId] DESC;
""";

      var raffleWinnings = await conn.QueryAsync<RaffleWinningTicket>(raffleSql, new { PaddleNum = paddleNum });

      // 查詢中獎福袋 - Give to Win
      string giftSql = """
SELECT
    gt.[GiveTicketNo] as ticketNumber,
    gp.[GiftId] as type,
    gp.[Name] as content,
    gp.[Value] as value
FROM [dbo].[GiveTicket] gt (NOLOCK)
INNER JOIN [dbo].[GiveWinner] gw (NOLOCK) ON gt.[GiveTicketNo] = gw.[GiveTicketNo]
INNER JOIN [dbo].[GivePrize] gp (NOLOCK) ON gt.GiftId = gp.GiftId
WHERE gt.[PaddleNum] = @PaddleNum
ORDER BY gt.GiftId  DESC;
""";

      var giftWinnings = await conn.QueryAsync<GiftWinningTicket>(giftSql, new { PaddleNum = paddleNum });

      // 查詢收據資訊
      string receiptSql = """
SELECT
    CASE
        WHEN [IsEnterprise] = 'Y' THEN 'company'
        WHEN [IsEnterprise] = 'N' AND LEN(ISNULL([ReceiptHeader], '')) > 0 THEN 'individual'
        ELSE 'none'
    END as receiptType,
    ISNULL([ReceiptHeader], '') as receiptTitle,
    ISNULL([TaxNum], '') as receiptTaxId,
    ISNULL([VipEmail], '') as receiptEmail
FROM [dbo].[Vip] (NOLOCK)
WHERE [PaddleNum] = @PaddleNum;
""";

      var receiptInfo = await conn.QueryFirstOrDefaultAsync<ReceiptInfo>(receiptSql, new { PaddleNum = paddleNum });

      // 計算總金額
      var transactionList = transactions.ToList();
      decimal totalAmount = transactionList.Sum(t => t.Amount);
      decimal paidAmount = transactionList.Sum(t => t.PaidAmount ?? 0);
      decimal unpaidAmount = totalAmount - paidAmount;

      var summary = new TransactionSummary(totalAmount, paidAmount, unpaidAmount);

      var winningTickets = new TransactionWinningTickets(
        raffleWinnings.ToList(),
        giftWinnings.ToList()
      );

      var data = new TransactionSummaryResult_Data(
        winningTickets,
        summary,
        transactionList,
        receiptInfo ?? new ReceiptInfo("none", "", "", "")
      );

      return Ok(new CommonResult<TransactionSummaryResult_Data>(true, data, null));
    }
    catch (Exception ex)
    {
      string errMsg = string.Format("Exception！{0}", ex.Message);
      _logger.LogError(ex, errMsg);
      return Ok(new CommonResult<TransactionSummaryResult_Data>(false, null, errMsg));
    }
  }

  /// <summary>
  /// 11.2 更新收據資訊
  /// POST api/transactions/receipt
  /// </summary>
  [Authorize(AuthenticationSchemes = "Bearer")]
  [HttpPost("receipt")]
  public async Task<ActionResult<CommonResult<UpdateReceiptResult_Data>>> UpdateReceipt([FromBody] UpdateReceiptArgs args)
  {
    string paddleNum = _vipSvc.PaddleNum;

    try
    {
      // 驗證參數
      if (args.ReceiptType != "none" && args.ReceiptType != "individual" && args.ReceiptType != "company")
        return Ok(new CommonResult<UpdateReceiptResult_Data>(false, null, "Invalid receipt type"));

      if (args.ReceiptType != "none" && string.IsNullOrWhiteSpace(args.ReceiptTitle))
        return Ok(new CommonResult<UpdateReceiptResult_Data>(false, null, "Receipt title is required"));

      if (args.ReceiptType == "company" && string.IsNullOrWhiteSpace(args.ReceiptTaxId))
        return Ok(new CommonResult<UpdateReceiptResult_Data>(false, null, "Tax ID is required for company receipt"));

      using var conn = await DBHelper.AUCDB.OpenAsync();

      // 更新 Vip 表的收據資訊
      string updateSql = """
UPDATE [dbo].[Vip]
SET
    [IsEnterprise] = @IsEnterprise,
    [ReceiptHeader] = @ReceiptHeader,
    [TaxNum] = @TaxNum
WHERE [PaddleNum] = @PaddleNum;
""";

      await conn.ExecuteAsync(updateSql, new
      {
        PaddleNum = paddleNum,
        IsEnterprise = args.ReceiptType == "company" ? "Y" : "N",
        ReceiptHeader = args.ReceiptTitle ?? "",
        TaxNum = args.ReceiptTaxId ?? ""
      });

 
      string message =  "✅ 收據資訊已更新成功。";

      var data = new UpdateReceiptResult_Data(message);

      return Ok(new CommonResult<UpdateReceiptResult_Data>(true, data, null));
    }
    catch (Exception ex)
    {
      string errMsg = string.Format("Exception！{0}", ex.Message);
      _logger.LogError(ex, errMsg);
      return Ok(new CommonResult<UpdateReceiptResult_Data>(false, null, errMsg));
    }
  }
}
