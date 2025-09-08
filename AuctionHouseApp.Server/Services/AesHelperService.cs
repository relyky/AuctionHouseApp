using System.Security.Cryptography;
using System.Text;
using System;
using System.Configuration;
using System.IO;

namespace AuctionHouseApp.Server.Services;

public class AesHelperService(IConfiguration _config)
{
  private static byte[] HexStringToByteArray(string hex)
  {
    int numberChars = hex.Length;
    byte[] bytes = new byte[numberChars / 2];
    for (int i = 0; i < numberChars; i += 2)
      bytes[i / 2] = Convert.ToByte(hex.Substring(i, 2), 16);
    return bytes;
  }

  private static string ByteArrayToHexString(byte[] ba)
  {
    StringBuilder hex = new StringBuilder(ba.Length * 2);
    foreach (byte b in ba)
      hex.AppendFormat("{0:x2}", b);
    return hex.ToString();
  }

  private static string GenerateRandom32String()
  {
    byte[] byteArray = new byte[24];
    RandomNumberGenerator.Fill(byteArray);
    var randomWords = Convert.ToBase64String(byteArray);
    return randomWords;
  }

  private static byte[] GenerateRandomKey(int length)
  {
    byte[] keyBlob = new byte[length];
    RandomNumberGenerator.Fill(keyBlob);
    return keyBlob;
  }

  internal string Encrypt2(string plaintext, string? seed = null)
  {
    byte[] saltBlob = HexStringToByteArray("dc8383f5cd494aa9aee4288ae3128aeb");
    byte[] seedBlob = HexStringToByteArray(seed ?? _config.GetValue<string>("AES1_SEED") ?? throw new ApplicationException("未設定AES1_SEED"));
    byte[] ivBytes = GenerateRandomKey(16);
    string ivStr = ByteArrayToHexString(ivBytes);
    byte[] plainBlob = Encoding.UTF8.GetBytes(plaintext);

    using (var pbkdf2 = new Rfc2898DeriveBytes(seedBlob, saltBlob, 9972, HashAlgorithmName.SHA256))
    {
      var keyBytes = pbkdf2.GetBytes(32);

      using (Aes aes = Aes.Create())
      {
        aes.Mode = CipherMode.CBC;
        aes.Padding = PaddingMode.PKCS7;
        aes.Key = keyBytes;
        aes.IV = ivBytes;

        using (ICryptoTransform encryptor = aes.CreateEncryptor(aes.Key, aes.IV))
        using (MemoryStream ms = new MemoryStream())
        using (CryptoStream cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write))
        {
          cs.Write(plainBlob, 0, plainBlob.Length);
          cs.FlushFinalBlock();
          var ciphertext = Convert.ToBase64String(ms.ToArray());

          // 加密封包
          //const cipherPackage = ivStr + '.' + ciphertext
          var cipherPackage = ivStr + ciphertext;
          return cipherPackage;
        }
      }
    }
  }

  internal string Decrypt2(string cipherPackage, string? seed = null)
  {
    byte[] saltBlob = HexStringToByteArray("dc8383f5cd494aa9aee4288ae3128aeb");
    byte[] seedBlob = HexStringToByteArray(seed ?? _config.GetValue<string>("AES1_SEED") ?? throw new ApplicationException("未設定AES1_SEED"));
    string ivStr = cipherPackage.Substring(0, 32);
    string ciphertext = cipherPackage.Substring(32);

    using (var pbkdf2 = new Rfc2898DeriveBytes(seedBlob, saltBlob, 9972, HashAlgorithmName.SHA256))
    {
      var keyBytes = pbkdf2.GetBytes(32);
      byte[] ivBytes = HexStringToByteArray(ivStr);

      using (Aes aes = Aes.Create())
      {
        aes.Mode = CipherMode.CBC;
        aes.Padding = PaddingMode.PKCS7;
        aes.Key = keyBytes;
        aes.IV = ivBytes;

        byte[] cipherBytes = Convert.FromBase64String(ciphertext);
        using (ICryptoTransform decryptor = aes.CreateDecryptor(aes.Key, aes.IV))
        using (MemoryStream ms = new MemoryStream(cipherBytes))
        using (CryptoStream cs = new CryptoStream(ms, decryptor, CryptoStreamMode.Read))
        using (StreamReader reader = new StreamReader(cs, Encoding.UTF8))
        {
          var decryptedText = reader.ReadToEnd();
          return decryptedText;
        }
      }
    }
  }
}
