import { forwardRef, useImperativeHandle, useState } from 'react';
import { Box, List, ListItem, ListItemButton, ListItemText, ListSubheader, Slide } from '@mui/material';
import { TransitionGroup } from 'react-transition-group';
// icons
//import CheckIcon from '@mui/icons-material/Star';
//import BlankIcon from '@mui/icons-material/StarBorder';

/**
 * 最近出價訊息，只保留最高10筆
 */
export interface BiddingEventPanelRef {
  pushEvent: (e: IBiddingEvent) => void;
  clear: () => void;
}

const BiddingEventPanel = forwardRef<BiddingEventPanelRef, {}>((_, ref) => {
  // 改用 React 內建的 useState
  const [itemList, setItemList] = useState<IBiddingEvent[]>([]);

  useImperativeHandle(ref, () => ({
    pushEvent: (newItem: IBiddingEvent) => {
      setItemList(prevList => {
        // 只保留最近10筆訊息
        const updatedList = [newItem, ...prevList.slice(0, 9)];
        // 重新排序
        // 規則一：bidPrice 降序 (DESC)
        // 規則二：bidPrice 相同時，biddingSn 升序 (ASC)
        updatedList.sort((a, b) =>
          a.bidPrice !== b.bidPrice ? b.bidPrice - a.bidPrice : a.biddingSn - b.biddingSn
        );
        return updatedList;
      });
    },
    clear: () => {
      setItemList([]);
    },
  }), []); // 依賴項為空陣列，因為 setItemList 是穩定的

  //console.debug('BiddingEventPanel.render', { itemList })
  return (
    <Box>
      <List dense subheader={<ListSubheader>出價訊息近10筆</ListSubheader>}>
        <TransitionGroup>
          {itemList.map((item) => (
            <Slide key={item.biddingSn} direction='left'>
              <ListItem disablePadding /* secondaryAction={<BlankIcon />} */ >
                <ListItemButton>
                  <ListItemText
                    primary={`${item.bidderNo} 出價 ${item.bidPrice} 元`}
                    secondary={`${item.bidOpenSn}-${item.biddingSn}: ${item.bidTimestamp}`}
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontSize: '1.25em'
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            </Slide>
          ))}
        </TransitionGroup>
      </List>
    </Box>
  );
});

export default BiddingEventPanel;
