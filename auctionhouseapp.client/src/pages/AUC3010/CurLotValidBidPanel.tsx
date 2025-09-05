import { useEffect } from "react";
import { Alert, LinearProgress, List, ListItem, ListItemButton, ListItemText, Paper, Skeleton, Typography } from "@mui/material";
import useAxios from "axios-hooks";
// icons
import CheckIcon from '@mui/icons-material/Star';
import BlankIcon from '@mui/icons-material/StarBorder';

export default function CurLotValidBidPanel(props: {
  liveSt?: ILiveAuctionStatus
}) {
  const { liveSt } = props;

  if (!liveSt || !liveSt.curLotNo || liveSt.curLotNo === '') {
    return (
      <Paper sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 2 }}>
        <Skeleton variant="rounded" width={210} height={60} />
        <Skeleton variant="rounded" width={210} height={60} />
      </Paper>
    );
  }

  return (
    <CurLotValidBidWidget
      lotNo={liveSt.curLotNo}
      lastUpdDtm={liveSt.lastBiddingEventUpdDtm} />
  )
}

//-----------------------------------------------------------------------------
/**
 * 現在拍品有效出價
 */
 function CurLotValidBidWidget(props: {
  lotNo: string,
  lastUpdDtm?: string, // 上次變動時間。只是用來通知該刷新資料了
}) {
  const [{ data: bidList, loading, error }, refetch] = useAxios<IBiddingEvent[]>({
    url: `/api/Broadcast/QryLotValidBiddingList/${props.lotNo}`,
    method: 'POST',
  });

  useEffect(() => {
    refetch()
  }, [props.lastUpdDtm])

  if (!bidList) {
    return <Alert sx={{ mx: 3, my: 6 }}>
      無資料。
    </Alert>
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant='subtitle1'>拍品有效出價</Typography>
      {/*<Typography variant='subtitle2' color='text.secondary'>lastUpdDtm: {props?.lastUpdDtm}</Typography>*/}

      {loading && <LinearProgress color='info' />}
      {error && <Alert severity='error'>{`${error.message}`}</Alert> }

      <List dense>
        {bidList.map((bid) => (
          <ListItem key={bid.biddingSn} disablePadding secondaryAction={bid.isValid == 'Y' ? <CheckIcon color='primary' /> : <BlankIcon />} >
            <ListItemButton>
              <ListItemText
                primary={`${bid.bidderNo} 出價 ${bid.bidPrice} 元`}
                secondary={`${bid.bidTimestamp} : ${bid.bidOpenSn}-${bid.biddingSn}`}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  )
}
