import { useState, useRef, useEffect } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, LinearProgress, Typography, useEventCallback } from '@mui/material'
import type { DialogProps } from '@mui/material';
import type { IBuyerProfile } from './dto/IBuyerProfile';
import SearchWidget from '../../widgets/SearchWidget';
import { postData, ResponseError } from '../../tools/httpHelper';
import { delayPromise } from '../../tools/utils';

export default function PickBuyerDlg(props: {
  onPick: (buyer: IBuyerProfile) => void
}) {
  const [open, setOpen] = useState(false);
  const [f_loading, setLoading] = useState<boolean>(false)
  const [errMsg, setErrMsg] = useState<string | null>(null)
  const [buyerList, setBuyerList] = useState<IBuyerProfile[]>([]);

  const handleOpen = () => {
    setOpen(true);
  }

  const handleClose = () => {
    setOpen(false);
  }

  const descriptionElementRef = useRef<HTMLElement>(null);

  const handleSearch = useEventCallback(async (value: string) => {
    try {
      // reset previous results
      setLoading(true)
      setErrMsg(null)
      setBuyerList([])

      // GO
      const buyerList = await postData<IBuyerProfile[]>(`/api/RaffleSell/SearchBuyerProfile?keyword=${value}`);
      await delayPromise(800)
      setBuyerList(buyerList);
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

  useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [open]);

  return (
    <>
      <Button onClick={handleOpen}>老客戶</Button>
      <Dialog
        open={open}
        onClose={handleClose}
        scroll='paper'
      >
        <DialogTitle>
          <SearchWidget
            placeholder="買家名稱/聯絡電話/電郵信箱"
            helpText={helpContent}
            onSearch={handleSearch}
          />
        </DialogTitle>
        <DialogContent dividers>
          {f_loading && <LinearProgress color='info' />}

          {errMsg && <Alert severity='error'>{errMsg}</Alert>}

          <pre>{JSON.stringify(buyerList, null, 1)}</pre>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }} >
          <Button onClick={handleClose}>取消</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

//-----------------
const helpContent = (
  <Typography sx={{ mb: 1 }}>查詢過去有買過的客戶。</Typography>
);