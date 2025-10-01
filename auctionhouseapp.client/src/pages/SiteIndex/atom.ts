import { atom } from "jotai"
import type { IRafflePrizeProfile } from "../../dto/display/IRafflePrizeProfile"
import type { IGivePrizeProfile } from "../../dto/display/IGivePrizeProfile"
import type { IAuctionPrizeProfile } from "../../dto/display/IAuctionPrizeProfile"

// 主控台狀態：
export const siteStatusAtom = atom(0)
siteStatusAtom.debugLabel = 'siteStatusAtom'

//----------------------

// 基本資料：RafflePrize
export const rafflePrizeProfileAtom = atom<IRafflePrizeProfile[]>([])
rafflePrizeProfileAtom.debugLabel = 'rafflePrizeProfileAtom'

// 基本資料：GivePrize
export const givePrizeProfileAtom = atom<IGivePrizeProfile[]>([])
givePrizeProfileAtom.debugLabel = 'givePrizeProfileAtom'

// 基本資料：AuctionPrize
export const auctionPrizeProfileAtom = atom<IAuctionPrizeProfile[]>([])
auctionPrizeProfileAtom.debugLabel = 'auctionPrizeProfileAtom'


//----------------------
