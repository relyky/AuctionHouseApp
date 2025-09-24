import { useAtom, useSetAtom } from "jotai";
import { giveSellAtom, giveUnitPriceAtom, initialState } from "./atom";
import { useEffect } from "react";
import { postData } from "../../tools/httpHelper";
import { LinearProgress } from "@mui/material";
import Step1View from "./Step1View";
import Step2View from "./Step2View";
import Step3View from "./Step3View";
import FinishView from "./FinishView";

/**
 * 業務-銷售福袋抽獎券
 */
export default function GiveSell() {
  const [{ mode }, setFormStatus] = useAtom(giveSellAtom);
  const setGiveUnitPrice = useSetAtom(giveUnitPriceAtom);

  /// 取系統參數：抽獎券單價
  useEffect(() => {
    setFormStatus(initialState) // 自 Init 開始。
    // Init: 自後端 DB 取參數
    postData('/api/GiveSell/GetGiveUnitPrice')
      .then(({ giveUnitPrice }: any) => { // 只是傳回一個數值且只用一次，懶得開 interface。
        setGiveUnitPrice(giveUnitPrice);
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
  );
}
