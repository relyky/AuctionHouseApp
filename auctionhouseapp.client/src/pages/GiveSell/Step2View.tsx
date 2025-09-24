import { Alert, Button, Checkbox, Container, Divider, FormControlLabel, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableRow, Typography, useEventCallback } from "@mui/material";
import { useAtom } from "jotai";
import { useState } from "react";
import { postData, ResponseError } from "../../tools/httpHelper";
import { giveSellAtom } from "./atom";

export default function GiveSell_Step2View() {
  const [{ giveOrder, sales, vip, prize }, setFormState] = useAtom(giveSellAtom);
  const [f_loading, setLoading] = useState<boolean>(false)
  const [errMsg, setErrMsg] = useState<string | null>(null)

  const [hasPaid, setHasPaid] = useState(false)

  const handleSubmit = useEventCallback(async () => {
    try {
      setLoading(true);
      setErrMsg(null); // 先清除錯誤訊息

      const hasPaidYN = hasPaid ? 'Y' : 'N';
      const data = await postData<IGiveOrder>(`/api/GiveSell/CommitGiveOrder/${giveOrder?.giveOrderNo}/${hasPaidYN}`);
      console.info('handleSubmit success', { data });

      if (data.status === 'HasSold') {
        setFormState(prev => ({ ...prev, mode: 'Step3', raffleOrder: data }))
      } else {
        setFormState(prev => ({ ...prev, mode: 'Finish', raffleOrder: data }))
      }
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

  if (!giveOrder) {
    return <Alert severity='error' sx={{ m: 3, p: 3 }} >非預期狀態！</Alert>
  }

  return (
    <Container maxWidth='xs'>
      {/* 抽獎券訂單 */}
      <Typography variant='h5' gutterBottom>Give Tickets Order</Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableBody>
            <TableRow>
              {/* 訂單編號 */}
              <TableCell component="th">
                Order No.
              </TableCell>
              <TableCell>{giveOrder.giveOrderNo}</TableCell>
            </TableRow>
            <TableRow>
              {/* paddleNum */}
              <TableCell component="th">
                Paddle No.
              </TableCell>
              <TableCell>{giveOrder.paddleNum}</TableCell>
            </TableRow>
            <TableRow>
              {/* VipName */}
              <TableCell component="th">
                VIP Name
              </TableCell>
              <TableCell>{vip?.vipName}</TableCell>
            </TableRow>
            <TableRow>
              {/* 聯絡電話 */}
              <TableCell component="th">
                Give Prize
              </TableCell>
              <TableCell>{giveOrder.giftId}<br />{prize?.name}</TableCell>
            </TableRow>
            <TableRow>
              {/* 購買張數 */}
              <TableCell component="th">
                Quantity
              </TableCell>
              <TableCell>{giveOrder.purchaseCount}</TableCell>
            </TableRow>
            <TableRow>
              {/* 購買金額 */}
              <TableCell component="th">
                Total Amount
              </TableCell>
              <TableCell>{giveOrder.purchaseAmount}</TableCell>
            </TableRow>
            <TableRow>
              {/* 業務人員 */}
              <TableCell component="th">
                Sales
              </TableCell>
              <TableCell>{sales?.nickname}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ my: 2 }} />

      <Stack spacing={2} sx={{ mb: 2 }}>

        {errMsg &&
          <Alert severity="error" onClose={() => setErrMsg(null)}>
            {errMsg}
          </Alert>}

        <Stack direction='row'>
          {/* 已收款才勾選 */}
          <FormControlLabel label="Check only after payment received" sx={{ flexGrow: 1 }}
            control={<Checkbox
              checked={hasPaid}
              onChange={(_, chk) => setHasPaid(chk)} />}
          />

        </Stack>

        {/* 確認購買 */}
        <Button variant={'contained'}
          color='primary'
          loading={f_loading} disabled={!hasPaid}
          onClick={handleSubmit}
        >Payment received </Button>

      </Stack>

      <pre>prize: {JSON.stringify(prize)}</pre>
      <pre>sales: {JSON.stringify(sales)}</pre>
      <pre>giveOrder: {JSON.stringify(giveOrder)}</pre>
    </Container>
  )
}