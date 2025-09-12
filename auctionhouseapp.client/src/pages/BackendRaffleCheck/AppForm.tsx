import { useEffect, useState, type FC } from "react";
import { Alert, Autocomplete, Box, Container, TextField, Typography } from "@mui/material";
import type { ISalesCodeName } from "./dto/ISalesCodeName";
import { postData, ResponseError } from "../../tools/httpHelper";

/**
 * 抽獎券銷售收費查驗 
 * 業務把收到的錢交給經理後，經理打勾確認。
 */
export default function StaffLogin_AppForm() {
  const [sales, setSales] = useState<ISalesCodeName | null>(null)

  return (
    <Container maxWidth='sm' sx={{ outline: 'dashed red 2px' }}>
      <Typography variant='h3' gutterBottom>抽獎券收費檢查</Typography>
      <Box>業務把收到的錢交給經理後，經理打勾確認。</Box>

      <SalesAutocomplete onChange={setSales} />



      <Box>施工中</Box>

      {import.meta.env.DEV && <pre>
        sales: {JSON.stringify(sales, null, 2)}
      </pre>}
    </Container>
  )
}

//--------------------
const SalesAutocomplete: FC<{
  onChange: (option: ISalesCodeName | null) => void
}> = (props) => {
  const [f_loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null)
  const [salesList, setSalesList] = useState<ISalesCodeName[]>([]);

  useEffect(() => {
    setLoading(true)
    setErrMsg(null)
    postData<ISalesCodeName[]>('/api/BackendRaffleCheck/GetSalesList')
      .then((data) => {
        setSalesList(data)
      }).catch(error => {
        if (error instanceof ResponseError) {
          console.error('handleSubmit ResponseError', error.message);
          setErrMsg(error.message)
        }
        else {
          console.error('handleSubmit error', { error });
          setErrMsg("出現預期之外的錯誤請通知系統工程師。" + error);
        }
      }).finally(() => {
        setLoading(true)
      })
  }, []);

  if (errMsg) {
    return <Alert severity='error' sx={{ m: 3 }} >{errMsg}</Alert>
  }

  // sx={{ width: 300 }}
  return (
    <Autocomplete<ISalesCodeName>
      loading={f_loading}
      disablePortal
      options={salesList}
      onChange={(_, v) => props.onChange(v)}
      getOptionLabel={(option) => `${option.salesId}.${option.salesName}`}
      renderInput={(params) => <TextField {...params} label="Sales" />}
    />
  )
}