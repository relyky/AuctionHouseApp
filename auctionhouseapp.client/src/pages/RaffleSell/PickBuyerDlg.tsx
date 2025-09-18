import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress, Table, TableBody, TableCell, TableHead, TableRow, Typography, useEventCallback } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { postData, ResponseError } from '../../tools/httpHelper';
import { delayPromise } from '../../tools/utils';
import SearchWidget from '../../widgets/SearchWidget';
import type { IBuyerProfile } from './dto/IBuyerProfile';

/**
 * 查詢已有買過的客戶。(老客戶)
 */
export default function PickBuyerDlg(props: {
  label: string;
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
      // validation
      if (!value) return;
      value = value.trim();

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

  const handlePickItem = useEventCallback((item: IBuyerProfile) => {
    props.onPick(item)
    setOpen(false)
  })

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
      <Button onClick={handleOpen}>{props.label}</Button>
      <Dialog
        open={open}
        onClose={handleClose}
      >
        <DialogTitle>
          {/* 買家名稱/聯絡電話/電郵信箱 */}
          <SearchWidget
            placeholder="Buyer Name/Email/Phone Number"
            onSearch={handleSearch}
          />
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {f_loading && <LinearProgress color='info' />}

          {errMsg && <Alert severity='error'>{errMsg}</Alert>}

          {/* <TableContainer> */}
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {/* 客戶名稱 */}
                <TableCell sx={{ whiteSpace: 'nowrap', textWrap: 'nowrap' }}>Buyer Name</TableCell>
                {/* 電郵地址 */}
                <TableCell sx={{ whiteSpace: 'nowrap', textWrap: 'nowrap' }}>Email Address</TableCell>
                {/* 聯絡電話 */}
                <TableCell sx={{ whiteSpace: 'nowrap', textWrap: 'nowrap' }}>Phone Number</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(buyerList) && buyerList.map((item, index) => (
                <TableRow key={index} hover sx={{ cursor: 'pointer' }}
                  onClick={_ => handlePickItem(item)}>
                  <TableCell>{item.buyerName}</TableCell>
                  <TableCell>{item.buyerEmail}</TableCell>
                  <TableCell>{item.buyerPhone}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* </TableContainer> */}

          {/* <pre>{JSON.stringify(buyerList, null, 1)}</pre> */}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }} >
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

//-----------------
const helpContent = (
  <Typography sx={{ mb: 1 }}>查詢過去有買過的客戶。</Typography>
);