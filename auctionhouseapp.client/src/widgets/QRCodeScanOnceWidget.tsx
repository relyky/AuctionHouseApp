import { useEffect, useId, useMemo } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats, type Html5QrcodeFullConfig } from "html5-qrcode";
import { beep } from '../tools/utils'

export default function QRCodeScanOnceWidget(props: {
  onScanSuccess: (decodedText: string) => void
}) {
  const id = useId();
  const qrcodeRegionId = useMemo(() => (`qri-${id}`), [id]);

  useEffect(() => {
    scanQrCodeOnce(qrcodeRegionId, props.onScanSuccess)
  }, []);

  return (
    <div id={qrcodeRegionId} /> 
  );
}

/**
 * 掃描 QR code 成功後立刻停止。
 */
function scanQrCodeOnce(elementId: string, onScanSuccess: (decodedText: string) => void) {
  //# 建立掃描物件，只掃QR Code而已。
  const targetElement = document.getElementById(elementId);
  if (!targetElement) throw new Error(`elementId:${elementId}不存在!`);

  const config: Html5QrcodeFullConfig = {
    formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
    verbose: false
  };

  const html5QrCode = new Html5Qrcode(elementId, config);

  //# 開始掃描 QR code
  html5QrCode.start(
    { facingMode: "environment" }, // to prefer back camera
    {
      fps: 10,    // Optional frame per seconds for qr code scanning
      qrbox: 250  // Optional if you want bounded box UI
    },
    (decodedText: string) => {
      // 掃碼成功嗶一下
      beep();

      // when read code then stop immediately.
      html5QrCode.stop();

      // send the scan code return
      onScanSuccess(decodedText);
    },
    (_errorMessage: string) => {
      //※ 掃碼失敗不用處理。
      //console.warn('html5QrCode 掃碼失敗:' + errorMessage);
    }
  ).catch(error => {
    const title = 'html5QrCode.start() 出現例外或禁止啟用相機！'
    console.error(title, { error });
    alert(title);
  })
}