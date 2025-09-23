namespace Vista.DB.Schema
{
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

/// <summary>
/// 賓客聯絡資訊
/// </summary>
[Table("Vip")]
public class Vip 
{
  /// <summary>
  /// 拍牌編號
  /// </summary>
  [Display(Name = "拍牌編號")]
  [Key]
  public string PaddleNum { get; set; } = default!;
  /// <summary>
  /// 賓客全名
  /// </summary>
  [Display(Name = "賓客全名")]
  public string VipName { get; set; } = default!;
  /// <summary>
  /// 賓客電郵地址
  /// </summary>
  [Display(Name = "賓客電郵地址")]
  public string VipEmail { get; set; } = default!;
  /// <summary>
  /// 賓客聯絡電話
  /// </summary>
  [Display(Name = "賓客聯絡電話")]
  public string VipPhone { get; set; } = default!;
  /// <summary>
  /// 桌號
  /// </summary>
  [Display(Name = "桌號")]
  public string TableNumber { get; set; } = default!;

  public void Copy(Vip src)
  {
    this.PaddleNum = src.PaddleNum;
    this.VipName = src.VipName;
    this.VipEmail = src.VipEmail;
    this.VipPhone = src.VipPhone;
    this.TableNumber = src.TableNumber;
  }

  public Vip Clone()
  {
    return new Vip {
      PaddleNum = this.PaddleNum,
      VipName = this.VipName,
      VipEmail = this.VipEmail,
      VipPhone = this.VipPhone,
      TableNumber = this.TableNumber,
    };
  }
}
}

