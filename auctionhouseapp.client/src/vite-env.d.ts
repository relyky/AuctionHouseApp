/// <reference types="vite/client" />

type EditMode = 'Init' |  'List' | 'Add' | 'Edit' | 'Step1' | 'Step2' | 'Step3' | 'Step4' | 'Step5' | 'Finish';
// Init �e����l�ơG�p���J���ҳ]�w�B�t�ΰѼƵ�

// ���M�ת��q�Ϋ��T������
interface MsgObj {
  message: string,
  formNo?: string,
  nextStep?: stirng,
  severity?: 'error' | 'warning' | 'info' | 'success'
}

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
 * ��~��T profile
 */
interface ILotProfile {
  lotNo: string
  lotTitle: string
}

/**
 * ��~��T
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
   * �t�Ϊ����C�o�����O�ΨӧP�_�O�_����s
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
  lastBiddingEventUpdDtm?: string // ISO 8601 �榡���ɶ��r��
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
  bidTimestamp: string // ISO 8601 �榡���ɶ��r��
}

interface IHammeredRecord {
  lotNo: string
  bidResult: string
  winnerNo: string
  hammerPrice: number
  biddingSn: number
  hammerTime: string // ISO 8601 �榡���ɶ��r��
}

//#region �P DB Schema ��������ƪ����w�q

interface IRaffleOrder {
  raffleOrderNo: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  purchaseCount: number;
  purchaseAmount: number;
  hasPaid: string;
  salesId: string;
  soldDtm: string;
  status: string;
  remark: string;
  isChecked: string;
  checker: string;
  checkedDtm: string;
}

interface IRaffleTicket {
  raffleTicketNo: string;
  raffleSoldNo: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  emailTimes: number;
  lastEmailDtm: string;
}

//#endregion