import { atomWithStorage, createJSONStorage } from 'jotai/utils'

export interface IAUC1010_FormState {
  lastBidMsg: IBidMsg | null
}

const FORM_STATE_KEY = 'AUC1010_FormState'
const initialFormState: IAUC1010_FormState = {
  lastBidMsg: null,
}

const formStateStorage = createJSONStorage<IAUC1010_FormState>(() => sessionStorage)
export const auc1010Atom = atomWithStorage<IAUC1010_FormState>(FORM_STATE_KEY, initialFormState, formStateStorage)
auc1010Atom.debugLabel = 'auc1010Atom'
