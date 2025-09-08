import { useState } from "react"
import { useAtom } from "jotai"
import { Alert, Button, Checkbox, Container, Divider, FormControlLabel, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableRow, Typography, useEventCallback } from "@mui/material"
import { postData, ResponseError } from "../../tools/httpHelper"
import { raffleSellAtom } from "./atom"

export default function RaffleSell_Step2View() {
  const [{ raffleOrder }, setFormState] = useAtom(raffleSellAtom);
  const [f_loading, setLoading] = useState<boolean>(false)
  const [errMsg, setErrMsg] = useState<string | null>(null)

  const [hasPaid, setHasPaid] = useState(false)
  const [isConfirm, setIsConfirm] = useState(false)

  const handleSubmit = useEventCallback(async () => {
    try {
      setLoading(true);
      setErrMsg(null); // 先清除錯誤訊息

      const hasPaidYN = hasPaid ? 'Y' : 'N';
      const data = await postData<IRaffleOrder>(`/api/RaffleSell/CommitRaffleOrder/${raffleOrder?.raffleOrderNo}/${hasPaidYN}`);
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

  if (!raffleOrder) {
    return <Alert severity='error' sx={{ m: 3, p: 3 }} >非預期狀態！</Alert>
  }

  return (
    <Container maxWidth='xs'>
      <Typography variant='h5' gutterBottom>抽獎券訂單</Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell component="th">
                訂單編號
              </TableCell>
              <TableCell>{raffleOrder.raffleOrderNo}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell component="th">
                買家名稱
              </TableCell>
              <TableCell>{raffleOrder.buyerName}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell component="th">
                買家電郵地址
              </TableCell>
              <TableCell>{raffleOrder.buyerEmail}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell component="th">
                買家聯絡電話
              </TableCell>
              <TableCell>{raffleOrder.buyerPhone}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell component="th">
                購買張數
              </TableCell>
              <TableCell>{raffleOrder.purchaseCount}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell component="th">
                購買金額
              </TableCell>
              <TableCell>{raffleOrder.purchaseAmount}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell component="th">
                業務ID
              </TableCell>
              <TableCell>{raffleOrder.salesId}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ my: 2 }} />

      <Stack spacing={2}>

        {errMsg &&
          <Alert severity="error" onClose={() => setErrMsg(null)}>
            {errMsg}
          </Alert>}

        <Stack direction='row'>
          <FormControlLabel label="已收款" sx={{ flexGrow: 1 }}
            control={<Checkbox
              checked={hasPaid}
              onChange={(_, chk) => setHasPaid(chk)} />}
          />

          <FormControlLabel label="再確認" sx={{ flexGrow: 1 }}
            control={<Checkbox
              checked={isConfirm}
              onChange={(_, chk) => setIsConfirm(chk)} />}
          />
        </Stack>

        <Button variant='contained' color='primary'
          loading={f_loading} disabled={!isConfirm}
          onClick={handleSubmit}
        >{hasPaid ? '下一步' : '將放棄' }</Button>
      </Stack>

      {/* for debug 
      <pre>data: {JSON.stringify(data, null, 2)}</pre>        
      */}
    </Container>
  )
}