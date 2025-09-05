import { useEffect, useMemo, useRef } from 'react';
import { QRCodeSVG } from '@akamfoad/qrcode';

export default function QrCodeWidget(props: {
  value: string,
  imageSrc?: string,
  bgColor?: string,
  fgColor?: string,
  className?: string,
  style?: React.CSSProperties,
}) {
  const devRef = useRef<HTMLDivElement>(null)

  const options = useMemo(() => ({
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
  }), [props.bgColor, props.fgColor, props.imageSrc])

  const qrSvgXml = useMemo(() => {
    const qrSVG = new QRCodeSVG(props.value, options);
    return qrSVG.toString();
  }, [props.value, options])

  useEffect(() => {
    if (devRef.current && qrSvgXml)
      devRef.current.innerHTML = qrSvgXml
  }, [qrSvgXml])

  return (
    <div ref={devRef} className={props.className} style={props.style} />
  )
}