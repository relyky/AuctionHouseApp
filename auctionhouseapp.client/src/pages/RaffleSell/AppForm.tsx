import { Form } from 'react-router'
import { Button, Checkbox, Container, Divider, FormControlLabel, Stack, TextField, Typography } from "@mui/material";
import { useActionState } from 'react';
import type { IRaffleOrderCreateDto } from './dto/IRaffleOrderCreateDto';

async function createRaffleAction(prevState: IRaffleOrderCreateDto, formData: FormData)
  : Promise<IRaffleOrderCreateDto> {

  try {
    console.log('createRaffleAction', { formData });
    const resp = await fetch('/api/RaffleSell/Create', {
      method: 'POST',
      body: formData,
    });

    if (!resp.ok) throw new Error('送出失敗');
    const result = await resp.json();
    const info = { success: true, message: '🎉 銷售成功', data: result };
    console.info('createRaffleAction', info);
  } catch (error) {
    const info = { success: false, message: '❌ 銷售失敗' };
    console.error('createRaffleAction', { info });
  }

  debugger;
  return prevState;
}

/**
 * 業務-銷售抽獎券
 * useFormState, useActionState
 */
export default function RaffleSell_AppForm() {
  const [state, formAction, isPending] = useActionState<IRaffleOrderCreateDto, FormData>(createRaffleAction, null);

  return (
    <Container maxWidth='xs'>
      <Typography variant='h5' gutterBottom>銷售抽獎券</Typography>
      <form action={formAction}>
        <Stack spacing={2}>
          <TextField name='buyerName' label='買家名稱' required defaultValue='foo' />
          <TextField name='buyerEmail' label='買家電郵地址' type='email' required defaultValue='foo@mail.server' />
          <TextField name='buyerPhone' label='買家聯絡電話' type='tel' required defaultValue='0900123456' />
          <TextField name='purchaseCount' label='購買張數' type='number' required defaultValue={3} />
          <TextField name='purchaseAmount' label='購買金額' type='number' required defaultValue={6000} />
          <TextField name='remark' label='備註' />
          <Divider />
          {/*<FormControlLabel required control={<Checkbox name='hasPaid' required defaultChecked={true} />} label="已付款" />*/}
          <Button type='submit' variant='contained' color='primary' loading={isPending} >下一步</Button>
        </Stack>
      </form>
    </Container>
  )
}
