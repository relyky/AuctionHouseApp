import { Alert, Box, Button, Checkbox, Collapse, Container, Divider, FormControlLabel, LinearProgress, Stack, Typography, useEventCallback } from "@mui/material";
import { useEffect, useMemo, useReducer, useState, type FC } from "react";
import { postData, ResponseError } from "../../tools/httpHelper";
import type { ICheckRaffleOrdersArgs } from "./dto/ICheckRaffleOrdersArgs";
import type { ISalesCodeName } from "./dto/ISalesCodeName";
import RaffleOrderSoldSummaryWidget from "./widgets/RaffleOrderSoldSummaryWidget";
import RaffleOrderSoldTableWidget from "./widgets/RaffleOrderSoldTableWidget";
import SalesAutocomplete from "./widgets/SalesAutocomplete";

/**
 * 抽獎券銷售收費查驗 
 * 業務把收到的錢交給經理後，經理打勾確認。
 */
export default function StaffLogin_AppForm() {
  const [sales, setSales] = useState<ISalesCodeName | null>(null)
  const [orderList, setOrderList] = useState<IRaffleOrder[]>([])
  const [isConfirm, setIsConfirm] = useState(false)
  const [f_loading, setLoading] = useState(false);
  //const [errMsg, setErrMsg] = useState<string | null>(null)
  const [msgObj, setMsgObj] = useState<MsgObj | null>(null)

  // 判斷已成功 => 應進行下一輪
  const isSuccessDone = useMemo(() => {
    return msgObj?.severity === 'success';
  }, [msgObj]);

  const handleSubmit = useEventCallback(async () => {
    try {
      setLoading(true);
      setMsgObj(null); // 先清除錯誤訊息

      const args: ICheckRaffleOrdersArgs = {
        orderNoList: orderList.map(o => o.raffleOrderNo)
      };

      const msg = await postData<MsgObj>(`/api/BackendRaffleCheck/CheckRaffleOrders`, args);
      console.info('handleSubmit done', { msg });

      setMsgObj(msg)
      //setFormState(prev => ({ ...prev, mode: 'Step3', raffleOrder: data }))
    } catch (error) {
      if (error instanceof ResponseError) {
        console.error('handleSubmit ResponseError', error.message);
        setMsgObj({ severity: 'error', message: error.message })
      }
      else {
        console.error('handleSubmit error', { error });
        setMsgObj({ severity: 'error', message: "出現預期之外的錯誤請通知系統工程師。" + error });
      }
    } finally {
      setLoading(false)
    }
  });

  return (
    <Container maxWidth='sm'>
      {/* 抽獎券銷售查驗 */}
      <Typography variant='h5' gutterBottom>Raffle Ticket Sales Verification</Typography>
      {/* 業務把收到的錢交給經理後，經理打勾確認。 */}
      <Box>The finance staff will verify and confirm the amount.</Box>

      {/* 選取業務 */}
      <SalesAutocomplete onChange={(sales) => {
        setSales(sales)
        // reset UI
        setIsConfirm(false)
        setMsgObj(null)
      }} />

      {/* 顯示銷售狀況 */}
      <RaffleOrderList sales={sales}
        orderList={orderList}
        setOrderList={setOrderList}
      />

      {/* 查驗收取金額 */}
      <Divider sx={{ my: 1 }} />

      {/* CommandBar */}
      {!isSuccessDone && Array.isArray(orderList) && orderList.length > 0 &&
        <Stack spacing={2} alignItems='center'>

          {/* 已查驗才勾選 */}
          <FormControlLabel label="Verified and Confirmed" sx={{ flexGrow: 1 }}
            control={<Checkbox
              checked={isConfirm}
              onChange={(_, chk) => setIsConfirm(chk)} />}
          />

          {/* 查驗確認 */}
          <Button variant='contained'
            color='primary'
            loading={f_loading} disabled={!isConfirm}
            onClick={handleSubmit}
          >Confirm</Button>
        </Stack>
      }

      {msgObj &&
        <Alert severity={msgObj.severity || 'info'} sx={{ m: 3 }}>
          {msgObj.message}
        </Alert>}

      {/* errMsg && <Alert severity='error' sx={{ m: 3 }}>{errMsg}</Alert> */}

      {/* import.meta.env.DEV && <pre>sales: {JSON.stringify(sales)}</pre> */}

      {/* tail */}
      <Box sx={{ pb: 3 }}></Box>
    </Container>
  )
}

//-------------------------------------
const RaffleOrderList: FC<{
  sales: ISalesCodeName | null
  orderList: IRaffleOrder[]
  setOrderList: (orderList: IRaffleOrder[]) => void
}> = (props) => {
  const { orderList, setOrderList } = props
  const [f_loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null)
  const [f_showDetail, toggleShowDetail] = useReducer(f => !f, true)

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
      {/* <Button sx={{ my: 1 }}
        onClick={toggleShowDetail}>{f_showDetail ? '隱藏訂單' : '顯示訂單'}</Button> */}
      <Collapse in={f_showDetail}>
        <RaffleOrderSoldTableWidget orderList={orderList} />
      </Collapse>
    </>
  )
}