using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.JSInterop.Infrastructure;
using Vista.DB;
using Vista.DB.Schema;
using Vista.DbPanda;

namespace AuctionHouseApp.Server.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class RaffleSellController : ControllerBase
{
  [HttpPost("[action]")]
  public ActionResult<RaffleOrderCreateDto> Create([FromForm] RaffleOrderCreateDto dto)
  {
    //# 基本檢查…趕進度先跳過
    //return BadRequest("這是測試用錯誤訊息");

    //# Access DB
    string sql = """
INSERT INTO [dbo].[RaffleOrder]
([RaffleOrderNo],
 [BuyerName],[BuyerEmail],[BuyerPhone],[PurchaseCount],[PurchaseAmount],[HasPaid],[SalesId],[SoldDtm],[Status],[Remark])
 OUTPUT inserted.*
VALUES
(FORMAT(NEXT VALUE FOR RaffleSaleSeq,'RS00000'), 
 @BuyerName, @BuyerEmail, @BuyerPhone, @PurchaseCount, @PurchaseAmount, @HasPaid, @SalesId, GETDATE(), @Status, @Remark)
""";

    var parameters = new
    {
      dto.BuyerName,
      dto.BuyerEmail,
      dto.BuyerPhone,
      dto.PurchaseCount,
      dto.PurchaseAmount,
      dto.Remark,
      HasPaid = "N",
      SalesId = HttpContext.User.Identity?.Name,
      Status = "ForSale",
    };

    using var conn = DBHelper.AUCDB.Open();
    using var txn = conn.BeginTransaction();
    var newOrder = conn.QueryFirst<RaffleOrder>(sql, parameters, txn);
    txn.Commit();

    return Ok(new { message = "SUCCESS", formNo = newOrder.RaffleOrderNo, nextStep = "Step2" });
  }
}
