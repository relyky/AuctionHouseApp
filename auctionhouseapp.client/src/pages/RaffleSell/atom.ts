import { atom } from "jotai"

interface RaffleSell_BizState {
  mode: EditMode
  formNo?: string
  //dataList: IDEMO012_Profile[],
  //dataAim?: IDEMO012_Profile, // 處理資料標的
  //formData?: IDEMO012_FormData,
}

const initialState: RaffleSell_BizState = {
  mode: 'Step1',
  formNo: undefined,
  //dataList: [],
  //dataAim: null,
  //formData: initFormData,
}

export const raffleSellAtom = atom(initialState)
raffleSellAtom.debugLabel = 'raffleSellAtom'
