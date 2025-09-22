import { Alert, LinearProgress } from "@mui/material";
import { useState, useEffect } from "react";
import { useEventCallback } from "usehooks-ts";
import { postData, ResponseError } from "../../tools/httpHelper";
import type { ISalesCodeName } from "../BackendRaffleCheck/dto/ISalesCodeName";
import RaffleOrderSoldSummaryWidget from "../BackendRaffleCheck/widgets/RaffleOrderSoldSummaryWidget";
//import RaffleOrderSoldTableWidget from "../BackendRaffleCheck/widgets/RaffleOrderSoldTableWidget";
import RaffleOrderSoldTableWidget from "./widgets/RaffleOrderSoldTableWidget";

/**
 * 參考改寫自：[BackendRaffleCheck\AppForm.RaffleOrderList]
 */
export default function TicketSalesView(props: {
  sales: ISalesCodeName | null
}) {
  const [orderList, setOrderList] = useState<IRaffleOrder[]>([])
  const [f_loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null)

  const handleLoadSalesSoldRaffleOrder = useEventCallback(() => {
    if (!props.sales) {
      setOrderList([])
      return
    }

    setLoading(true)
    setErrMsg(null)
    postData<IRaffleOrder[]>(`/api/BackendRaffleCheck/LoadSalesSoldRaffleOrder/${props.sales.salesId}`)
      .then((data) => {
        setOrderList(data)
      }).catch(error => {
        if (error instanceof ResponseError) {
          console.error('handleLoadSalesSoldRaffleOrder ResponseError', error.message);
          setErrMsg(error.message)
        }
        else {
          console.error('handleLoadSalesSoldRaffleOrder error', { error });
          setErrMsg("出現預期之外的錯誤請通知系統工程師。" + error);
        }
      }).finally(() => {
        setLoading(false)
      })
  })

  useEffect(() => {
    handleLoadSalesSoldRaffleOrder();
  }, [props.sales])

  //# to render 
  {/*  未選擇負責業務。 */ }
  if (!props.sales) {
    return <></>
    // return <Alert severity="info">
    //  未選擇負責業務。
    // </Alert>
  }

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

      <RaffleOrderSoldSummaryWidget orderList={orderList} />

      <RaffleOrderSoldTableWidget orderList={orderList} />
    </>
  )
}
