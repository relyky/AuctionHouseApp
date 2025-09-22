import { Alert, Button, ButtonGroup, Container, IconButton, InputAdornment, Stack, TextField, Toolbar, Typography, useEventCallback } from "@mui/material";
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import type { ChangeEvent, FormEvent } from 'react';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { postData, postFormData, ResponseError } from '../../tools/httpHelper';
import { raffleSellAtom, raffleUnitPriceAtom } from './atom';
import type { IBuyerProfile } from "./dto/IBuyerProfile";
import type { IStaffProfile } from "./dto/IStaffProfile";
//icons
//import MailIcon from '@mui/icons-material/MailOutline';
//import CheckEmailIcon from '@mui/icons-material/MarkEmailRead';
import PlusIcon from '@mui/icons-material/Add';
import MinusIcon from '@mui/icons-material/Remove';
import PickBuyerDlg from "./PickBuyerDlg";

/**
 * 業務-銷售抽獎券
 * Traditional form submission with useState and fetch
 */
export default function RaffleSell_Step1View() {
  const [{ raffleOrder }, setFormState] = useAtom(raffleSellAtom);
  const [f_loading, setLoading] = useState<boolean>(false)
  const [errMsg, setErrMsg] = useState<string | null>(null)
  const raffleUnitPrice = useAtomValue(raffleUnitPriceAtom) // 抽獎券單價 
  const [buyerName, setBuyerName] = useState<string>(''); // 控制:買家
  const [buyerEmail, setBuyerEmail] = useState<string>(''); // 控制:買家電郵地址
  const [buyerPhone, setBuyerPhone] = useState<string>(''); // 控制:買家
  const [purchaseCount, setPurchaseCount] = useState<string>('1'); // 控制:購買張數
  const [purchaseAmount, setPurchaseAmount] = useState<number>(raffleUnitPrice); // 控制:購買金額

  const [hasCheckEmail, setHasCheckEmail] = useState<boolean>(false)

  const handleSubmit = useEventCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setLoading(true);
      setErrMsg(null); // 先清除錯誤訊息
      const formData = new FormData(event.currentTarget);
      const raffleOrder = await postFormData<IRaffleOrder>('/api/RaffleSell/Create', formData);
      const sales = await postData<IStaffProfile>(`/api/RaffleSell/GetStaffProfile/${raffleOrder.salesId}`);
      console.info('handleSubmit success', { raffleOrder, sales });
      setFormState(prev => ({ ...prev, mode: 'Step2', raffleOrder, sales }))
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

  // 若已填過單。可修改訂單內容。
  useEffect(() => {
    if (raffleOrder) {
      setBuyerName(raffleOrder.buyerName)
      setBuyerEmail(raffleOrder.buyerEmail)
      setBuyerPhone(raffleOrder.buyerPhone)
      setPurchaseCount(String(raffleOrder.purchaseCount))
      setPurchaseAmount(raffleOrder.purchaseAmount)
    }
  }, [raffleOrder])


  // 依「購買張數」計算「購買金額」
  useEffect(() => {
    // 1 張100元。買 12 張優惠 1000 元。
    const discountCount = 12; // 幾張開始有優惠
    const discountPrice = 10 * raffleUnitPrice; // 優惠價
    const count = Number(purchaseCount);
    const sets = Math.floor(count / discountCount); // 幾組
    const ones = count % discountCount; // 零頭
    const total = sets * discountPrice + ones * raffleUnitPrice;
    setPurchaseAmount(total)
  }, [purchaseCount])

  return (
    <Container maxWidth='xs'>
      {/* 銷售抽獎券 */}
      <Typography variant='h5'>Sell Raffle Tickets</Typography>
      <Toolbar variant='regular' disableGutters>
        {/* 老客戶 */}
        <PickBuyerDlg label='Returning Customer' onPick={handlePickBuyer} />

        {import.meta.env.DEV && /* 正式版先藏起來 */
          <Button onClick={() => alert('自貴賓清單查詢帶出')}>貴賓</Button>
        }
      </Toolbar>

      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          {/* 買家名稱 */}
          <TextField name='buyerName' label='Buyer Full Name' required
            value={buyerName} onChange={(e) => setBuyerName(e.target.value)}
            slotProps={{
              htmlInput: {
                maxLength: 100,
              }
            }}
          />

          {/* 買家電郵地址 */}
          <TextField name='buyerEmail' label='Buyer Email Address' type='email' required
            value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)}
            slotProps={{
              htmlInput: {
                maxLength: 100,
              }
            }}
          />

          {/* <TextField name='buyerEmail' label='買家電郵地址' type='email' required
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
          /> */}

          {/* 買家聯絡電話 */}
          <TextField name='buyerPhone' label='Buyer Mobile Number' type='tel' required
            value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)}
            slotProps={{
              htmlInput: {
                maxLength: 50,
              }
            }}
          />

          {/* 購買張數 */}
          <TextField name='purchaseCount' label='Quantity' type='number' required
            value={purchaseCount} onChange={handlePurchaseCount}
            slotProps={{
              htmlInput: { min: 1, max: 9999 },
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

          {/* 購買金額 */}
          <TextField name='purchaseAmount' label='Total Amount' type='number' required
            value={purchaseAmount} onChange={(e) => setPurchaseAmount(Number(e.target.value))}
            slotProps={{ htmlInput: { min: 0, } }} />

          <input type='hidden' name='raffleOrderNo' value={raffleOrder?.raffleOrderNo ?? 'NEW'} />

          {errMsg &&
            <Alert severity="error" onClose={() => setErrMsg(null)}>
              {errMsg}
            </Alert>}

          <Button type='submit' variant='contained' color='primary' loading={f_loading}>
            {Boolean(raffleOrder) ? 'Submit Changes' : 'Create Order'}
          </Button>

        </Stack>
      </form>

      {/* 抽獎券單張 100 元。優惠活動 12 張 1000 元。*/}
      <Alert severity='info' sx={{ my: 2 }}>
        Each raffle ticket NT${raffleUnitPrice}.<br/> Promotion: 12 tickets for NT${raffleUnitPrice * 10}.
      </Alert>
    </Container>
  )
}
