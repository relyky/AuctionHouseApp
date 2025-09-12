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

export default function RaffleOrderSoldTableWidget(props: {
  orderList: IRaffleOrder[]
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
            <StyledTableCell>訂單編號</StyledTableCell>
            <StyledTableCell>負責業務</StyledTableCell>
            <StyledTableCell align="right">賣出張數</StyledTableCell>
            <StyledTableCell align="right">賣出金額</StyledTableCell>
            <StyledTableCell align="center">賣出時間</StyledTableCell>
            <StyledTableCell>已付款</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orderList.map((row) => (
            <StyledTableRow key={row.raffleOrderNo}>
              <StyledTableCell>{row.raffleOrderNo}</StyledTableCell>
              <StyledTableCell>{row.salesId}</StyledTableCell>
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