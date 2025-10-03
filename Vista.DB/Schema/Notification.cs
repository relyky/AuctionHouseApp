namespace Vista.DB.Schema
{
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("Notification")]
public class Notification 
{
  [Key]
  [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
  public Int64 NotificationId { get; set; }
  public string PaddleNum { get; set; } = default!;
  public string NotificationType { get; set; } = default!;
  public string Title { get; set; } = default!;
  public string Message { get; set; } = default!;
  public string ActionUrl { get; set; } = default!;
  public string IsRead { get; set; } = default!;
  public DateTime? ReadTime { get; set; }
  public DateTime? CreatedDtm { get; set; }
  public DateTime? ExpiryDtm { get; set; }
  public int? Priority { get; set; }
  public string Metadata { get; set; } = default!;

  public void Copy(Notification src)
  {
    this.NotificationId = src.NotificationId;
    this.PaddleNum = src.PaddleNum;
    this.NotificationType = src.NotificationType;
    this.Title = src.Title;
    this.Message = src.Message;
    this.ActionUrl = src.ActionUrl;
    this.IsRead = src.IsRead;
    this.ReadTime = src.ReadTime;
    this.CreatedDtm = src.CreatedDtm;
    this.ExpiryDtm = src.ExpiryDtm;
    this.Priority = src.Priority;
    this.Metadata = src.Metadata;
  }

  public Notification Clone()
  {
    return new Notification {
      NotificationId = this.NotificationId,
      PaddleNum = this.PaddleNum,
      NotificationType = this.NotificationType,
      Title = this.Title,
      Message = this.Message,
      ActionUrl = this.ActionUrl,
      IsRead = this.IsRead,
      ReadTime = this.ReadTime,
      CreatedDtm = this.CreatedDtm,
      ExpiryDtm = this.ExpiryDtm,
      Priority = this.Priority,
      Metadata = this.Metadata,
    };
  }
}
}

