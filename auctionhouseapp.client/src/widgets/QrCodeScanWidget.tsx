/*
 * ref→[Html5QrcodePlugin.jsx](https://github.com/scanapp-org/html5-qrcode-react/blob/main/src/Html5QrcodePlugin.jsx)
 */
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { useNavigate } from 'react-router'
import { Html5QrcodeScanner } from 'html5-qrcode';
import type { Html5QrcodeScannerConfig } from 'html5-qrcode/esm/html5-qrcode-scanner';
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import { Alert, AlertTitle, Button } from '@mui/material';

// Creates the configuration object for Html5QrcodeScanner.
const dfaultConfig: Html5QrcodeScannerConfig = {
  fps: 10,
  supportedScanTypes: [0],
  rememberLastUsedCamera: true,
  videoConstraints: {
    facingMode: 'environment',
  }
};

export default function Html5QrcodePlugin(props: any) {
  const navigate = useNavigate()
  const id = useId()
  const qrcodeRegionId = useMemo(() => (`qri${id}`), [])
  const [errMsg, setErrMsg] = useState<string | null>(null)

  const handleScanSuccess = (decodedText: string, decodedResult: any) => {
    // handle decoded results here
    console.trace('handleScanSuccess', { decodedText, decodedResult })
    setErrMsg(null)
    props.qrCodeSuccessCallback && props.qrCodeSuccessCallback(decodedText, decodedResult)
  };

  const handleScanFailure = useCallback((error: string) => {
    // handle scan failure, usually better to ignore and keep scanning.
    console.error('handleScanFailure', { error })
    setErrMsg(error)
  }, []);

  useEffect(() => {
    // when component mounts
    const config = dfaultConfig;
    const verbose = false;

    const html5QrcodeScanner = new Html5QrcodeScanner(qrcodeRegionId, config, verbose);
    html5QrcodeScanner.render(handleScanSuccess, handleScanFailure);

    // cleanup function when component will unmount
    return () => {
      html5QrcodeScanner.clear().catch(error => {
        console.error("Failed to clear html5QrcodeScanner. ", error);
      });
    };
  }, []);

  return (
    <ErrorBoundary fallbackRender={fallbackRender}
      onReset={(_details) => {
        navigate(0); // 無法重設此元件只好刷新頁面
      }}>
      <div>
        <div id={qrcodeRegionId} />
        {errMsg && <pre style={{ color: 'red' }}>{errMsg}</pre>}
      </div>
    </ErrorBoundary>
  );
};

//-------------------------------------
function fallbackRender({ error, resetErrorBoundary }: FallbackProps) {
  const errorMessage = error instanceof Error ? error.message
    : error;

  return (
    <Alert severity="error">
      <AlertTitle>元件出現問題！</AlertTitle>
      <span>{errorMessage}</span><br />
      <Button onClick={() => resetErrorBoundary()}>重設元件</Button>
    </Alert>
  )
}