namespace Vista.DB.Schema
{
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

/// <summary>
/// 福袋中獎清冊
/// </summary>
[Table("GiveWinner")]
public class GiveWinner 
{
  [Key]
  public string GiftId { get; set; } = default!;
  public string GiveTicketNo { get; set; } = default!;
  public DateTime? DrawDtm { get; set; }

  public void Copy(GiveWinner src)
  {
    this.GiftId = src.GiftId;
    this.GiveTicketNo = src.GiveTicketNo;
    this.DrawDtm = src.DrawDtm;
  }

  public GiveWinner Clone()
  {
    return new GiveWinner {
      GiftId = this.GiftId,
      GiveTicketNo = this.GiveTicketNo,
      DrawDtm = this.DrawDtm,
    };
  }
}
}

