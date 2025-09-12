import { useEventCallback, Alert, Autocomplete, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { postData, ResponseError } from "../../../tools/httpHelper";
import type { ISalesCodeName } from "../dto/ISalesCodeName";

export default function SalesAutocomplete(props: {
  onChange: (option: ISalesCodeName | null) => void
}) {
  const [f_loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null)
  const [salesList, setSalesList] = useState<ISalesCodeName[]>([]);

  const handleGetSalesList = useEventCallback(() => {
    setLoading(true)
    setErrMsg(null)
    postData<ISalesCodeName[]>('/api/BackendRaffleCheck/GetSalesList')
      .then((data) => {
        setSalesList(data)
      }).catch(error => {
        if (error instanceof ResponseError) {
          console.error('handleGetSalesList ResponseError', error.message);
          setErrMsg(error.message)
        }
        else {
          console.error('handleGetSalesList error', { error });
          setErrMsg("出現預期之外的錯誤請通知系統工程師。" + error);
        }
      }).finally(() => {
        setLoading(true)
      })
  })

  useEffect(() => {
    handleGetSalesList()
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
      sx={{ mb: 2 }}
    />
  )
}
