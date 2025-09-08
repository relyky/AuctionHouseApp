import { useCallback } from 'react';
import { encrypt2, decrypt2, encrypt3, decrypt3 } from '../tools/aesHelper';

/**
 * 加密
 */
export function useEncrypt() {
  //const { aesKey, aesIv } = useAtomValue(appEnvAtom)

  const encryptHook = useCallback((plaintext: string) => {
    return encrypt2(plaintext, process.env.AES1_SEED)
  }, [])

  return encryptHook;
}

/**
 * 解密
 */
export function useDecrypt() {
  //const { aesKey, aesIv } = useAtomValue(appEnvAtom)

  const decryptHook = useCallback((ciphertext: string) => {
    return decrypt2(ciphertext, process.env.AES1_SEED)
  }, [])

  return decryptHook;
}

/**
 * 前端頁面交換資訊。存入資訊。
 * @param storage sessionStorage | localStorage
 */
export function pushExchangeInfo(key: string, info: object, storage: Storage = sessionStorage) {
  // 存入交換區
  storage.setItem(key, encrypt3(info));

  // 5秒後自動移除
  setTimeout(() => {
    storage.removeItem(key);
  }, Number(process.env.INFO_EXCHANGE_DURATION))
}

/**
 * 前端頁面交換資訊。拿回資訊。
 * @param storage sessionStorage | localStorage
 */
export function takeExchangeInfo(key: string, storage: Storage = sessionStorage): object | null {
  try {
    const pkg = storage.getItem(key)
    if (pkg) {
      // 拿走就移除
      if (process.env.NODE_ENV === 'development') {
        console.debug('takeExchangeInfo.development')
        setTimeout(() => storage.removeItem(key), 1000)
      } else {
        storage.removeItem(key);
      }

      // 解析
      return decrypt3(pkg);
    }

    return null;
  }
  catch (err) {
    console.error('takeExchangeInfo FAIL', err)
    return null;
  }
}
