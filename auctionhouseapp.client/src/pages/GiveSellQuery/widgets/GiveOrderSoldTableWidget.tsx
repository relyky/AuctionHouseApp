import { styled } from '@mui/material/styles';
import { Alert, Paper, Table, TableBody, TableCell, tableCellClasses, TableContainer, TableHead, TableRow } from '@mui/material'
import { formatDateString } from '../../../tools/utils'

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

export default function GiveOrderSoldTableWidget(props: {
  orderList: IGiveOrder[]
}) {
  const { orderList } = props

  if (!orderList || orderList.length === 0) {
    return <Alert severity="info">
      無訂單資料。
    </Alert>
  }

  // sx={{ minWidth: 700 }}
  return (
    <TableContainer component={Paper}>
      <Table size='small'>
        <TableHead>
          <TableRow>
            {/* 訂單編號 */}
            <StyledTableCell>Order No.</StyledTableCell>
            {/* 負責業務 
            <StyledTableCell>Sales Staff</StyledTableCell> */}
            {/* 貴賓名稱 */}
            <StyledTableCell>VIP Name</StyledTableCell>
            {/* 福袋標的 */}
            <StyledTableCell>Gift No.</StyledTableCell>
            {/* 賣出張數 */}
            <StyledTableCell align="right">Tickets Sold</StyledTableCell>
            {/* 賣出金額 */}
            <StyledTableCell align="right">Amount</StyledTableCell>
            {/* 賣出時間 */}
            <StyledTableCell align="center">Sales Time</StyledTableCell>
            {/* 已付款 */}
            <StyledTableCell>Paid</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orderList.map((row) => (
            <StyledTableRow key={row.giveOrderNo}>
              <StyledTableCell>{row.giveOrderNo}</StyledTableCell>
              {/* <StyledTableCell>{row.salesId}</StyledTableCell> */}
              <StyledTableCell>{row.vipName}</StyledTableCell>
              <StyledTableCell>{row.giftId}</StyledTableCell>
              <StyledTableCell align="right">{row.purchaseCount}</StyledTableCell>
              <StyledTableCell align="right">{row.purchaseAmount}</StyledTableCell>
              <StyledTableCell align="center">{formatDateString(row.soldDtm)}</StyledTableCell>
              <StyledTableCell>{row.hasPaid}</StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}