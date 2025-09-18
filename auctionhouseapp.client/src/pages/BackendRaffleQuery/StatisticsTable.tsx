import { Paper, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material'
import type { ICalcRaffleOrderStatisticsResult } from './dto/ICalcRaffleOrderStatisticsResult';

/**
 * 抽獎券統計呈現
 */
export default function StatisticsTable(props: {
  result: ICalcRaffleOrderStatisticsResult
}) {

  const { result } = props;

  return (
    <TableContainer component={Paper} sx={{ mb: 2 }}>
      <Table size='medium'>
        <TableBody>
          <TableRow>
            {/* 售出總張數 */}
            <TableCell>Total Tickets Sold:</TableCell>
            <TableCell align='right'>{result.soldTicketCount}</TableCell>
          </TableRow>
          <TableRow>
            {/* 售出訂單數 */}
            <TableCell>Number of Orders:</TableCell>
            <TableCell align='right'>{result.soldOrderCount}</TableCell>
          </TableRow>
          <TableRow>
            {/* 售出總金額 */}
            <TableCell>Total Sales Amount:</TableCell>
            <TableCell align='right'>{result.totalSoldAmount}</TableCell>
          </TableRow>
          <TableRow>
            {/* 已查驗訂單 */}
            <TableCell>Verified Orders:</TableCell>
            <TableCell align='right'>{result.checkedOrderCount}</TableCell>
          </TableRow>
          <TableRow>
            {/* 已查驗金額 */}
            <TableCell>Verified Amount:</TableCell>
            <TableCell align='right'>{result.checkedSoldAmount}</TableCell>
          </TableRow>
          <TableRow>
            {/* 購買人數 */}
            <TableCell>Number of Buyers:</TableCell>
            <TableCell align='right'>{result.buyerCount}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}