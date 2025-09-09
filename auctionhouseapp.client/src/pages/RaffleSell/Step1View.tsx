import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { Alert, Button, Container, Stack, TextField, Toolbar, Typography, useEventCallback } from "@mui/material";
import { postFormData, ResponseError } from '../../tools/httpHelper';
import { raffleSellAtom, raffleUnitPriceAtom } from './atom';

/**
 * 業務-銷售抽獎券
 * Traditional form submission with useState and fetch
 */
export default function RaffleSell_Step1View() {
  const setFormState = useSetAtom(raffleSellAtom)
  const [f_loading, setLoading] = useState<boolean>(false)
  const [errMsg, setErrMsg] = useState<string | null>(null)
  const raffleUnitPrice = useAtomValue(raffleUnitPriceAtom) // 抽獎券單價 
  const [purchaseCount, setPurchaseCount] = useState<number>(1); // 控制購買張數
  const [purchaseAmount, setPurchaseAmount] = useState<number>(raffleUnitPrice); // 控制購買金額

  const handleSubmit = useEventCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setLoading(true);
      setErrMsg(null); // 先清除錯誤訊息
      const formData = new FormData(event.currentTarget);
      const raffleOrder = await postFormData<IRaffleOrder>('/api/RaffleSell/Create', formData);
      console.info('handleSubmit success', { raffleOrder });

      setFormState(prev => ({ ...prev, mode: 'Step2', raffleOrder }))
    } catch (error) {
      if (error instanceof ResponseError) {
        console.error('handleSubmit ResponseError', error.message);
        setErrMsg(error.message)
      }
      else {
        console.error('handleSubmit error', { error });
        setErrMsg("出現預期之外的錯誤請通知系統工程師。" + error);
      }
    } finally {
      setLoading(false)
    }
  });

  const handlePurchaseCount = useEventCallback((event: ChangeEvent<HTMLInputElement>) => {
    const newCount = Number(event.target.value); // Number(event.target.value)
    const newAmount = raffleUnitPrice * newCount
    //console.log('handlePurchaseCount', { newCount, newAmount })
    setPurchaseCount(newCount)
    setPurchaseAmount(newAmount)
  });

  return (
    <Container maxWidth='xs'>
      <Typography variant='h5' gutterBottom>銷售抽獎券</Typography>
      <Toolbar>
        <Button onClick={() => alert('自有買過的客戶查詢帶出')}>老客戶</Button>
        <Button onClick={() => alert('自貴賓清單查詢帶出')}>貴賓</Button>
      </Toolbar>

      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField name='buyerName' label='買家名稱' required />
          <TextField name='buyerEmail' label='買家電郵地址' type='email' required />
          <TextField name='buyerPhone' label='買家聯絡電話' type='tel' required />
          <TextField name='purchaseCount' label='購買張數' type='number' required
            value={purchaseCount} onChange={handlePurchaseCount}
            slotProps={{ htmlInput: { min: 1 } }} />
          <TextField name='purchaseAmount' label='購買金額' type='number' required
            value={purchaseAmount} onChange={(e) => setPurchaseAmount(Number(e.target.value))}
            slotProps={{ htmlInput: { min: 0 } }} />

          {errMsg &&
            <Alert severity="error" onClose={() => setErrMsg(null)}>
              {errMsg}
            </Alert>}

          {/*<FormControlLabel required control={<Checkbox name='hasPaid' required defaultChecked={true} />} label="已付款" />*/}
          <Button type='submit' variant='contained' color='primary' loading={f_loading}>建立訂單</Button>
        </Stack>

        <Alert severity='info' sx={{ my: 2 }}>
          抽獎券單價：{raffleUnitPrice} 元
        </Alert>

      </form>
    </Container>
  )
}
