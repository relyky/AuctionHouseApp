import { Alert, Box, Button, Grid, LinearProgress, Paper, Toolbar, Typography, useEventCallback } from '@mui/material'
import { delayPromise, formatDateString } from '../../../tools/utils'
import AStaticField from '../../../widgets/AStaticField';
import { useEffect, useState } from 'react';
import { postData, ResponseError } from '../../../tools/httpHelper';
import type { ISendNoteEmailResult } from '../../RaffleSell/dto/ISendNoteEmailResult';

/**
 * A component to display the details of a raffle order in a table.
 * @param props The props for the component.
 * @returns A TableContainer component.
 */
export default function RaffleOrderTableWidget(props: {
  order: IRaffleOrder
}) {
  const { order } = props;
  const [f_loading, setLoading] = useState<boolean>(false)
  const [errMsg, setErrMsg] = useState<string | null>(null)
  const [emailTimes, setEmailTimes] = useState<number>(0)

  const handleGetEmailTimes = useEventCallback(() => {
    postData<ISendNoteEmailResult>(`/api/RaffleSellQuery/GetRaffleOrderEmailTimes/${order.raffleOrderNo}`)
      .then(info => {
        setEmailTimes(info.emailTimes)
      })
  });

  const handleSendNoteEmail = useEventCallback(async () => {
    try {
      setLoading(true)
      setErrMsg(null)

      const result = await postData<ISendNoteEmailResult>(`/api/RaffleSell/SendNoteEmail/${order.raffleOrderNo}`)
      await delayPromise(800); // 增強UX

      // SUCCESS: 更新寄信次數
      setEmailTimes(result.emailTimes)
    }
    catch (error) {
      if (error instanceof ResponseError) {
        console.error('handleSubmit ResponseError', error.message);
        setErrMsg(error.message)
      }
      else {
        console.error('handleSubmit error', { error });
        setErrMsg("出現預期之外的錯誤請通知系統工程師。" + error);
      }
    }
    finally {
      setLoading(false)
    }
  });

  useEffect(() => {
    // 一開啟先取寄件次數
    handleGetEmailTimes()
  },[])

  return (
    <Paper sx={{ mb: 2, p: 2 }}>
      <Box display='flex'>
        <Box typography='subtitle2' flexGrow={1}>Order No. {order.raffleOrderNo}</Box>
        <Button variant='outlined' size='small' onClick={handleSendNoteEmail} loading={f_loading}>Resend({emailTimes})</Button>
      </Box>

      {f_loading && <LinearProgress color='info' />}
      {errMsg && <Alert severity='error'>{errMsg}</Alert> }

      <Grid container spacing={1}>
        {/* <AStaticField label="訂單編號" value={order.raffleOrderNo} size={6} /> */}

        {/* 買家名稱 */}
        <AStaticField label="Buyer Name" value={order.buyerName} size={6} />
        {/* 聯絡電話 */}
        <AStaticField label="Phone Number" value={order.buyerPhone} size={6} />
        {/* 電郵地址 */}
        <AStaticField label="Email Address" value={order.buyerEmail} size={12} />
        {/* 購買張數 */}
        <AStaticField label="Quantity" value={order.purchaseCount} size={6} />
        {/* 購買金額 */}
        <AStaticField label="Total Amount" value={order.purchaseAmount} size={6} />

        {/* <AStaticField label="是否已付款" value={order.hasPaid === 'Y' ? '是' : '否'} size={6} />
      <AStaticField label="訂單狀態" value={order.status} size={6} /> */}

        {/* 負責業務 */}
        <AStaticField label="Sales" value={order.salesId} size={6} />
        {/* 賣出時間 */}
        <AStaticField label="Sales Time" value={formatDateString(order.soldDtm)} size={6} />
      </Grid>

    </Paper>
  )
}