import { atom } from "jotai"
import type { IStaffProfile } from "./dto/IStaffProfile"
import type { IVipProfile } from "../../dto/IVipProfile"

// ╰参把计┾贱ㄩ虫基
export const raffleUnitPriceAtom = atom(0)
raffleUnitPriceAtom.debugLabel = 'raffleUnitPriceAtom'

// ╰参把计禥猾虫
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
