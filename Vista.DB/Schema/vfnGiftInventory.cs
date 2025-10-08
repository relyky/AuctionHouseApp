namespace Vista.DB.Schema
{
using System;
using System.Collections.Generic;
using Dapper;
using Microsoft.Data.SqlClient;

public class vfnGiftInventoryResult 
{
  public string PrizeId { get; set; } = default!;
  public string PrizeName { get; set; } = default!;
  public string WinnerId { get; set; } = default!;
  public string WinnerName { get; set; } = default!;
  public string TicketNo { get; set; } = default!;
  public string PaymentStatus { get; set; } = default!;
  public DateTime? PaymentDtm { get; set; }
  public string PrizeGroup { get; set; } = default!;
  public Decimal? PrizeValue { get; set; }
}

public class vfnGiftInventoryArgs 
{
  public string? PaddleNum { get; set; } = default!;
}

static partial class DBHelperClassExtensions
{
public static List<vfnGiftInventoryResult> CallvfnGiftInventory(this SqlConnection conn, vfnGiftInventoryArgs args, SqlTransaction? txn = null)
{
  var sql = @"SELECT * FROM [dbo].[vfnGiftInventory](@PaddleNum); "; 
  var dataList = conn.Query<vfnGiftInventoryResult>(sql, args, txn).AsList();
  return dataList;
}

public static List<vfnGiftInventoryResult> CallvfnGiftInventory(this SqlConnection conn, string PaddleNum, SqlTransaction? txn = null)
{
  var args = new {
    PaddleNum,
  };

  var sql = @"SELECT * FROM [dbo].[vfnGiftInventory](@PaddleNum); "; 
  var dataList = conn.Query<vfnGiftInventoryResult>(sql, args, txn).AsList();
  return dataList;
}
}
}

