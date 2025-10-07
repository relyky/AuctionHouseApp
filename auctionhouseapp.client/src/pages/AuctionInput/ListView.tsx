import { Box, Button, Chip, Container, Paper, styled, Table, TableBody, TableCell, tableCellClasses, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { auctionInputAtom } from "./atom";
import useFormHand from "./useFormHand";
import type { ILiveAuctionItem } from "../../dto/liveAuction/ILiveAuctionItem";

export default function ListView() {
  const [{ itemList, mode }, setFormState] = useAtom(auctionInputAtom)
  const handler = useFormHand()

  useEffect(() => {
    handler.loadItemList()
  }, [])

  // 只在 List 模式顯示
  if (mode !== 'List') return null;

  return (
    <Container maxWidth='xl'>
      <Typography variant='h5' gutterBottom>Live Auction 現場拍賣管理</Typography>

      <Box sx={{ mb: 2 }}>
        <Button variant="contained" onClick={() => handler.loadItemList()}>
          重新整理
        </Button>
      </Box>

      {itemList && itemList.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>操作</TableHeadCell>
                <TableHeadCell>商品編號</TableHeadCell>
                <TableHeadCell>商品名稱</TableHeadCell>
                <TableHeadCell>起標價</TableHeadCell>
                <TableHeadCell>底價</TableHeadCell>
                <TableHeadCell>狀態</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {itemList.map((item) => (
                <TableRow key={item.itemId}>
                  <TableCell>
                    {item.status === 'active' && (
                      <Button
                        size='small'
                        variant="contained"
                        color="primary"
                        onClick={() => handleRecordBid(item)}
                      >
                        記錄競標
                      </Button>
                    )}
                    {item.status === 'ended' && (
                      <Chip label="已結束" color="default" size="small" />
                    )}
                  </TableCell>
                  <TableCell>{item.itemId}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>${item.startingPrice.toLocaleString()}</TableCell>
                  <TableCell>${item.reservePrice.toLocaleString()}</TableCell>
                  <TableCell>
                    {item.status === 'active' ? (
                      <Chip label="進行中" color="primary" size="small" />
                    ) : (
                      <Chip label="已結束" color="default" size="small" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {itemList && itemList.length === 0 && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">目前無拍賣商品</Typography>
        </Paper>
      )}
    </Container>
  )

  function handleRecordBid(item: ILiveAuctionItem) {
    setFormState(prev => ({
      ...prev,
      mode: 'RecordBid',
      selectedItem: item
    }))
    // 載入商品即時狀態
    handler.loadItemStatus(item.itemId)
  }
}

const TableHeadCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
}));
