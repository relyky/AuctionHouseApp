import { useState } from 'react';
import type { FormEvent } from 'react';
import { Alert, Button, Container, Stack, TextField, Typography } from "@mui/material";
import { postFormData, ResponseError } from '../../tools/httpHelper';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { raffleSellAtom } from './atom';
import Swal from 'sweetalert2'

/**
 * 業務-銷售抽獎券
 * Traditional form submission with useState and fetch
 */
export default function RaffleSell_Step1View() {
  const setFormState = useSetAtom(raffleSellAtom);

  const [f_loading, setLoading] = useState<boolean>(false)
  const [errMsg, setErrMsg] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setLoading(true);
      setErrMsg(null); // 先清除錯誤訊息
      const formData = new FormData(event.currentTarget);
      const result = await postFormData<MsgObj>('/api/RaffleSell/Create', formData);
      console.info('handleSubmit success', { result });

      if (result.message !== "SUCCESS") {
        Swal.fire(result.message);
        return;
      }

      setFormState(prev => ({ ...prev, mode: 'Step2', formNo: result.formNo }))
    } catch (error) {
      if (error instanceof ResponseError) {
        console.error('handleSubmit ResponseError', error.message);
        //Swal.fire("出現錯誤！", error.message, 'error');
        setErrMsg(error.message)
      }
      else {
        console.error('handleSubmit error', { error });
        //Swal.fire("出現例外！", "出現預期之外的錯誤請通知系統工程師。", 'error');
        setErrMsg("出現預期之外的錯誤請通知系統工程師。" + error);
      }
    } finally {
      setLoading(false)
    }
  };

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
          <TextField name='remark' label='備註' />

          {errMsg &&
            <Alert severity="error" onClose={() => setErrMsg(null)}>
              {errMsg}
            </Alert>}

          {/*<FormControlLabel required control={<Checkbox name='hasPaid' required defaultChecked={true} />} label="已付款" />*/}
          <Button type='submit' variant='contained' color='primary' loading={f_loading}>下一步</Button>
        </Stack>
      </form>
    </Container>
  )
}
