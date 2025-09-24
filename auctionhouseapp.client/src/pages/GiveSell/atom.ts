import { atom } from "jotai"
import type { IStaffProfile } from "../RaffleSell/dto/IStaffProfile"

// 系統參數：抽獎券單價
export const giveUnitPriceAtom = atom(0)
giveUnitPriceAtom.debugLabel = 'giveUnitPriceAtom'

//----------------------

interface GiveSell_BizState {
  mode: EditMode
  giveOrder?: IGiveOrder,
  sales?: IStaffProfile,
  vip?: IVip,
}

export const initialState: GiveSell_BizState = {
  mode: 'Init',
  giveOrder: undefined,
  sales: undefined,
  vip: undefined,
}

export const giveSellAtom = atom(initialState)
giveSellAtom.debugLabel = 'giveSellAtom'
