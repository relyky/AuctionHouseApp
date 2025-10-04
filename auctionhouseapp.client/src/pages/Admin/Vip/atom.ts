import { atom } from "jotai"
interface AdminVip_BizState {
  mode: EditMode
  dataList: IVip[],       // profile[]
  dataAim: IVip | null,   // profile 處理資料標的
  formData: IVip | null,  // formData
}

//-----------------------------------------------------------------------------
const initFormData: IVip = {
  paddleNum: '',
  vipName: '',
  vipEmail: '',
  vipPhone: '',
  tableNumber: '',
  seatNumber: '',
  isEnterprise: '',
  receiptHeader: '',
  taxNum: '',
}

const initialState: AdminVip_BizState = {
  mode: 'List',
  dataList: [],
  dataAim: null,
  formData: initFormData,
}

export const adminVipAtom = atom(initialState)
adminVipAtom.debugLabel = 'adminVipAtom'
