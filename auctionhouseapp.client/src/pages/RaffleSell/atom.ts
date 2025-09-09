import { atom } from "jotai"


// ╰参把计┾贱ㄩ虫基
export const raffleUnitPriceAtom = atom(0)
raffleUnitPriceAtom.debugLabel = 'raffleUnitPriceAtom'

//----------------------

interface RaffleSell_BizState {
  mode: EditMode
  raffleOrder?: IRaffleOrder,
}

const initialState: RaffleSell_BizState = {
  mode: 'Init',
  raffleOrder: undefined,
}

export const raffleSellAtom = atom(initialState)
raffleSellAtom.debugLabel = 'raffleSellAtom'
