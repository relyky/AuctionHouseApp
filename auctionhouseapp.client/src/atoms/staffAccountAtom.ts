import { atom, useSetAtom } from "jotai"
import { useMemo } from "react"
import { postData } from "../tools/httpHelper"

type AuthStatus = 'Guest' | 'Authing' | 'Authed'
type StaffRole = 'Sales' | 'Manager'

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
    return (state.status === 'Authed' && state.expiresTime && state.expiresTime < now)
  }
)
selectAuthed.debugLabel = 'selectAuthed'

// derivedAtom / selector
export const selectAuthing = atom(
  (get) => get(staffAccountAtom).status === 'Authing'
)
selectAuthing.debugLabel = 'selectAuthing'

//-----------------------------------------------------------------------------

async function doLoginAsync(args: unknown): Promise<any> {
  try {
    throw new Error('doLoginAsync 未實作');
  }
  catch (err: unknown) {

    throw err; //※一定要 throw 否則將判定為成功。
  }
}

export function useStaffAccountAction() {
  const setAccount = useSetAtom(staffAccountAtom)

  // 回傳 handlers
  return useMemo(() => {

    logoutAsync: async () => {
      try {
        setAccount(prev => ({ ...prev, status: 'Authing' }))
        await postData('api/Account/Logout');
        setAccount(initialState)
      } catch (err: unknown) {
        setAccount(initialState)
      }
    },
  }, [setAccount])
}