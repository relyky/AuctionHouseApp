using AuctionHouseApp.Server.Services;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
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
    [HttpGet("summaryByVip")]
    public async Task<ActionResult<CommonResult<TransactionSummaryResult_Data>>> GetSummary()
    {
        return await GetSummaryInternal(_vipSvc.PaddleNum);
    }

    /// <summary>
    /// 11.1 取得消費明細
    /// GET api/transactions/summary?paddleNum=xxx
    /// </summary>
    [Authorize]
    [HttpGet("summary")]
    public async Task<ActionResult<CommonResult<TransactionSummaryResult_Data>>> GetSummary([FromQuery] string paddleNum)
    {
        return await GetSummaryInternal(paddleNum);
    }

    private async Task<ActionResult<CommonResult<TransactionSummaryResult_Data>>> GetSummaryInternal(string paddleNum)
    {
        try
        {

            using var conn = await DBHelper.AUCDB.OpenAsync();

            // 查詢所有消費記錄
            string transactionsSql = """
SELECT Activity AS Type
,ChargingItemId as TransactionId
,Name
,Amount
,HasPaid AS Status
,PaidAmount
,Time
FROM [dbo].[vfnBillDetail] ( @PaddleNum) 
""";

            var transactions = await conn.QueryAsync<TransactionItem>(transactionsSql, new { PaddleNum = paddleNum });

            // 查詢中獎票券 - Raffle Ticket
            string raffleSql = """
SELECT ticketNo AS TicketNumber
,PrizeName AS Prize
,PrizeValue AS Value
FROM [dbo].vfnGiftInventory (@PaddleNum)
where PrizeGroup='Raffle'
""";

            var raffleWinnings = await conn.QueryAsync<RaffleWinningTicket>(raffleSql, new { PaddleNum = paddleNum });

            // 查詢中獎福袋 - Give to Win
            string giftSql = """
SELECT ticketNo AS TicketNumber
,PrizeId AS Type
,PrizeName AS Content
,PrizeValue AS Value
FROM [dbo].vfnGiftInventory (@PaddleNum)
where PrizeGroup='GiveToWin'
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


            string message = "✅ 收據資訊已更新成功。";

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

    /// <summary>
    /// 11.3 批次更新付款狀態
    /// POST api/transactions/batchUpdatePayment
    /// </summary>
    [Authorize]
    [HttpPost("batchUpdatePayment")]
    public async Task<ActionResult<CommonResult<BatchUpdatePaymentResult_Data>>> BatchUpdatePayment([FromBody] BatchUpdatePaymentArgs args)
    {
        string paddleNum = args.PaddleNum;

        try
        {
            ClaimsIdentity userIdentity = (ClaimsIdentity)HttpContext.User.Identity!;
            var staffId = userIdentity.FindFirst(ClaimTypes.Name)?.Value;

            using var conn = await DBHelper.AUCDB.OpenAsync();
            using var transaction = conn.BeginTransaction();

            int totalUpdated = 0;

            if (args.PaymentStatus.ToUpper() != "PAID" && args.PaymentStatus.ToUpper() != "UNPAID")
            {
                throw new ArgumentException("Invalid payment status");
            }

            string PaymentStatus = args.PaymentStatus.ToUpper() == "PAID" ? "Paid" : "Unpaid";

            try
            {
                foreach (var item in args.Transactions)
                {

                    string updateSql = "";
                    object parameters = null;

                    switch (item.Type.ToLower())
                    {
                        case "liveauction":
                            updateSql = """
UPDATE [dbo].[AuctionHammered]
SET
    [PaymentStatus] = @PaymentStatus,
    [PaidAmount] = [HammerPrice],
    [PaymentDtm] = GETDATE(),
    [PaymentStaff] = @PaymentStaff,
    [PaymentNotes] = @PaymentNotes
WHERE [ItemId] = @TransactionId
  AND [WinnerPaddleNum] = @PaddleNum;
""";
                            parameters = new
                            {
                                TransactionId = item.TransactionId,
                                PaddleNum = paddleNum,
                                PaymentStatus = PaymentStatus,
                                PaymentStaff = staffId ?? "",
                                PaymentNotes = args.PaymentNotes ?? ""
                            };
                            break;

                        case "silentauction":
                            updateSql = """
UPDATE [dbo].[SilentHammered]
SET
    [PaymentStatus] = @PaymentStatus,
    [PaidAmount] = [HammerPrice],
    [PaymentDtm] = GETDATE(),
    [PaymentStaff] = @PaymentStaff,
    [PaymentNotes] = @PaymentNotes
WHERE [ItemId] = @TransactionId
  AND [WinnerPaddleNum] = @PaddleNum;
""";
                            parameters = new
                            {
                                TransactionId = item.TransactionId,
                                PaddleNum = paddleNum,
                                PaymentStatus = PaymentStatus,
                                PaymentStaff = staffId ?? "",
                                PaymentNotes = args.PaymentNotes ?? ""
                            };
                            break;

                        case "openask":
                            var parts = item.TransactionId.Split('-');
                            if (parts.Length == 2)
                            {
                                updateSql = """
UPDATE [dbo].[OpenAskRecord]
SET
    [HasPaid] = @HasPaid,
    [PaidDtm] = GETDATE(),
    [PaidStaff] = @PaidStaff
WHERE [Round] = @Round
  AND [PaddleNum] = @PaddleNum
  AND [Status] = 'Confirmed';
""";
                                parameters = new
                                {
                                    Round = int.Parse(parts[0]),
                                    PaddleNum = paddleNum,
                                    HasPaid = PaymentStatus == "Paid" ? "Y" : "N",
                                    PaidStaff = staffId ?? ""
                                };
                            }
                            break;

                        case "donation":
                            updateSql = """
UPDATE [dbo].[DonationRecord]
SET
    [HasPaid] = @HasPaid,
    [PaidDtm] = GETDATE(),
    [PaidStaff] = @PaidStaff
WHERE [Ssn] = @Ssn
  AND [PaddleNum] = @PaddleNum;
""";
                            parameters = new
                            {
                                Ssn = int.Parse(item.TransactionId),
                                PaddleNum = paddleNum,
                                HasPaid = PaymentStatus == "Paid" ? "Y" : "N",
                                PaidStaff = staffId ?? ""
                            };
                            break;
                    }

                    if (!string.IsNullOrEmpty(updateSql) && parameters != null)
                    {
                        int affected = await conn.ExecuteAsync(updateSql, parameters, transaction);
                        totalUpdated += affected;
                    }
                }

                transaction.Commit();

                string message = $"✅ 已成功更新 {totalUpdated} 筆付款記錄。";
                var data = new BatchUpdatePaymentResult_Data(totalUpdated, message);
                return Ok(new CommonResult<BatchUpdatePaymentResult_Data>(true, data, null));
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
        catch (Exception ex)
        {
            string errMsg = string.Format("Exception！{0}", ex.Message);
            _logger.LogError(ex, errMsg);
            return Ok(new CommonResult<BatchUpdatePaymentResult_Data>(false, null, errMsg));
        }
    }
}
