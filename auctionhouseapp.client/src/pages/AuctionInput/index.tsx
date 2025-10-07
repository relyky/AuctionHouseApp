import { useAtomValue } from "jotai";
import { auctionInputAtom } from "./atom";
import ListView from "./ListView";
import RecordBidView from "./RecordBidView";
import PassView from "./PassView";

export default function AuctionInput() {
  const { mode } = useAtomValue(auctionInputAtom);

  return (
    <>
      {mode === 'RecordBid' && <RecordBidView />}
      {mode === 'Pass' && <PassView />}
      <ListView />
    </>
  );
}