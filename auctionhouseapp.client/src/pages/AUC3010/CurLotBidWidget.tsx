import { Alert, List, ListItem, ListItemButton, ListItemText, Paper, Typography } from "@mui/material";
import useAxios from "axios-hooks";
// icons
import CheckIcon from '@mui/icons-material/Star';
import BlankIcon from '@mui/icons-material/StarBorder';
import { useEffect } from "react";

export default function CurLotValidBidWidget(props: {
  lotNo: string,
  lastUpdDtm?: string, // 上次變動時間。只是用來通知該刷新資料了
}) {
  const [{ data: bidList, loading: _1, error: _2 }, refetch] = useAxios<IBiddingEvent[]>({
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
