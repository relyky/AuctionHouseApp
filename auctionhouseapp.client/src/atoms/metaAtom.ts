import { atom } from "jotai"
import { atomWithStorage, createJSONStorage } from 'jotai/utils'

export const blockingAtom = atom<boolean>(false)
blockingAtom.debugLabel = 'meta/blockingAtom'

export const counterAtom = atom(0)
counterAtom.debugLabel = 'meta/counterAtom'


//----
interface IBaseBiddingSn {
  baseBiddingSn: number
}

const BASE_BIDDING_SN_KEY = 'BaseBiddingSn'
const initialBaseBiddingSn: IBaseBiddingSn = {
  baseBiddingSn: 0,
}

const baseBiddingSnStorage = createJSONStorage<IBaseBiddingSn>(() => localStorage)
export const baseBiddingSnAtom = atomWithStorage<IBaseBiddingSn>(BASE_BIDDING_SN_KEY, initialBaseBiddingSn, baseBiddingSnStorage, { getOnInit: true })
baseBiddingSnAtom.debugLabel = 'meta/baseBiddingSnAtom'
//export const baseBiddingSnAtom = atom(0)
