import { atom } from "jotai"
import type { IStaffProfile } from "../RaffleSell/dto/IStaffProfile"
import type { IVipProfile } from "../../dto/IVipProfile"
import type { IGivePrizeProfile } from "../../dto/IGivePrizeProfile"

// 系統參數：抽獎券單價
export const giveUnitPriceAtom = atom(0)
giveUnitPriceAtom.debugLabel = 'giveUnitPriceAtom'

//----------------------

interface GiveSell_BizState {
  mode: EditMode
  vip?: IVipProfile,
  giveOrder?: IGiveOrder,
  sales?: IStaffProfile,
  prize?: IGivePrize
}

export const initialState: GiveSell_BizState = {
  mode: 'Init',
  vip: undefined,
  giveOrder: undefined,
  sales: undefined,
  prize: undefined,
}

export const giveSellAtom = atom(initialState)
giveSellAtom.debugLabel = 'giveSellAtom'
