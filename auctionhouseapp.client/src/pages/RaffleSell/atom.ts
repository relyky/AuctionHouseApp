import { atom } from "jotai"
import type { IStaffProfile } from "./dto/IStaffProfile"
import type { IVipProfile } from "../../dto/IVipProfile"

// �t�ΰѼơG�������
export const raffleUnitPriceAtom = atom(0)
raffleUnitPriceAtom.debugLabel = 'raffleUnitPriceAtom'

// �t�ΰѼơG�Q���W��
export const vipProfileListAtom = atom<IVipProfile[]>([])
vipProfileListAtom.debugLabel = 'vipProfileListAtom'

//----------------------

interface RaffleSell_BizState {
  mode: EditMode
  raffleOrder?: IRaffleOrder,
  sales?: IStaffProfile,
}

export const initialState: RaffleSell_BizState = {
  mode: 'Init',
  raffleOrder: undefined,
}

export const raffleSellAtom = atom(initialState)
raffleSellAtom.debugLabel = 'raffleSellAtom'
