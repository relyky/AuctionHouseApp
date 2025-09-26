import { LinearProgress, useEventCallback } from '@mui/material';
import { useAtom, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { postData } from '../../tools/httpHelper';
import { initialState, raffleSellAtom, raffleUnitPriceAtom, vipProfileListAtom } from './atom';
import FinishView from './FinishView';
import Step1View from './Step1View';
import Step2View from './Step2View';
import Step3View from "./Step3View";
import type { IVipProfile } from '../../dto/IVipProfile';

/**
 * 業務-銷售抽獎券
 * Traditional form submission with useState and fetch
 */
export default function RaffleSell_AppForm() {
  const [{ mode }, setFormStatus] = useAtom(raffleSellAtom);
  const setRaffleUnitPrice = useSetAtom(raffleUnitPriceAtom);
  const setVipProfileList = useSetAtom(vipProfileListAtom);

  ///// 取系統參數：抽獎券單價
  //useEffect(() => {
  //  setFormStatus(initialState) // 自 Init 開始。
  //  // Init: 自後端 DB 取參數
  //  postData('/api/RaffleSell/GetRaffleUnitPrice')
  //    .then(({ raffleUnitPrice }: any) => { // 只是傳回一個數值且只用一次，懶得開 interface。
  //      setRaffleUnitPrice(raffleUnitPrice);
  //      setFormStatus(prev => ({ ...prev, mode: 'Step1' }))
  //    })
  //}, [])

  const handleInitAsync = useEventCallback(async () => {
    setFormStatus(initialState) // 自 Init 開始。

    // 系統參數：抽獎券單價。 只是傳回一個數值且只用一次，懶得開 interface。
    const { raffleUnitPrice } = await postData<any>('/api/RaffleSell/GetRaffleUnitPrice');
    setRaffleUnitPrice(raffleUnitPrice)

    // 系統參數：貴賓名單
    const vipProfileList = await postData<IVipProfile[]>('/api/GiveSell/ListVipProfile');
    setVipProfileList(vipProfileList)

    // NEXT 
    setFormStatus(prev => ({ ...prev, mode: 'Step1' }))
  });

  // 一進入畫面就重取系統參數
  useEffect(() => {
    handleInitAsync()
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
