import { useState } from "react";
import { Box, Button, Divider, useEventCallback } from "@mui/material";
import { postData } from "../../tools/httpHelper";
import type { IStaffAccount } from "../Account/DTO/IStaffAccount";
import { decrypt2, decrypt3, encrypt2, encrypt3 } from "../../tools/aesHelper";

export default function UsePostDataLab() {
  const [info, setInfo] = useState<IStaffAccount>()
  const [plainObj, setPlainObj] = useState<object>({
    astr: 'ABC123',
    anum: 98754321987,
    atxt: '今天天氣真好'
  });
  const [ciphertext, setCiphertext] = useState<string>()
  const [decodedObj, setDecodedObj] = useState<object | null>(null)

  const [encryptText, setEncryptText] = useState<string | null>(null)
  const [decodedText, setDecodedText] = useState<string | null>(null)

  const handlePostData = useEventCallback(async () => {
    const userId = 'pretty'
    const info = await postData<IStaffAccount>(`api/WeatherForecast/GetFormData/${userId}`);
    setInfo(info);
  });

  const handleEncrypt3 = useEventCallback(() => {
    setCiphertext(encrypt3(plainObj))
  });

  const handleDecrypt3 = useEventCallback(() => {
    setDecodedObj(decrypt3(ciphertext!))
  });

  const handleEncrypt2 = useEventCallback(() => {
    setEncryptText(encrypt2('123456:abcxyz:!@#$%^&*aBcD123:今天天氣真好。'))
  });

  const handleDecrypt2 = useEventCallback(() => {
    setDecodedText(decrypt2(encryptText!))
  });

  return (
    <Box mb={2}>
      <Box typography='h6'>UsePostDataLab</Box>
      <Button onClick={handlePostData}>postData</Button>
      {info && <pre>{JSON.stringify(info, null, 2)}</pre>}

      <Divider sx={{ my: 3 }} />
      <Box typography='h6'>測試本地加解密</Box>
      <Button onClick={handleEncrypt3}>加密</Button>
      <Button onClick={handleDecrypt3}>解密</Button>
      <pre>ciphertext: {ciphertext}</pre>
      <pre>decodedObj: {JSON.stringify(decodedObj, null, 2)}</pre>


      <Divider sx={{ my: 3 }} />
      <Box typography='h6'>測試加解密</Box>
      <Button onClick={handleEncrypt2}>加密</Button>
      <Button onClick={handleDecrypt2}>解密</Button>
      <pre>encryptText: {encryptText}</pre>
      <pre>decodedText: {decodedText}</pre>
    </Box>
  )
}