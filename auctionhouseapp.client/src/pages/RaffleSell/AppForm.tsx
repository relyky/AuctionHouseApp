import { useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { raffleSellAtom, raffleUnitPriceAtom } from './atom';
import Step1View from './Step1View';
import Step2View from './Step2View';
import Step3View from "./Step3View";
import FinishView from './FinishView';
import { postData } from '../../tools/httpHelper';
import { LinearProgress } from '@mui/material';

/**
 * 業務-銷售抽獎券
 * Traditional form submission with useState and fetch
 */
export default function RaffleSell_AppForm() {
  const [{ mode }, setFormStatus] = useAtom(raffleSellAtom);
  const setRaffleUnitPrice = useSetAtom(raffleUnitPriceAtom);

  /// 取系統參數：抽獎券單價
  useEffect(() => {
    setFormStatus(prev => ({ ...prev, mode: 'Init' }))
    postData('/api/RaffleSell/GetRaffleUnitPrice')
      .then(({ raffleUnitPrice }: any) => { // 只是傳回一個數值且只用一次，懶得開 interface。
        setRaffleUnitPrice(raffleUnitPrice);
        setFormStatus(prev => ({ ...prev, mode: 'Step1' }))
      })
  }, [])

  return (
    <>
      {mode === 'Init' && <LinearProgress color='info' />}
      {mode === 'Step1' && <Step1View />}
      {mode === 'Step2' && <Step2View />}
      {mode === 'Step3' && <Step3View />}
      {mode === 'Finish' && <FinishView />}
    </>
  )
}
