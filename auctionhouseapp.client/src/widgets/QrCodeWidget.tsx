import { useEffect, useMemo, useRef } from 'react';
import { QRCodeSVG } from '@akamfoad/qrcode';

export default function QrCodeWidget(props: {
  value: string,
  level?: 'L' | 'M' | 'Q' | 'H',
  imageSrc?: string,
  bgColor?: string,
  fgColor?: string,
  className?: string,
  style?: React.CSSProperties,
}) {
  const devRef = useRef<HTMLDivElement>(null)

  const config = useMemo(() => ({
    level: props.level ?? 'M', // use high error correction level
    padding: 1,
    bgColor: props.bgColor,
    fgColor: props.fgColor,
    image: props.imageSrc ?
      {
        source: props.imageSrc,
        width: '20%',
        height: '20%',
        x: 'center',
        y: 'center',
      } : undefined,
  }), [props])

  const qrSvgXml = useMemo(() => {
    const qrSVG = new QRCodeSVG(props.value, config);
    return qrSVG.toString();
  }, [props.value, config])

  useEffect(() => {
    if (devRef.current && qrSvgXml)
      devRef.current.innerHTML = qrSvgXml
  }, [qrSvgXml])

  return (
    <div ref={devRef} className={props.className} style={props.style} />
  )
}