import { Paper, styled, Table, TableBody, TableCell, tableCellClasses, TableContainer, TableHead, TableRow, Typography } from "@mui/material";

const printHiddenCSS = {
  '@media print': {
    display: 'none',
  },
};

/**
 * 只顯示結果
 */
export default function GiftInventoryLister(props: {
  giftList: IGiftInventoryResult[]
}) {
  const { giftList } = props

  return (
    <TableContainer>
      <Typography variant="h6" sx={{ px: 2, py: 1 }}>
        <span style={{ fontWeight: 'normal' }}>Prize Group:</span> Raffle
      </Typography>
      <Table sx={{ mb: 1 }} component={Paper}>
        <TableHead>
          <TableRow>
            <HeadCell align='center'>Prize ID</HeadCell>
            <HeadCell>Prize Name</HeadCell>
            <HeadCell>Winner ID</HeadCell>
            <HeadCell>Winner Name</HeadCell>
            <HeadCell>Ticket No.</HeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.isArray(giftList) && giftList.filter(c => c.prizeGroup === 'Raffle').map((item) => (
            <TableRow key={item.prizeId}>
              <DataCell align='center'>{item.prizeId}</DataCell>
              <DataCell>{item.prizeName}</DataCell>
              <DataCell sx={{whiteSpace:'break-spaces'}}>{item.winnerId}</DataCell>
              <DataCell>{item.winnerName}</DataCell>
              <DataCell>{item.ticketNo}</DataCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Typography variant="h6" sx={{ px: 2, py: 1 }}>
        <span style={{ fontWeight: 'normal' }}>Prize Group:</span> GiveToWin
      </Typography>
      <Table sx={{ mb: 1 }} component={Paper}>
        <TableHead>
          <TableRow>
            <HeadCell align='center'>Prize ID</HeadCell>
            <HeadCell>Prize Name</HeadCell>
            <HeadCell>Winner ID</HeadCell>
            <HeadCell>Winner Name</HeadCell>
            <HeadCell>Ticket No.</HeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.isArray(giftList) && giftList.filter(c => c.prizeGroup === 'GiveToWin').map((item) => (
            <TableRow key={item.prizeId}>
              <DataCell align='center'>{item.prizeId}</DataCell>
              <DataCell>{item.prizeName}</DataCell>
              <DataCell>{item.winnerId}</DataCell>
              <DataCell>{item.winnerName}</DataCell>
              <DataCell>{item.ticketNo}</DataCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Typography variant="h6" sx={{ px: 2, py: 1 }}>
        <span style={{ fontWeight: 'normal' }}>Prize Group:</span> LiveAuction
      </Typography>
      <Table sx={{ mb: 1 }} component={Paper}>
        <TableHead>
          <TableRow>
            <HeadCell align='center'>Prize ID</HeadCell>
            <HeadCell>Prize Name</HeadCell>
            <HeadCell>Winner ID</HeadCell>
            <HeadCell>Winner Name</HeadCell>
            <HeadCell>Has Paid</HeadCell>
            {/* <HeadCell sx={printHiddenCSS}>Paid Time</HeadCell> */}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.isArray(giftList) && giftList.filter(c => c.prizeGroup === 'LiveAuction').map((item) => (
            <TableRow key={item.prizeId}>
              <DataCell align='center'>{item.prizeId}</DataCell>
              <DataCell>{item.prizeName}</DataCell>
              <DataCell>{item.winnerId}</DataCell>
              <DataCell>{item.winnerName}</DataCell>
              <DataCell>{item.paymentStatus}</DataCell>
              {/* <DataCell sx={printHiddenCSS}>{item.paymentDtm}</DataCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Typography variant="h6" sx={{ px: 2, py: 1 }}>
        <span style={{ fontWeight: 'normal' }}>Prize Group:</span> SilentAuction
      </Typography>
      <Table sx={{ mb: 1 }} component={Paper}>
        <TableHead>
          <TableRow>
            <HeadCell align='center'>Prize ID</HeadCell>
            <HeadCell>Prize Name</HeadCell>
            <HeadCell>Winner ID</HeadCell>
            <HeadCell>Winner Name</HeadCell>
            <HeadCell>Has Paid</HeadCell>
            {/* <HeadCell sx={printHiddenCSS}>Paid Time</HeadCell> */}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.isArray(giftList) && giftList.filter(c => c.prizeGroup === 'SilentAuction').map((item) => (
            <TableRow key={item.prizeId}>
              <DataCell align='center'>{item.prizeId}</DataCell>
              <DataCell>{item.prizeName}</DataCell>
              <DataCell>{item.winnerId}</DataCell>
              <DataCell>{item.winnerName}</DataCell>
              <DataCell>{item.paymentStatus}</DataCell>
              {/* <DataCell sx={printHiddenCSS}>{item.paymentDtm}</DataCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

//-----------------------------------------------------------------------------
/**
 * <th>: The Table Header element
 * ref→(https://mui.com/material-ui/react-table/#customization)
 */
const HeadCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    whiteSpace: 'nowrap',
  },
}));

//-----------------------------------------------------------------------------
/**
 * <td>: The Table Data Cell element
 * ref→(https://mui.com/material-ui/react-table/#customization)
 */
const DataCell = styled(TableCell)(({ theme: _ }) => ({
  [`&.${tableCellClasses.body}`]: {
    wordBreak: 'break-all',
  },
}));