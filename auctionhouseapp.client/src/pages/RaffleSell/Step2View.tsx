import { useState } from "react"
import { useAtom } from "jotai"
import { Alert, Button, ButtonGroup, Checkbox, Container, Divider, FormControlLabel, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableRow, Typography, useEventCallback } from "@mui/material"
import { postData, ResponseError } from "../../tools/httpHelper"
import { raffleSellAtom } from "./atom"
import Swal from "sweetalert2"

export default function RaffleSell_Step2View() {
  const [{ raffleOrder, sales }, setFormState] = useAtom(raffleSellAtom);
  const [f_loading, setLoading] = useState<boolean>(false)
  const [errMsg, setErrMsg] = useState<string | null>(null)

  const [hasPaid, setHasPaid] = useState(false)

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

  const handleRevoke = useEventCallback(async () => {
    try {
      setLoading(true);
      setErrMsg(null); // 先清除錯誤訊息

      const data = await postData<IRaffleOrder>(`/api/RaffleSell/RevokeRaffleOrder/${raffleOrder?.raffleOrderNo}`);
      console.info('handleRevoke success', { data });
      setFormState(prev => ({ ...prev, mode: 'Finish', raffleOrder: data }))
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

  const handlePrevious = useEventCallback(() => {
    setFormState(prev => ({ ...prev, mode: 'Step1' }))
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
              {/* 訂單編號 */}
              <TableCell component="th">
                Order No.
              </TableCell>
              <TableCell>{raffleOrder.raffleOrderNo}</TableCell>
            </TableRow>
            <TableRow>
              {/* 買家名稱 */}
              <TableCell component="th">
                Buyer Name
              </TableCell>
              <TableCell>{raffleOrder.buyerName}</TableCell>
            </TableRow>
            <TableRow>
              {/* 電郵地址 */}
              <TableCell component="th">
                Email Address
              </TableCell>
              <TableCell>{raffleOrder.buyerEmail}</TableCell>
            </TableRow>
            <TableRow>
              {/* 聯絡電話 */}
              <TableCell component="th">
                Phone Number
              </TableCell>
              <TableCell>{raffleOrder.buyerPhone}</TableCell>
            </TableRow>
            <TableRow>
              {/* 購買張數 */}
              <TableCell component="th">
                Quantity
              </TableCell>
              <TableCell>{raffleOrder.purchaseCount}</TableCell>
            </TableRow>
            <TableRow>
              {/* 購買金額 */}
              <TableCell component="th">
                Total Amount
              </TableCell>
              <TableCell>{raffleOrder.purchaseAmount}</TableCell>
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

        <ButtonGroup variant='text'>
          {/* 上一步 */}
          <Button color='primary' sx={{ flexGrow: 1 }}
            loading={f_loading}
            onClick={handlePrevious}
          >Previous Step</Button>

          {/* 放棄訂單 */}
          <Button color='warning' sx={{ flexGrow: 1 }}
            loading={f_loading}
            onClick={() => {
              Swal.fire({
                title: "Are you sure?",
                text: "This action cannot be undone.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                confirmButtonText: "Yes, cancel it",
                cancelButtonColor: "#d33",
                cancelButtonText: "No, keep it"
              }).then((result) => {
                if (result.isConfirmed) {
                  handleRevoke()
                }
              });
            }}>
            Cancel Order
          </Button>
        </ButtonGroup>
      </Stack>

      {/* for debug 
      <pre>data: {JSON.stringify(data, null, 2)}</pre>        
      */}
    </Container>
  )
}