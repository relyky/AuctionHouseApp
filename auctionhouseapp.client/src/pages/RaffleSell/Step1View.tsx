import { useState } from 'react';
import type { FormEvent } from 'react';
import { useSetAtom } from 'jotai';
import { Alert, Button, Container, Stack, TextField, Typography, useEventCallback } from "@mui/material";
import { postFormData, ResponseError } from '../../tools/httpHelper';
import { raffleSellAtom } from './atom';

/**
 * 業務-銷售抽獎券
 * Traditional form submission with useState and fetch
 */
export default function RaffleSell_Step1View() {
  const setFormState = useSetAtom(raffleSellAtom);
  const [f_loading, setLoading] = useState<boolean>(false)
  const [errMsg, setErrMsg] = useState<string | null>(null)

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

  return (
    <Container maxWidth='xs'>
      <Typography variant='h5' gutterBottom>銷售抽獎券</Typography>
      <Button onClick={()=>alert('查詢帶出之前有買過的客戶')}>老客戶</Button>

      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField name='buyerName' label='買家名稱' required />
          <TextField name='buyerEmail' label='買家電郵地址' type='email' required />
          <TextField name='buyerPhone' label='買家聯絡電話' type='tel' required />
          <TextField name='purchaseCount' label='購買張數' type='number' required
            slotProps={{ htmlInput: { min: 1 } }} />
          <TextField name='purchaseAmount' label='購買金額' type='number' required
            slotProps={{ htmlInput: { min: 0 } }} />

          {errMsg &&
            <Alert severity="error" onClose={() => setErrMsg(null)}>
              {errMsg}
            </Alert>}

          {/*<FormControlLabel required control={<Checkbox name='hasPaid' required defaultChecked={true} />} label="已付款" />*/}
          <Button type='submit' variant='contained' color='primary' loading={f_loading}>建立訂單</Button>
        </Stack>
      </form>
    </Container>
  )
}
