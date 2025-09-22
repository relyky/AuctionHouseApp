import { atom } from "jotai"
import type { IStaffProfile } from "./dto/IStaffProfile"


// �t�ΰѼơG�������
export const raffleUnitPriceAtom = atom(0)
raffleUnitPriceAtom.debugLabel = 'raffleUnitPriceAtom'

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
