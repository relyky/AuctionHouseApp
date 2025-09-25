import { Alert, Button, Container, IconButton, InputAdornment, Stack, TextField, Toolbar, Typography } from "@mui/material";
import { useAtom, useAtomValue } from "jotai";
import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useState } from "react";
import { useEventCallback } from "usehooks-ts";
import type { IVipProfile } from "../../dto/IVipProfile";
import { SelectVipWidget } from "../../widgets/SelectVipWidget";
import { giveSellAtom, giveUnitPriceAtom } from "./atom";
//icons
import PlusIcon from '@mui/icons-material/Add';
import MinusIcon from '@mui/icons-material/Remove';
import SelectGiftField from "../RaffleSell/SelectGiftField";
import { postData, postFormData, ResponseError } from "../../tools/httpHelper";
import type { IStaffProfile } from "../RaffleSell/dto/IStaffProfile";

function Step1View() {
  const [{ giveOrder }, setFormState] = useAtom(giveSellAtom); //
  const [f_loading, setLoading] = useState<boolean>(false)
  const [errMsg, setErrMsg] = useState<string | null>(null)
  const giveUnitPrice = useAtomValue(giveUnitPriceAtom) // 抽獎券單價
  const [paddleNum, setPaddleNum] = useState<string>(''); // 控制:貴賓編碼
  const [vipName, setVipName] = useState<string>(''); // 控制:貴賓名稱
  const [giftId, setGiftId] = useState<string>(''); // 控制:福袋獎品ID
  const [purchaseCount, setPurchaseCount] = useState<string>('1'); // 控制:購買張數
  const [purchaseAmount, setPurchaseAmount] = useState<number>(giveUnitPrice); // 控制:購買金額

  const handleSubmit = useEventCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setLoading(true);
      setErrMsg(null); // 先清除錯誤訊息

      if (!Boolean(paddleNum)) {
        setErrMsg('未選取貴賓！');
        return;
      }

      const formData = new FormData(event.currentTarget);
      const giveOrder = await postFormData<IGiveOrder>('/api/GiveSell/Create', formData);
      const sales = await postData<IStaffProfile>(`/api/RaffleSell/GetStaffProfile/${giveOrder.salesId}`);
      const prize = await postData<IGivePrize>(`/api/GiveSell/GetGivePrize/${giveOrder.giftId}`)

      console.info('handleSubmit success', { giveOrder, sales, prize });
      setFormState(prev => ({ ...prev, mode: 'Step2', giveOrder, sales, prize }))
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


  const handleSelect = useEventCallback((vip: IVipProfile | null) => {
    if (vip) {
      setPaddleNum(vip.paddleNum);
      setVipName(vip.vipName);
    } else {
      setPaddleNum('');
      setVipName('');
    }
  });

  const handlePurchaseCount = useEventCallback((event: ChangeEvent<HTMLInputElement>) => {
    const newCount = Number(event.target.value); // Number(event.target.value)
    setPurchaseCount(String(newCount))
  });

  const decreasePurchaseCount = useEventCallback(() => {
    setPurchaseCount(prev => Number(prev) <= 1 ? '1' : String(Number(prev) - 1));
  });

  const increasePurchaseCount = useEventCallback(() => {
    setPurchaseCount(prev => String(Number(prev) + 1));
  });

  // 若已填過單。可修改訂單內容。
  useEffect(() => {
    if (giveOrder) {
      setPaddleNum(giveOrder.paddleNum)
      setVipName(giveOrder.vipName)
      setGiftId(giveOrder.giftId)
      setPurchaseCount(String(giveOrder.purchaseCount))
      setPurchaseAmount(giveOrder.purchaseAmount)
    }
  }, [giveOrder])

  // 依「購買張數」計算「購買金額」
  useEffect(() => {
    const count = Number(purchaseCount);
    const total = giveUnitPrice * count;
    setPurchaseAmount(total)
  }, [purchaseCount])

  return (
    <Container maxWidth='xs' sx={{ outline: 'red dashed 1px' }}>
      {/* 銷售福袋抽獎券 */}
      <Typography variant='h5' gutterBottom>銷售福袋抽獎券</Typography>

      {!Boolean(giveOrder) &&
        <Toolbar variant='regular' disableGutters sx={{ mb: 2 }}>
          {/* 自貴賓清單查詢帶出 */}
          <SelectVipWidget onSelect={handleSelect} placeholder='Paddle No/Full name' />
        </Toolbar>}

      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          {Boolean(giveOrder) &&
            <TextField variant='filled' fullWidth
              label={'貴賓'} value={`${giveOrder?.paddleNum}.${giveOrder?.vipName}`}
              slotProps={{ input: { readOnly: true } }}
            />}

          <SelectGiftField name='giftId' label='福袋獎品' required
            value={giftId}
            onChange={setGiftId}
            readOnly={false}
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

          <input type='hidden' name='paddleNum' value={paddleNum} />
          <input type='hidden' name='vipName' value={vipName} />
          <input type='hidden' name='giveOrderNo' value={giveOrder?.giveOrderNo ?? 'NEW'} />

          {errMsg &&
            <Alert severity="error" onClose={() => setErrMsg(null)}>
              {errMsg}
            </Alert>}

          <Button type='submit' variant='contained' color='primary' loading={f_loading}>
            {Boolean(giveOrder) ? 'Submit Changes' : 'Create Order'}
          </Button>
        </Stack>
      </form>

      {/* 單張 100 元。*/}
      <Alert severity='info' sx={{ my: 2 }}>
        Each gift ticket NT${giveUnitPrice}.
      </Alert>
    </Container>
  );
}

export default Step1View;