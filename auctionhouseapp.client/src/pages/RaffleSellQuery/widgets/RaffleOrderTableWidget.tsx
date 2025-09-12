import { Paper, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material'
import { formatDateString } from '../../../tools/utils'

/**
 * A component to display the details of a raffle order in a table.
 * @param props The props for the component.
 * @returns A TableContainer component.
 */
export default function RaffleOrderTableWidget(props: {
  order: IRaffleOrder
}) {

  const { order } = props;

  return (
    <TableContainer component={Paper} sx={{ mb: 2 }}>
      <Table size='small'>
        <TableBody>
          <TableRow>
            <TableCell >訂單編號</TableCell>
            <TableCell colSpan={3}>{order.raffleOrderNo}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell >買家名稱</TableCell>
            <TableCell colSpan={3}>{order.buyerName}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell >聯絡電話</TableCell>
            <TableCell>{order.buyerPhone}</TableCell>
            <TableCell >電郵地址</TableCell>
            <TableCell>{order.buyerEmail}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell >購買張數</TableCell>
            <TableCell>{order.purchaseCount}</TableCell>
            <TableCell >購買金額</TableCell>
            <TableCell>{order.purchaseAmount}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell >是否已付款</TableCell>
            <TableCell>{order.hasPaid === 'Y' ? '是' : '否'}</TableCell>
            <TableCell >訂單狀態</TableCell>
            <TableCell>{order.status}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell >負責業務</TableCell>
            <TableCell>{order.salesId}</TableCell>
            <TableCell >賣出時間</TableCell>
            <TableCell>
              {formatDateString(order.soldDtm)}<br/>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}