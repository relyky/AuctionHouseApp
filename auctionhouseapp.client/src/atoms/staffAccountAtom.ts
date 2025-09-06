import { atom, useSetAtom } from "jotai"
import { useMemo } from "react"
import { postData } from "../tools/httpHelper"

type AuthStatus = 'Guest' | 'Authing' | 'Authed'
type StaffRole = 'Sales' | 'Manager'

/**
 * �]�p�����u�P�Q���i�@�ΡC(�Ҽ{����X�֪��i���)
 */
interface IAccountStateEx {
  loginUserId: string
  loginUserName: string
  /**
   * �H�����O: VIP.�Q��, Staff.�u�@�H��
   */
  userType: 'VIP' | 'Staff'
  /**
   * �u�@�H��:����M��: Sales, Manager
   */
  roleList: StaffRole[]
  /**
   * ���v���A
   */
  status: AuthStatus
  /**
   * ���v����ɶ�
   */
  expiresTime?: Date
  /**
   * �Q��:�q�l�a�}�C
   */
  emailAddr?: string,
  /**
   * �Q��:�p���q�ܡC
   */
  phone?: string,
}

//-----------------------------------------------------------------------------
const initialState: IAccountStateEx = {
  loginUserId: '',
  loginUserName: '�ӻ�',
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
    throw new Error('doLoginAsync ����@');
  }
  catch (err: unknown) {

    throw err; //���@�w�n throw �_�h�N�P�w�����\�C
  }
}

export function useStaffAccountAction() {
  const setAccount = useSetAtom(staffAccountAtom)

  // �^�� handlers
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