namespace Vista.DB.Schema
{
using System;
using System.Collections.Generic;
using Dapper;
using Microsoft.Data.SqlClient;


public class NotifySilentAuctionOvertakenArgs 
{
  public string ItemId { get; set; } = default!;
  public Decimal? NewBidAmount { get; set; }
}

static partial class DBHelperClassExtensions
{
public static int CallNotifySilentAuctionOvertaken(this SqlConnection conn, NotifySilentAuctionOvertakenArgs args, SqlTransaction? txn = null)
{
  var param = new DynamicParameters();
  param.Add("@ItemId", args.ItemId); 
  param.Add("@NewBidAmount", args.NewBidAmount); 

  var result = conn.Execute("dbo.NotifySilentAuctionOvertaken", param,
    transaction: txn,
    commandType: System.Data.CommandType.StoredProcedure
    );
  return result;
}

public static int CallNotifySilentAuctionOvertaken(this SqlConnection conn, string ItemId, Decimal? NewBidAmount, SqlTransaction? txn = null)
{
  var args = new NotifySilentAuctionOvertakenArgs {
    ItemId = ItemId,
    NewBidAmount = NewBidAmount,
  };

  var result = conn.CallNotifySilentAuctionOvertaken(args, txn); 
  return result;
}
}
}

