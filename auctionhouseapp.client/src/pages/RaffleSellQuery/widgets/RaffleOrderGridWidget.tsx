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
      await delayPromise(1600); // 增強UX

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
        <Box typography='subtitle2' flexGrow={1}>訂單 {order.raffleOrderNo}</Box>
        <Button variant='outlined' size='small' onClick={handleSendNoteEmail} loading={f_loading}>重寄({emailTimes})</Button>
      </Box>

      {f_loading && <LinearProgress color='info' />}
      {errMsg && <Alert severity='error'>{errMsg}</Alert> }

      <Grid container spacing={1}>
        {/* <AStaticField label="訂單編號" value={order.raffleOrderNo} size={6} /> */}
        <AStaticField label="買家名稱" value={order.buyerName} size={6} />
        <AStaticField label="聯絡電話" value={order.buyerPhone} size={6} />
        <AStaticField label="電郵地址" value={order.buyerEmail} size={12} />
        <AStaticField label="購買張數" value={order.purchaseCount} size={6} />
        <AStaticField label="購買金額" value={order.purchaseAmount} size={6} />
        {/* <AStaticField label="是否已付款" value={order.hasPaid === 'Y' ? '是' : '否'} size={6} />
      <AStaticField label="訂單狀態" value={order.status} size={6} /> */}
        <AStaticField label="負責業務" value={order.salesId} size={6} />
        <AStaticField label="賣出時間" value={formatDateString(order.soldDtm)} size={6} />
      </Grid>

    </Paper>
  )
}