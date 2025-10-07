import { atom } from "jotai"
import type { ILiveAuctionItem } from "../../dto/liveAuction/ILiveAuctionItem"
import type { ILiveAuctionStatus } from "../../dto/liveAuction/ILiveAuctionStatus"

interface AuctionInput_BizState {
  mode: 'List' | 'RecordBid' | 'Hammer' | 'Pass'
  itemList: ILiveAuctionItem[]
  selectedItem: ILiveAuctionItem | null
  currentStatus: ILiveAuctionStatus | null
}

const initialState: AuctionInput_BizState = {
  mode: 'List',
  itemList: [],
  selectedItem: null,
  currentStatus: null,
}

export const auctionInputAtom = atom(initialState)
auctionInputAtom.debugLabel = 'auctionInputAtom'
