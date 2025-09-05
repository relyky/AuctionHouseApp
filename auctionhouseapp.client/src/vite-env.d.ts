/// <reference types="vite/client" />

type StepEnum =
  'Step1_PickLot' |
  'Step2_StartPrice' |
  'Step2A_IncPrice' |
  'Step3_Bidding' |
  'Step4_CheckBid' |
  'Step5_Hammer';

interface ILabelCode {
  label: string
  code: string
}

interface IBidder {
  bidderNo: string
  bidderName: string
  emailAddr: string
  phoneNum: string
  enable: string
}

type IAccountState = IBidder

/**
 * 拍品資訊 profile
 */
interface ILotProfile {
  lotNo: string
  lotTitle: string
}

/**
 * 拍品資訊
 */
interface ILot {
  lotNo: string
  lotTitle: string
  lotDesc: string
  catalog: string
  highEstimate: number
  lowEstimate: number
  reservePrice: number
  startPrice: number
  status: string
}

interface ILiveAuctionStatus {
  /**
   * 系統版次。這個欄位是用來判斷是否有更新
   */
  rowversion: number
  step: StepEnum
  curLotNo: string
  curBidPrice: number
  bidIncrement: number
  isLocked: boolean
  isBidOpen: boolean
  isHammered: boolean
  bidOpenSn: number
  thisBidOpenTime?: string
  thisBidCloseTime?: string
  lastBiddingEventUpdDtm?: string // ISO 8601 格式的時間字串
}

interface IBidMsg {
  lotNo: string
  bidderNo: string
  bidPrice: number
  bidOpenSn: number // int
}

interface IBiddingEvent {
  biddingSn: number
  lotNo: string
  bidderNo: string
  bidPrice: number
  isValid: 'Y' | 'N'
  bidOpenSn: number
  bidTimestamp: string // ISO 8601 格式的時間字串
}

interface IHammeredRecord {
  lotNo: string
  bidResult: string
  winnerNo: string
  hammerPrice: number
  biddingSn: number
  hammerTime: string // ISO 8601 格式的時間字串
}
