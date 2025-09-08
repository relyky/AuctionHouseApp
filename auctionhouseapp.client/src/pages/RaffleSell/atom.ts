import { atom } from "jotai"

interface RaffleSell_BizState {
  mode: EditMode
  raffleOrder?: IRaffleOrder,
}

const initialState: RaffleSell_BizState = {
  mode: 'Step1',
  raffleOrder: undefined,
}

export const raffleSellAtom = atom(initialState)
raffleSellAtom.debugLabel = 'raffleSellAtom'
