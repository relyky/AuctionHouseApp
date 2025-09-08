import { useAtomValue } from 'jotai';
import { raffleSellAtom } from './atom';
import Step1View from './Step1View';
import Step2View from './Step2View';
import Step3View from "./Step3View";
import FinishView from './FinishView';

/**
 * 業務-銷售抽獎券
 * Traditional form submission with useState and fetch
 */
export default function RaffleSell_AppForm() {
  const { mode } = useAtomValue(raffleSellAtom);

  return (
    <>
      {mode === 'Step1' && <Step1View />}
      {mode === 'Step2' && <Step2View />}
      {mode === 'Step3' && <Step3View />}
      {mode === 'Finish' && <FinishView />}
    </>
  )
}
