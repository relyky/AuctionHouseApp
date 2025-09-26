import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, InputAdornment, LinearProgress, OutlinedInput, Table, TableBody, TableCell, TableHead, TableRow, useEventCallback } from '@mui/material';
import { useAtomValue } from 'jotai';
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import type { IVipProfile } from '../../dto/IVipProfile';
import { postData } from '../../tools/httpHelper';
import { vipProfileListAtom } from './atom';
// icons
import FilterIcon from '@mui/icons-material/FilterAltOutlined';

/**
 * 自貴賓清單查詢帶出。(老客戶)
 */
export default function PickBuyerDlg(props: {
  label: string;
  onPick: (buyer: IVip) => void
}) {
  //const [profileList, setProfileList] = useState<IVipProfile[]>([])
  const profileList = useAtomValue(vipProfileListAtom)
  const [open, setOpen] = useState(false);
  const [f_loading, setLoading] = useState<boolean>(false)
  const [errMsg, setErrMsg] = useState<string | null>(null)
  const [filterWord, setFilterWord] = useState<string>('')
  const deferredFilterWord = useDeferredValue<string>(filterWord)

  const handleOpen = () => {
    setOpen(true);
  }

  const handleClose = () => {
    setOpen(false);
  }

  const descriptionElementRef = useRef<HTMLElement>(null);

  const handlePickItem = useEventCallback((item: IVipProfile) => {
    console.log('handlePickItem', item)
    if (item) {
      // 有選值, 送回完整 VIP 資料
      setLoading(true)
      postData<IVip>(`/api/GiveSell/GetVip/${item.paddleNum}`)
        .then(vip => {
          props.onPick(vip)
          setOpen(false)
        })
        .catch(console.log)
        .finally(() => setLoading(false))
    } else {
      // 選空值
      //props.onPick(null)
      setOpen(false)
    }
  })

  const profileFilterList = useMemo(() => {
    return profileList.filter((item) => (
      item.paddleNum.includes(deferredFilterWord) ||
      item.vipName.toLowerCase().includes(deferredFilterWord)))
  }, [profileList, deferredFilterWord])

  useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [open]);

  //useEffect(() => {
  //  // 取得 VIP Profile 清冊
  //  setLoading(true)
  //  postData<IVipProfile[]>('/api/GiveSell/ListVipProfile')
  //    .then(setProfileList)
  //    .catch(console.log)
  //    .finally(() => setLoading(false))
  //}, [])

  return (
    <>
      <Button sx={{ flexGrow: 1 }} onClick={handleOpen}>{props.label}</Button>
      <Dialog
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: {
              position: 'absolute',
              top: '20%',
              left: '50%',
              transform: 'translate(-50%, -20%)',
              m: 0,
            },
          },
        }}
      >
        <DialogTitle>
          {/* Paddle No./Name */}
          <OutlinedInput fullWidth
            placeholder='Paddle No./Name'
            startAdornment={<InputAdornment position="start"><FilterIcon color='secondary' /></InputAdornment>}
            inputProps={{ 'aria-label': 'filter' }}
            onChange={e => setFilterWord(e.target.value.trim().toLowerCase())}
          />
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {f_loading && <LinearProgress color='info' />}

          {errMsg && <Alert severity='error'>{errMsg}</Alert>}

          {/* <TableContainer> */}
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {/* Paddle Number */}
                <TableCell>Paddle No.</TableCell>
                {/* 貴賓名稱 */}
                <TableCell sx={{ whiteSpace: 'nowrap', textWrap: 'nowrap' }}>VIP Name</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {profileFilterList.map((item, index) => (
                <TableRow key={index} hover sx={{ cursor: 'pointer' }}
                  onClick={_ => handlePickItem(item)}>
                  <TableCell sx={{ textAlign: 'center' }} >{item.paddleNum}</TableCell>
                  <TableCell>{item.vipName}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* </TableContainer> */}

          {/* <pre>{JSON.stringify(profileList, null, 1)}</pre> */}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }} >
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
