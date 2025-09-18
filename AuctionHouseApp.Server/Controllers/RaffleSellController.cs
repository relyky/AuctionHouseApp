using AuctionHouseApp.Server.Models;
using AuctionHouseApp.Server.Services;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Net.Mail;
using System.Text;
using Vista.DB;
using Vista.DB.Schema;
using Vista.DbPanda;

namespace AuctionHouseApp.Server.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class RaffleSellController(
  SysParamsService _prmSvc,
  EmailProxyService _emlSvc
  ) : ControllerBase
{
  [HttpPost("[action]")]
  public ActionResult<RaffleOrder> Create([FromForm] RaffleOrderCreateDto dto)
  {
    try
    {
      //# 基本檢查…趕進度先跳過
      //return BadRequest("這是測試用錯誤訊息");

      if (dto.RaffleOrderNo == "NEW")
      {
        // 新增訂單
        //# Access DB
        string sql = """
INSERT INTO [dbo].[RaffleOrder]
([RaffleOrderNo],
 [BuyerName],[BuyerEmail],[BuyerPhone],[PurchaseCount],[PurchaseAmount],[HasPaid],[SalesId],[Status])
 OUTPUT inserted.*
VALUES
(FORMAT(NEXT VALUE FOR RaffleSaleSeq,'RS00000'), 
 @BuyerName, @BuyerEmail, @BuyerPhone, @PurchaseCount, @PurchaseAmount, @HasPaid, @SalesId, @Status)
""";

        var parameters = new
        {
          dto.BuyerName,
          dto.BuyerEmail,
          dto.BuyerPhone,
          dto.PurchaseCount,
          dto.PurchaseAmount,
          HasPaid = "N",
          SalesId = HttpContext.User.Identity?.Name,
          Status = "ForSale",
        };

        using var conn = DBHelper.AUCDB.Open();
        using var txn = conn.BeginTransaction();
        var newOrder = conn.QueryFirst<RaffleOrder>(sql, parameters, txn);
        txn.Commit();

        return Ok(newOrder);
      }
      else
      {
        // 更新訂單

        //# Access DB
        string sql = """
UPDATE [dbo].[RaffleOrder]
  SET [BuyerName] = @BuyerName
     ,[BuyerEmail] = @BuyerEmail
     ,[BuyerPhone] = @BuyerPhone
     ,[PurchaseCount] = @PurchaseCount
     ,[PurchaseAmount] = @PurchaseAmount
     ,[HasPaid] = @HasPaid
     ,[SalesId] = @SalesId
     ,[Status] = @SalesId
OUTPUT inserted.*
WHERE [RaffleOrderNo] = @RaffleOrderNo
""";

        var parameters = new
        {
          dto.RaffleOrderNo,
          dto.BuyerName,
          dto.BuyerEmail,
          dto.BuyerPhone,
          dto.PurchaseCount,
          dto.PurchaseAmount,
          HasPaid = "N",
          SalesId = HttpContext.User.Identity?.Name,
          Status = "ForSale",
        };

        using var conn = DBHelper.AUCDB.Open();
        using var txn = conn.BeginTransaction();
        var newOrder = conn.QueryFirst<RaffleOrder>(sql, parameters, txn);
        txn.Commit();

        return Ok(newOrder);
      }
    }
    catch (Exception ex)
    {
      return BadRequest("執行失敗！" + ex.Message);
    }
  }

  /// <summary>
  /// 系統參數：抽獎券單價
  /// </summary>
  [HttpPost("[action]")]
  public ActionResult GetRaffleUnitPrice()
  {
    return Ok(new
    {
      RaffleUnitPrice = _prmSvc.GetRaffleUnitPrice()
    });
  }

  /// <summary>
  /// 同意下單或放棄訂單
  /// </summary>
  [HttpPost("[action]/{id}/{hasPaid}")]
  public ActionResult<RaffleOrder> CommitRaffleOrder(string id, string hasPaid)
  {
    //# Access DB
    if (hasPaid == "Y")
    {
      string updateHasSold = """
UPDATE [dbo].[RaffleOrder]
SET [HasPaid] = 'Y', [Status] = 'HasSold', [SoldDtm] = GETDATE()
WHERE RaffleOrderNo = @RaffleOrderNo
""";
      using var conn = DBHelper.AUCDB.Open();
      using var txn = conn.BeginTransaction();

      int affected = conn.Execute(updateHasSold, new { RaffleOrderNo = id }, txn);
      if (affected != 1)
      {
        txn.Rollback();
        return BadRequest(new MsgObj("更新訂單執行失敗！", id));
      }

      // 取回訂單
      var updated = conn.GetEx<RaffleOrder>(new { RaffleOrderNo = id }, txn);

      // 產生抽獎券子程序
      DoGenRaffleTickets(updated, conn, txn);

      txn.Commit();
      return Ok(updated);
    }
    else
    {
      string updateInvalid = """
UPDATE [dbo].[RaffleOrder]
SET [HasPaid] = 'N', [Status] = 'Invalid', [SoldDtm] = NULL
WHERE RaffleOrderNo = @RaffleOrderNo
""";

      using var conn = DBHelper.AUCDB.Open();
      using var txn = conn.BeginTransaction();

      int affected = conn.Execute(updateInvalid, new { RaffleOrderNo = id }, txn);
      if (affected != 1)
      {
        txn.Rollback();
        return BadRequest(new MsgObj("更新訂單執行失敗！", id));
      }

      var updated = conn.GetEx<RaffleOrder>(new { RaffleOrderNo = id }, txn);
      txn.Commit();
      return Ok(updated);
    }
  }

  /// <summary>
  /// 放棄訂單
  /// </summary>
  [HttpPost("[action]/{id}")]
  public ActionResult<RaffleOrder> RevokeRaffleOrder(string id)
  {
    string updateInvalid = """
UPDATE [dbo].[RaffleOrder]
SET [HasPaid] = 'N', [Status] = 'Invalid', [SoldDtm] = NULL
WHERE RaffleOrderNo = @RaffleOrderNo
""";

    using var conn = DBHelper.AUCDB.Open();
    using var txn = conn.BeginTransaction();

    int affected = conn.Execute(updateInvalid, new { RaffleOrderNo = id }, txn);
    if (affected != 1)
    {
      txn.Rollback();
      return BadRequest(new MsgObj("更新訂單執行失敗！", id));
    }

    var updated = conn.GetEx<RaffleOrder>(new { RaffleOrderNo = id }, txn);
    txn.Commit();
    return Ok(updated);
  }

  [NonAction]
  private void DoGenRaffleTickets(RaffleOrder order, SqlConnection conn, SqlTransaction txn)
  {
    //# Access DB
    string sql = """
INSERT INTO [dbo].[RaffleTicket]
([RaffleTicketNo],
 [RaffleSoldNo],[BuyerName],[BuyerEmail],[BuyerPhone],[EmailTimes],[LastEmailDtm])
VALUES
(FORMAT(NEXT VALUE FOR RaffleTicketSeq,'\A000000'), 
 @RaffleSoldNo, @BuyerName, @BuyerEmail, @BuyerPhone, 0, NULL)
""";

    // 產生抽獎券：編號 Annnnnn (含前置字元 A + 6碼序號)
    for (int i = 0; i < order.PurchaseCount; i++)
    {
      conn.Execute(sql, new
      {
        RaffleSoldNo = order.RaffleOrderNo,
        order.BuyerName,
        order.BuyerEmail,
        order.BuyerPhone,
      }, txn);
    }
  }

  /// <summary>
  /// 取得某訂單的抽獎券
  [HttpPost("[action]/{id}")]
  public ActionResult<IEnumerable<RaffleTicket>> LoadRaffleTicket(string id)
  {
    string sql = "SELECT * FROM RaffleTicket WHERE RaffleSoldNo = @RaffleSoldNo ";

    using var conn = DBHelper.AUCDB.Open();
    var tickets = conn.Query<RaffleTicket>(sql, new { RaffleSoldNo = id });
    return Ok(tickets);
  }

  /// <summary>
  /// 寄出購買通知信
  /// </summary>
  [HttpPost("[action]/{id}")]
  public ActionResult<SendNoteEmailResult> SendNoteEmail(string id)
  {
    const string selectOrderSql = """
SELECT TOP 1 *
FROM [dbo].[RaffleOrder] (NOLOCK)
WHERE RaffleOrderNo = @RaffleOrderNo 
 AND HasPaid = 'Y'
 AND Status = 'HasSold'
 ORDER BY RaffleOrderNo ASC
""";

    const string selectTicketSql = """
SELECT *
FROM [dbo].[RaffleTicket] (NOLOCK)
WHERE RaffleSoldNo = @RaffleOrderNo 
 ORDER BY RaffleTicketNo ASC
""";

    // 更新寄出通知信次數，並取回目前寄出次數。
    const string updateEmailTimes = """
UPDATE [dbo].[RaffleTicket]
 SET EmailTimes = EmailTimes + 1,
     LastEmailDtm = GETDATE()
 WHERE [RaffleSoldNo] = @RaffleOrderNo;

SELECT TOP 1 EmailTimes
 FROM [dbo].[RaffleTicket]
 WHERE [RaffleSoldNo] = @RaffleOrderNo;
""";

    const string selectSales = """
SELECT TOP 1 [UserId],[Nickname],[Phone]
FROM [dbo].[Staff] (NOLOCK)
WHERE UserId = @UserId
""";

    try
    {
      if (String.IsNullOrWhiteSpace(id))
        return BadRequest("無查詢參數！");

      //# 先取範本
      StringBuilder htmlTpl = new(DoReadTemplateFile(@"Template/RaffleBuyerNoteEmailTpl.html"));
      string ticketTpl = DoReadTemplateFile(@"Template/RaffleBuyerNoteEmailTpl_TicketBlock.html");

      //# 取得訂單與抽獎券
      using var conn = DBHelper.AUCDB.Open();
      using var txn = conn.BeginTransaction();
      var param = new { RaffleOrderNo = id };
      var order = conn.QueryFirst<RaffleOrder>(selectOrderSql, param, txn);
      var ticketList = conn.Query<RaffleTicket>(selectTicketSql, param, txn).ToArray();
      var sales = conn.QueryFirst<StaffProfile>(selectSales, new { UserId = order.SalesId }, txn);

      // 填入主檔範本
      htmlTpl = DoFillTemplateTpl(htmlTpl, order, sales);
      htmlTpl = htmlTpl.Replace("{{TICKET_LIST_COUNT}}", $"{ticketList.Length}");

      // 填入TICKET BLOCK
      foreach (var ticket in ticketList)
        htmlTpl = DoFillTemplateTicket(htmlTpl, ticket, ticketTpl);

      // 組織 Email 內容
      MailMessage mail = new();
      mail.To.Add(new MailAddress(order.BuyerEmail, order.BuyerName));
      mail.Subject = $"{_emlSvc.EmailProps.SubjectPrefix} 感謝您購買本次抽獎券，您的訂單編號 {order.RaffleOrderNo} 已成立";
      mail.Body = htmlTpl.ToString();
      mail.IsBodyHtml = true;

      // 寄出 Email
      _emlSvc.SendEmail(mail);

      //# 成功更新寄出通知信次數。
      int emailTimes = conn.ExecuteScalar<int>(updateEmailTimes, param, txn);
      txn.Commit();

      return Ok(new SendNoteEmailResult
      {
        RaffleOrderNo = order.RaffleOrderNo,
        EmailTimes = emailTimes
      });
    }
    catch (Exception ex)
    {
      return BadRequest("出現例外！" + ex.Message);
    }
  }

  /// <summary>
  /// helper: 讀取範本檔
  /// </summary>
  [NonAction]
  private string DoReadTemplateFile(string filePath)
  {
    //# 先取範本
    FileInfo fi = new(filePath);
    using var reader = System.IO.File.OpenText(fi.FullName);
    return reader.ReadToEnd();
  }

  /// <summary>
  /// helper: 填入主檔範本
  /// </summary>
  [NonAction]
  private StringBuilder DoFillTemplateTpl(StringBuilder htmlTpl, RaffleOrder order, StaffProfile sales)
  {
    htmlTpl = htmlTpl.Replace("{{BUYER_NAME}}", order.BuyerName);
    htmlTpl = htmlTpl.Replace("{{ORDER_NO}}", order.RaffleOrderNo);
    htmlTpl = htmlTpl.Replace("{{BUYER_PHONE}}", order.BuyerPhone);
    htmlTpl = htmlTpl.Replace("{{BUYER_EMAIL}}", order.BuyerEmail);
    htmlTpl = htmlTpl.Replace("{{PURCHASE_COUNT}}", $"{order.PurchaseCount}");
    htmlTpl = htmlTpl.Replace("{{PURCHASE_AMOUNT}}", $"{order.PurchaseAmount:N0}");
    htmlTpl = htmlTpl.Replace("{{HAS_PAID}}", order.HasPaid == "Y" ? "是" : "否");
    htmlTpl = htmlTpl.Replace("{{ORDER_STATUS}}", order.Status);
    htmlTpl = htmlTpl.Replace("{{SALES_ID}}", sales.Nickname);
    htmlTpl = htmlTpl.Replace("{{SOLD_DTM}}", $"{order.SoldDtm:yyyy-MM-dd HH:mm}");
    return htmlTpl;
  }

  /// <summary>
  /// helper: 填入 TICKET_BLOCK
  /// </summary>
  [NonAction]
  private StringBuilder DoFillTemplateTicket(StringBuilder htmlTpl, RaffleTicket ticket, string ticketTpl)
  {
    StringBuilder htmlTicket = new(ticketTpl);

    // 填入 TICKET 欄位
    htmlTicket = htmlTicket.Replace("{{TICKET_NO}}", ticket.RaffleTicketNo);
    htmlTicket = htmlTicket.Replace("{{TICKET_HOLDER_NAME}}", ticket.BuyerName);
    htmlTicket = htmlTicket.Replace("{{TICKET_HOLDER_EMAIL}}", ticket.BuyerEmail);
    htmlTicket = htmlTicket.Replace("{{TICKET_HOLDER_PHONE}}", ticket.BuyerPhone);
    htmlTicket = htmlTicket.Replace("{{TICKET_IMAGE_URL}}", _prmSvc.GetRaffleTicketImageUrl());

    // 填入 TICKET_BLOCK
    htmlTpl = htmlTpl.Replace("<!-- {{RAFFLE_TICKETS_BLOCK}} -->", htmlTicket.ToString());
    return htmlTpl;
  }

  /// <summary>
  /// 測試寄送 email
  /// </summary>
  [HttpPost("[action]")]
  public ActionResult<MsgObj> TestSendEmail([FromBody] TestSendEmailArgs args)
  {
    string[] toList = new string[] { args.BuyerEmail };

    //if (args.BuyerEmail == "letfail@mail.server")
    //  throw new ApplicationException("測試 TestSendEmail 失敗！");

    // 測試寄出 純文字 信件。
    var now = DateTime.Now;
    string subject = $"測試 Email 通訊是否有效[{now:HHmmss}]";

    StringBuilder mailBody = new();
    mailBody.AppendLine("您好:");
    mailBody.AppendLine("這封信是為了測試 Email 通訊是否正常運作。若您順利收到此信件代表成功。");
    mailBody.AppendLine($"📩 郵件時戳：{now:yyyy-MM-dd HH:mm:ss}");
    mailBody.AppendLine();
    mailBody.AppendLine("這是系統送出信件請勿回覆。");
    mailBody.AppendLine("感謝您的協助。");

    _emlSvc.SendTextEmail(toList, subject, mailBody.ToString());

    return Ok(new MsgObj("SUCCESS"));
  }

  [HttpPost("[action]")]
  public async Task<ActionResult<IEnumerable<BuyerProfile>>> SearchBuyerProfile([FromQuery] string keyword)
  {
    const string sql = """
SELECT DISTINCT BuyerName, BuyerEmail, BuyerPhone
FROM [dbo].[RaffleOrder] O (NOLOCK)
WHERE BuyerName LIKE @Keyword
 OR BuyerEmail LIKE @Keyword
 OR BuyerPhone LIKE @Keyword
""";

    using var conn = await DBHelper.AUCDB.OpenAsync();
    var buyerList = await conn.QueryAsync<BuyerProfile>(sql, new { Keyword = $"%{keyword}%" });
    return Ok(buyerList);
  }

  [HttpPost("[action]/{id}")]
  public async Task<ActionResult<StaffProfile>> GetStaffProfile(string id)
  {
    const string sql = """
SELECT TOP 1 [UserId],[Nickname],[Phone]
FROM [dbo].[Staff] (NOLOCK)
WHERE UserId = @UserId
""";

    using var conn = await DBHelper.AUCDB.OpenAsync();
    var info = await conn.QueryFirstAsync<StaffProfile>(sql, new { UserId = id });
    return Ok(info);
  }

}
