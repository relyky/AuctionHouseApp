import { useCallback } from 'react';
import { encrypt2, decrypt2, encrypt3, decrypt3 } from '../tools/aesHelper';

/**
 * �[�K
 */
export function useEncrypt() {
  //const { aesKey, aesIv } = useAtomValue(appEnvAtom)

  const encryptHook = useCallback((plaintext: string) => {
    return encrypt2(plaintext, process.env.AES1_SEED)
  }, [])

  return encryptHook;
}

/**
 * �ѱK
 */
export function useDecrypt() {
  //const { aesKey, aesIv } = useAtomValue(appEnvAtom)

  const decryptHook = useCallback((ciphertext: string) => {
    return decrypt2(ciphertext, process.env.AES1_SEED)
  }, [])

  return decryptHook;
}

/**
 * �e�ݭ����洫��T�C�s�J��T�C
 * @param storage sessionStorage | localStorage
 */
export function pushExchangeInfo(key: string, info: object, storage: Storage = sessionStorage) {
  // �s�J�洫��
  storage.setItem(key, encrypt3(info));

  // 5���۰ʲ���
  setTimeout(() => {
    storage.removeItem(key);
  }, Number(process.env.INFO_EXCHANGE_DURATION))
}

/**
 * �e�ݭ����洫��T�C���^��T�C
 * @param storage sessionStorage | localStorage
 */
export function takeExchangeInfo(key: string, storage: Storage = sessionStorage): object | null {
  try {
    const pkg = storage.getItem(key)
    if (pkg) {
      // �����N����
      if (process.env.NODE_ENV === 'development') {
        console.debug('takeExchangeInfo.development')
        setTimeout(() => storage.removeItem(key), 1000)
      } else {
        storage.removeItem(key);
      }

      // �ѪR
      return decrypt3(pkg);
    }

    return null;
  }
  catch (err) {
    console.error('takeExchangeInfo FAIL', err)
    return null;
  }
}
