//import CryptoJS from 'crypto-js'
import { PBKDF2, AES, enc, mode, pad, algo } from 'crypto-js'
import { random } from 'crypto-js/lib-typedarrays'

/**
 * AES 256 CBC 加密器
 * @param plaintext 明文
 * @param key 金鑰，需 64 個 HEX 數字
 * @param iv 初始向量，需 32 個 HEX 數字 
 * @returns
 */
function encrypt(plaintext: string, key: string, iv: string) {
  const keyBytes = enc.Hex.parse(key)
  const ivBytes = enc.Hex.parse(iv)

  const encodeAdv = generateRandom32String() + plaintext;
  const plainBlob = enc.Utf8.parse(encodeAdv)
  const cipherBlob = AES.encrypt(plainBlob, keyBytes, { mode: mode.CBC, padding: pad.Pkcs7, iv: ivBytes })
  const ciphertext = cipherBlob.toString()
  return ciphertext
}

/**
 * AES 256 CBC 解密器
 * @param ciphertext 密文
 * @param key 金鑰，需 64 個 HEX 數字
 * @param iv 初始向量，需 32 個 HEX 數字 
 * @returns
 */
function decrypt(ciphertext: string, key: string, iv: string) {
  const keyBytes = enc.Hex.parse(key)
  const ivBytes = enc.Hex.parse(iv)

  const decryptedBlob = AES.decrypt(ciphertext, keyBytes, { mode: mode.CBC, padding: pad.Pkcs7, iv: ivBytes })
  const decryptedText = enc.Utf8.stringify(decryptedBlob)
  const decodeAdv = decryptedText.slice(32)
  return decodeAdv
}

/**
 * 生成一個 32 字元長度的隨機字串
 * @returns
 */
function generateRandom32String() {
  const randomWords = random(24);
  return randomWords.toString(enc.Base64);
}

//-----------------------------------------------------------------------------
/**
 * AES 256 CBC 加密器 + PBKDF2
 */
export function encrypt2(plaintext: string, keySeed: string): string {
  const iterations = 9972
  const salt = enc.Hex.parse('dc8383f5cd494aa9aee4288ae3128aeb')
  const seed = enc.Hex.parse(keySeed)
  const iv = random(128 / 8);
  const ivStr = iv.toString(enc.Hex)

  // 加密
  const key = PBKDF2(seed, salt, { keySize: 256 / 32, iterations, hasher: algo.SHA256 })
  const ciphertext = AES.encrypt(plaintext, key, {
    mode: mode.CBC,
    padding: pad.Pkcs7,
    iv: iv,
  })

  // 加密封包
  //const cipherPackage = ivStr + '.' + ciphertext
  const cipherPackage = ivStr + ciphertext
  return cipherPackage;
}

/**
 * AES 256 CBC 解密器 + PBKDF2
 */
export function decrypt2(cipherPackage: string, keySeed: string): string {
  const iterations = 9972
  const salt = enc.Hex.parse('dc8383f5cd494aa9aee4288ae3128aeb')
  const seed = enc.Hex.parse(keySeed) 
  //const [ivStr, ciphertext] = cipherPackage.split('.')
  const ivStr = cipherPackage.slice(0,32)
  const ciphertext = cipherPackage.slice(32)
  const iv = enc.Hex.parse(ivStr)

  // 解密
  const key = PBKDF2(seed, salt, { keySize: 256 / 32, iterations, hasher: algo.SHA256 })
  const decryptedBlob = AES.decrypt(ciphertext, key, {
    mode: mode.CBC,
    padding: pad.Pkcs7,
    iv: iv
  })

  const decryptedText = enc.Utf8.stringify(decryptedBlob)
  return decryptedText
}

//-----------------------------------------------------------------------------
/**
 * AES 256 CBC 加密器 + PBKDF2
 * 用於本地自身加解密。
 */
export function encrypt3(plaintext: object): string {
  const iterations = 9983
  const salt = enc.Hex.parse('dc8383f5cd494ea9aee4288ae3128aeb')
  const seed = enc.Hex.parse(process.env.AES2_SEED)
  const iv = random(128 / 8);
  const ivStr = iv.toString(enc.Hex)

  // 計算金鑰
  const key = PBKDF2(seed, salt, { keySize: 256 / 32, iterations, hasher: algo.SHA256 })  
  // 加密
  const ciphertext = AES.encrypt(enc.Utf8.parse(JSON.stringify(plaintext)), key, {
    mode: mode.CBC,
    padding: pad.Pkcs7,
    iv: iv,
  })

  // 加密封包
  return ivStr + ciphertext
}

/**
 * AES 256 CBC 解密器 + PBKDF2
 * 用於本地自身加解密。
 */
export function decrypt3(cipherPackage: string): object {
  const iterations = 9983 
  const salt = enc.Hex.parse('dc8383f5cd494ea9aee4288ae3128aeb')
  const seed = enc.Hex.parse(process.env.AES2_SEED)
  //const [ivStr, ciphertext] = cipherPackage.split('.')
  const ivStr = cipherPackage.slice(0, 32)
  const ciphertext = cipherPackage.slice(32)
  const iv = enc.Hex.parse(ivStr)

  // 計算金鑰
  const key = PBKDF2(seed, salt, { keySize: 256 / 32, iterations, hasher: algo.SHA256 })  

  // 解密
  return JSON.parse(enc.Utf8.stringify(AES.decrypt(ciphertext, key, {
    mode: mode.CBC,
    padding: pad.Pkcs7,
    iv: iv
  })))
}
