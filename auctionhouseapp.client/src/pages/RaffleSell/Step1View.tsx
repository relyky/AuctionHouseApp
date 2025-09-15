import { Alert, Button, Container, IconButton, InputAdornment, Stack, TextField, Toolbar, Typography, useEventCallback } from "@mui/material";
import { useAtomValue, useSetAtom } from 'jotai';
import type { ChangeEvent, FormEvent } from 'react';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { postData, postFormData, ResponseError } from '../../tools/httpHelper';
import { raffleSellAtom, raffleUnitPriceAtom } from './atom';
//icons
import MailIcon from '@mui/icons-material/MailOutline';
import CheckEmailIcon from '@mui/icons-material/MarkEmailRead';
import PlusIcon from '@mui/icons-material/Add';
import MinusIcon from '@mui/icons-material/Remove';
import PickBuyerDlg from "./PickBuyerDlg";
import type { IBuyerProfile } from "./dto/IBuyerProfile";

/**
 * 業務-銷售抽獎券
 * Traditional form submission with useState and fetch
 */
export default function RaffleSell_Step1View() {
  const setFormState = useSetAtom(raffleSellAtom)
  const [f_loading, setLoading] = useState<boolean>(false)
  const [errMsg, setErrMsg] = useState<string | null>(null)
  const raffleUnitPrice = useAtomValue(raffleUnitPriceAtom) // 抽獎券單價 
  const [purchaseCount, setPurchaseCount] = useState<string>('1'); // 控制:購買張數
  const [purchaseAmount, setPurchaseAmount] = useState<number>(raffleUnitPrice); // 控制:購買金額
  const [buyerEmail, setBuyerEmail] = useState<string>(''); // 控制:買家電郵地址
  const [buyerPhone, setBuyerPhone] = useState<string>(''); // 控制:買家
  const [buyerName, setBuyerName] = useState<string>(''); // 控制:買家
  const [hasCheckEmail, setHasCheckEmail] = useState<boolean>(false)

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
    setPurchaseCount(String(newCount))
  });

  const handleCheckEmail = useEventCallback(async () => {
    Swal.fire({
      title: '請稍候...',
      text: '正在處理中',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
        postData<MsgObj>('/api/RaffleSell/TestSendEmail', { buyerEmail })
          .then(() => {
            Swal.close()
            setHasCheckEmail(true)
            Swal.fire({ text: '已送出測試信。需買家收件確認才算成功。', icon: 'info' });
          }).
          catch(error => {
            Swal.close()
            console.error('handleCheckEmail error', { error });
            Swal.fire({ title: '測試失敗！', icon: 'error' });
          })
      }
    });
  });

  const decreasePurchaseCount = useEventCallback(() => {
    setPurchaseCount(prev => Number(prev) <= 1 ? '1' : String(Number(prev) - 1));
  });

  const increasePurchaseCount = useEventCallback(() => {
    setPurchaseCount(prev => String(Number(prev) + 1));
  });

  const handlePickBuyer = useEventCallback((buyer: IBuyerProfile) => {
    setBuyerName(buyer.buyerName);
    setBuyerEmail(buyer.buyerEmail);
    setBuyerPhone(buyer.buyerPhone);
  });

  // 依「購買張數」計算「購買金額」
  useEffect(() => {
    setPurchaseAmount(raffleUnitPrice * Number(purchaseCount))
  }, [purchaseCount])

  return (
    <Container maxWidth='xs'>
      <Typography variant='h5' gutterBottom>銷售抽獎券</Typography>
      <Toolbar>
        <PickBuyerDlg onPick={handlePickBuyer} />

        <Button onClick={() => alert('自有買過的客戶查詢帶出')}>老客戶</Button>
        <Button onClick={() => alert('自貴賓清單查詢帶出')}>貴賓</Button>
      </Toolbar>

      <form onSubmit={handleSubmit}>
        <Stack spacing={1}>
          <TextField name='buyerName' label='買家名稱' required
            value={buyerName} onChange={(e) => setBuyerName(e.target.value)}
          />

          <TextField name='buyerEmail' label='買家電郵地址' type='email' required
            helperText="可按右側按鈕寄測試 Email。"
            value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)}
            slotProps={{
              input: {
                endAdornment: <InputAdornment position="end" >
                  <IconButton edge="end" size='large' onClick={handleCheckEmail}>
                    {hasCheckEmail ? <CheckEmailIcon color='info' /> : <MailIcon color='primary' />}
                  </IconButton>
                </InputAdornment>
              }
            }}
          />

          <TextField name='buyerPhone' label='買家聯絡電話' type='tel' required
            value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)}
          />

          <TextField name='purchaseCount' label='購買張數' type='number' required
            value={purchaseCount} onChange={handlePurchaseCount}
            slotProps={{
              htmlInput: { min: 1 },
              input: {
                endAdornment: <InputAdornment position="end">
                  <IconButton onClick={decreasePurchaseCount}>
                    <MinusIcon color='primary' />
                  </IconButton>
                  <IconButton onClick={increasePurchaseCount}>
                    <PlusIcon color='primary' />
                  </IconButton>
                </InputAdornment>,
              }
            }}
          />

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
