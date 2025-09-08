import { useMemo } from "react"
import { atom, useSetAtom } from "jotai"
import { postData, ResponseError } from "../tools/httpHelper"
import { delayPromise } from "../tools/utils"
import { parseISO } from 'date-fns'
import { encrypt2 } from "../tools/aesHelper"
import type { ILoginArgs } from "../dto/ILoginArgs"
import type { ILoginUserInfo } from "../dto/ILoginUserInfo"
import Swal from "sweetalert2"

type AuthStatus = 'Guest' | 'Authing' | 'Authed'
type StaffRole = 'Sales' | 'Manager'
type UserType = 'VIP' | 'Staff'

/**
 * 設計成員工與貴賓可共用。(考慮之後合併的可能性)
 */
interface IAccountStateEx {
  loginUserId: string
  loginUserName: string
  /**
   * 人員類別: VIP.貴賓, Staff.工作人員
   */
  userType: 'VIP' | 'Staff'
  /**
   * 工作人員:角色清單: Sales, Manager
   */
  roleList: StaffRole[]
  /**
   * 授權狀態
   */
  status: AuthStatus
  /**
   * 授權到期時間
   */
  expiresTime?: Date
  /**
   * 貴賓:電郵地址。
   */
  emailAddr?: string,
  /**
   * 貴賓:聯絡電話。
   */
  phone?: string,
}

//-----------------------------------------------------------------------------
const initialState: IAccountStateEx = {
  loginUserId: '',
  loginUserName: '來賓',
  userType: 'VIP',
  roleList: [],
  status: 'Guest',
  expiresTime: undefined,
  emailAddr: undefined,
  phone: undefined,
}

export const staffAccountAtom = atom<IAccountStateEx>(initialState)
staffAccountAtom.debugLabel = 'staffAccountAtom'
//-----------------------------------------------------------------------------

// derivedAtom / selector
export const selectAuthed = atom(
  (get) => {
    const state = get(staffAccountAtom)
    const now = new Date()
    return (state.status === 'Authed' && state.expiresTime && state.expiresTime > now)
  }
)
selectAuthed.debugLabel = 'selectAuthed'

// derivedAtom / selector
// 特例應用：登入者是工作人員
export const selectIsAuthedStaff = atom(
  (get) => {
    const state = get(staffAccountAtom)
    const now = new Date()
    return (state.status === 'Authed' && state.userType === 'Staff' && state.expiresTime && state.expiresTime > now)
  }
)
selectIsAuthedStaff.debugLabel = 'selectIsAuthedStaff'

// derivedAtom / selector
export const selectAuthing = atom(
  (get) => get(staffAccountAtom).status === 'Authing'
)
selectAuthing.debugLabel = 'selectAuthing'

//-----------------------------------------------------------------------------

async function doLoginAsync(args: ILoginArgs): Promise<ILoginUserInfo> {
  try {
    //const credential = `${args.vcode}:${args.userId}:${args.mima}` // 之後再加密    
    const credential = encrypt2(`${args.vcode}:${args.userId}:${args.mima}`)
    const msg = await postData<MsgObj>(`/api/Account/Login?credential=${credential}`)
    if (msg.message !== 'Login success.')
      throw new ResponseError(msg.message, 401, 'Unauthorized');

    const loginUser = await postData<ILoginUserInfo>('/api/Account/GetLoginUser')
    return loginUser
  }
  catch (err: unknown) {
    if (err instanceof ResponseError)
      Swal.fire("登入失敗！", `${err.status} ${err.statusText}`, 'error');
    throw err; //※一定要 throw 否則將判定為成功。
  }
}

export function useStaffAccountAction() {
  const setAccount = useSetAtom(staffAccountAtom)

  // 回傳 handlers
  return useMemo(() => ({
    loginAsync: async (args: ILoginArgs) => {
      try {
        setAccount(prev => ({ ...prev, status: 'Authing' }))
        const loginUser = await doLoginAsync(args);
        await delayPromise(800); // 提昇UX

        const account: IAccountStateEx = {
          loginUserId: loginUser.loginUserId,
          loginUserName: loginUser.loginUserName,
          userType: loginUser.userType as UserType,
          roleList: loginUser.roleList as StaffRole[],
          status: loginUser.status as AuthStatus,
          expiresTime: parseISO(loginUser.expiresTime),
          emailAddr: loginUser.emailAddr,
          phone: loginUser.phone,
        };

        //console.info('loginAsync', { loginUser, account })        
        setAccount(account);
      }
      catch (err: unknown) {
        setAccount(initialState)
      }
    },
    logoutAsync: async () => {
      try {
        setAccount(prev => ({ ...prev, status: 'Authing' }))
        await postData('/api/Account/Logout');
        setAccount(initialState)
      } catch (err: unknown) {
        setAccount(initialState)
      }
    },
    refillLoginUserAsync: async () => {
      try {
        setAccount(prev => ({ ...prev, status: 'Authing' }))
        const loginUser = await postData<ILoginUserInfo>('/api/Account/GetLoginUser')

        const account: IAccountStateEx = {
          loginUserId: loginUser.loginUserId,
          loginUserName: loginUser.loginUserName,
          userType: loginUser.userType as UserType,
          roleList: loginUser.roleList as StaffRole[],
          status: loginUser.status as AuthStatus,
          expiresTime: parseISO(loginUser.expiresTime),
          emailAddr: loginUser.emailAddr,
          phone: loginUser.phone,
        };

        //console.info('loginAsync', { loginUser, account })        
        setAccount(account);
      } catch (err: unknown) {
        setAccount(initialState)
      }
    }
  }), [setAccount])
}