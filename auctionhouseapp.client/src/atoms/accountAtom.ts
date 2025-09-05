import axios from "axios"
import { useAtomValue } from "jotai"
import { atomWithStorage, createJSONStorage, useAtomCallback } from 'jotai/utils'
import { useCallback } from "react"

//const storage = createJSONStorage(() => sessionStorage)
//const someAtom = atomWithStorage('some-key', someInitialValue, storage)

const ACCOUNT_KEY = 'account'

const initialState: IAccountState = {
  bidderNo: 'B000',
  bidderName: '來賓',
  emailAddr: '',
  phoneNum: '',
  enable: 'Y',
}

//# ref→[Jotai - Persistence](https://jotai.org/docs/guides/persistence#example-with-sessionstorage)
//# ref→[Jotai - useAtomCallback](https://jotai.org/docs/utilities/callback#useatomcallback)

//※ accountAtom 不公開
const storage = createJSONStorage<IAccountState>(() => localStorage)
const accountAtom = atomWithStorage<IAccountState>(ACCOUNT_KEY, initialState, storage, { getOnInit: false })
accountAtom.debugLabel = 'accountAtom'

///useAtomCallback<Result, Args extends unknown[]>(
///  callback: (get: Getter, set: Setter, ...arg: Args) => Result,
///  options ?: Options
///): (...args: Args) => Result

/**
 * 取得登入狀態
 * @returns
 */
export function useAccountState() {
  const accountState = useAtomValue(accountAtom)
  return accountState
}

export function useAccountHandler() {

  /// 將得到同步函式
  /// resetAccount(): void
  const reset = useAtomCallback(
    useCallback((_get, set) => {
      set(accountAtom, initialState)
    }, []),
  )

  /// 將得到非同步函式
  /// registerAsync(arg1: string): Promise<string>
  const registerAsync = useAtomCallback<Promise<string>, [arg1: string]>(
    useCallback(async (_get, set, arg1) => {
      if (!Boolean(arg1)) return '參數不可空白！';

      const response = await axios.post<IBidder>(`/api/Bidder/GetBidder/${arg1}`)
      //console.debug('registerAsync', response)
      if (response.status !== 200) return '取得帳號資料失敗！';

      // SUCCESS
      const accountInfo: IAccountState = { ...response.data }
      set(accountAtom, accountInfo)
      return 'SUCCESS'; // 回傳 SUCCESS.成功 或 失敗訊息。
    },[]),
  );

  return { registerAsync, reset }
}