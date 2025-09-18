import { Paper, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material'
import type { IBuyerProfile } from "../../RaffleSell/dto/IBuyerProfile";

export default function BuyerProfileTableWidget(props: {
  buyer: IBuyerProfile
}) {
  const { buyer } = props;

  return (
    <TableContainer component={Paper} sx={{ mb: 2 }}>
      <Table size='small'  >
        <TableBody>
          <TableRow>
            {/* 買家名稱 */}
            <TableCell component="th" scope="row">Buyer Name</TableCell>
            <TableCell>{buyer.buyerName}</TableCell>
          </TableRow>
          <TableRow>
            {/* 電郵地址 */}
            <TableCell component="th" scope="row">Email Address</TableCell>
            <TableCell>{buyer.buyerEmail}</TableCell>
          </TableRow>
          <TableRow>
            {/* 聯絡電話 */}
            <TableCell component="th" scope="row">Phone Number</TableCell>
            <TableCell>{buyer.buyerPhone}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}
