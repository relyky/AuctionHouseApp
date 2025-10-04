import { Button, Container, OutlinedInput, Paper, styled, Table, TableBody, TableCell, tableCellClasses, TableContainer, TableHead, TableRow, Toolbar, Typography, useEventCallback } from "@mui/material";
import { useAtom } from "jotai";
import { useState } from "react";
import { adminVipAtom } from "./atom";
import useFormHand from "./useFormHand";

export default function ListView() {
  const [{ dataList, mode }, setFormState] = useAtom(adminVipAtom)
  const handler = useFormHand()
  const [keyword, setKeyword] = useState('')

  const handleSearch = useEventCallback(() => {
    handler.qryDataList(keyword)
  });

  //# go render
  if (mode !== 'List') return; // d-none
  return (
    <Container maxWidth='xl'>
      <Typography variant='h5'>貴賓聯絡資料</Typography>

      <Toolbar sx={{ gap: 1 }}>
        <OutlinedInput placeholder='Paddle No./ Name'
          value={keyword} onChange={e => setKeyword(e.target.value)}
          size='small' autoFocus />
        <Button onClick={handleSearch}>查詢</Button>
        <Button onClick={handleAdd}>新增</Button>
      </Toolbar>

      {dataList && <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeadCell></TableHeadCell>
              <TableHeadCell>Paddle No.</TableHeadCell>
              <TableHeadCell>Name</TableHeadCell>
              <TableHeadCell>Email</TableHeadCell>
              <TableHeadCell>Phone</TableHeadCell>
              <TableHeadCell>Table No.</TableHeadCell>
              <TableHeadCell>Site No.</TableHeadCell>
              <TableHeadCell>Enterprise</TableHeadCell>
              <TableHeadCell>Receipt Header</TableHeadCell>
              <TableHeadCell>Tax No.</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dataList.map((item) => (
              <TableRow key={item.paddleNum}>
                <TableCell>
                  <Button size='small' onClick={() => handleEdit(item)}>編輯</Button>
                </TableCell>
                <TableCell>{item.paddleNum}</TableCell>
                <TableCell>{item.vipName}</TableCell>
                <TableCell>{item.vipEmail}</TableCell>
                <TableCell>{item.vipPhone}</TableCell>
                <TableCell>{item.tableNumber}</TableCell>
                <TableCell>{item.seatNumber}</TableCell>
                <TableCell>{item.isEnterprise}</TableCell>
                <TableCell>{item.receiptHeader}</TableCell>
                <TableCell>{item.taxNum}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>}

      {/* 
      <pre>dataList {JSON.stringify(dataList, null, 2)}</pre>        
      */}
    </Container>
  )

  function handleAdd() {
    setFormState(prev => ({ ...prev, mode: 'Add' }))
  }

  function handleEdit(item: IVip) {
    setFormState(prev => ({ ...prev, mode: 'Edit', dataAim: item }))
  }
}

//-----------------------------------------------------------------------------

const TableHeadCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  //[`&.${tableCellClasses.body}`]: {
  //  fontSize: 34,
  //},
}));