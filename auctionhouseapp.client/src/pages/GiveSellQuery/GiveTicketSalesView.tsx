import { useEffect, useState } from "react";
import type { ISalesCodeName } from "../BackendRaffleCheck/dto/ISalesCodeName";
import { Alert, LinearProgress, useEventCallback } from "@mui/material";
import { postData, ResponseError } from "../../tools/httpHelper";
import GiveOrderSoldSummaryWidget from "../BackendGiveCheck/widgets/GiveOrderSoldSummaryWidget";
import GiveOrderSoldTableWidget from "./widgets/GiveOrderSoldTableWidget";

export default function GiveOrderSalesView(props: {
  sales: ISalesCodeName | null
}) {
  const [orderList, setOrderList] = useState<IGiveOrder[]>([])
  const [f_loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null)

  const handleLoadSalesSoldGiveOrder = useEventCallback(() => {
    if (!props.sales) {
      setOrderList([])
      return
    }

    setLoading(true)
    setErrMsg(null)
    postData<IGiveOrder[]>(`/api/BackendRaffleCheck/LoadSalesSoldGiveOrder/${props.sales.salesId}`)
      .then((data) => {
        setOrderList(data)
      }).catch(error => {
        if (error instanceof ResponseError) {
          console.error('handleLoadSalesSoldGiveOrder ResponseError', error.message);
          setErrMsg(error.message)
        }
        else {
          console.error('handleLoadSalesSoldGiveOrder error', { error });
          setErrMsg("出現預期之外的錯誤請通知系統工程師。" + error);
        }
      }).finally(() => {
        setLoading(false)
      })
  })

  useEffect(() => {
    handleLoadSalesSoldGiveOrder();
  }, [props.sales])

  //# to render 
  {/* 無訂單資料 */ }
  if (!orderList || orderList.length === 0) {
    return <Alert severity="info">
      No new data.
    </Alert>
  }

  return (
    <>
      {f_loading && <LinearProgress color='info' />}
      {errMsg && <Alert severity='error'>{errMsg}</Alert>}

      <GiveOrderSoldSummaryWidget orderList={orderList} />

      <GiveOrderSoldTableWidget orderList={orderList} />
    </>
  )
}