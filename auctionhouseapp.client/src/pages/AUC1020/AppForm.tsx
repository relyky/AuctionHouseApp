import { useState } from "react";
import { Alert, Autocomplete, Button, Container, LinearProgress, TextField, Typography } from "@mui/material";
import { delayPromise } from "../../tools/utils";
import { useAccountHandler, useAccountState } from "../../atoms/accountAtom";
import Swal from "sweetalert2";

// 假資料
const bidderOptions:ILabelCode[] = [
  { label: '郝聰明', code: 'B710' },
  { label: '甄美麗', code: 'B720' },
  { label: '艾漂亮', code: 'B730' },
];

/**
 * 競標人註冊
 */
export default function AUC1020_AppForm() {
  const [value, setValue] = useState<ILabelCode | null>(null)
  const [f_loading, setLoading] = useState<boolean>(false)
  const accountState = useAccountState()
  const accSvc = useAccountHandler()

  return (
    <Container component="main" maxWidth='xs' sx={{ outline: 'dashed 1px red' }}>
      <Typography variant='h4'>AUC1020 競標人註冊</Typography>
      <Alert severity="warning" sx={{ my: 2 }} >
        先簡單假作註冊以可以測試競價。
      </Alert>

      <Autocomplete
        disablePortal
        options={bidderOptions}
        renderInput={(params) => <TextField {...params} label="BidderNo" />}
        value={value}
        onChange={(_,v)=> setValue(v)}
      />

      <Button onClick={handleRegister}>確認註冊</Button>
      <Button onClick={handleReset}>清除註冊</Button>

      {f_loading && <LinearProgress color='info' />}

      <pre>accountState:{JSON.stringify(accountState, null, '  ')}</pre>
    </Container>
  )

  async function handleRegister() {
    try {
      setLoading(true)

      const result = await accSvc.registerAsync(value?.code!);
      await delayPromise(800);

      if (result !== 'SUCCESS')
        Swal.fire('註冊失敗', result, 'error')
    }
    catch (err) {
      if (err instanceof Error)
        Swal.fire('出現錯誤', err.message, 'error')
      else
        throw err;
    }
    finally {
      setLoading(false)
    }
  }

  async function handleReset() {
    try {
      setLoading(true)
      accSvc.reset();
      await delayPromise(800); // 提昇UX
    }
    catch (err) {
      if (err instanceof Error)
        Swal.fire('出現錯誤', err.message, 'error')
      else
        throw err;
    }
    finally {
      setLoading(false)
    }
  }
}
