import { styled } from '@mui/material/styles';
import { Alert, Paper, Table, TableBody, TableCell, tableCellClasses, TableContainer, TableHead, TableRow } from '@mui/material'
import { formatDateString, formatDateYmd } from '../../../tools/utils'
import { useMemo } from 'react';

interface IOrderSummary {
  maxDate: string, // '1900-01-01',
  minDate: string, // '2100-12-31',
  ticketCount: number,
  ticketAmount: number,
}

export default function RaffleOrderSoldSummaryWidget(props: {
  orderList: IRaffleOrder[]
}) {
  const { orderList } = props

  const summary = useMemo(() => {
    if (!orderList || orderList.length === 0)
      return {};

    // 取出日期區間
    const summary = orderList.reduce<IOrderSummary>((prev, item) => {
      const curDate = formatDateYmd(item.soldDtm)
      return {
        maxDate: curDate > prev.maxDate ? curDate : prev.maxDate,
        minDate: curDate < prev.minDate ? curDate : prev.minDate,
        ticketCount: prev.ticketCount + item.purchaseCount,
        ticketAmount: prev.ticketAmount + item.purchaseAmount,
      }
    }, {
      maxDate: '1900-01-01',
      minDate: '2100-12-31',
      ticketCount: 0,
      ticketAmount: 0,
    });

    return {
      salesId: orderList[0].salesId,
      soldDtBgn: summary.minDate,
      soldDtEnd: summary.maxDate,
      orderCount: orderList.length,
      ticketCount: summary.ticketCount,
      ticketAmount: summary.ticketAmount,
    }
  }, [orderList])

  if (!orderList || orderList.length === 0) {
    return <Alert severity="info">
      無訂單資料。
    </Alert>
  }

  // sx={{ minWidth: 700 }}
  return (
    <TableContainer component={Paper}>
      <Table size='small'>
        <TableBody>
          <TableRow>
            <TableCell component='th'>負責業務</TableCell>
            <TableCell colSpan={3}>{summary.salesId}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell component='th'>售出日期</TableCell>
            <TableCell colSpan={3}>{summary.soldDtBgn} ~ {summary.soldDtEnd}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell component='th'>賣出張數</TableCell>
            <TableCell>{summary.ticketCount}</TableCell>
            <TableCell component='th'>訂單筆數</TableCell>
            <TableCell>{summary.orderCount}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell component='th'>賣出金額</TableCell>
            <TableCell>{summary.ticketAmount}</TableCell>
            <TableCell></TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}