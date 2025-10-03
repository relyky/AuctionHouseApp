/**
 * 設定 UI theme 資源與其他全域組態。
 */
import { useEffect } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { zhTW } from '@mui/material/locale'
import { ToastContainer } from 'react-toastify';
import { selectAuthed, useStaffAccountAction } from "./atoms/staffAccountAtom";
import { useAtomValue } from "jotai";
import AppRouter from "./AppRouter";
import axios from 'axios'

//-----------------------------------------------------------------------------

/**
 * 設定 Axios 互動之簡化錯誤操作。
 */
axios.interceptors.response.use(
  res => res
  , err => {
    // ※ 規定主機端 400 BadRequest 一律送回文字格式錯誤訊息。故可以從 AxiosError → Error 以簡化錯誤操作。
    if (err.response?.status === 400)
      return Promise.reject(new Error(err.response?.data as string, { cause: err }));
    else
      return Promise.reject(err);
  });

//-----------------------------------------------------------------------------
/**
 * 自訂 Theme。之後可使用 useColorScheme() 指令切換 theme mode。* 
 */
const customTheme = createTheme(
  {
    typography: {
      htmlFontSize: 12, // default: 16px;
    },
    colorSchemes: { light: true, dark: true }, // 啟用 light 與 dark 模式
    cssVariables: {
      colorSchemeSelector: 'class' // 使用 class 作為色彩方案選擇器
    },
    palette: {
      primary: { main: '#780266' }, // '#BF4690'
      secondary: { main: '#E7C056', contrastText:'#FFFFF0' }, // 象牙白  '#E7C058' #CA87B0
      background: {
        paper: '#fafafa',
        default: '#fff'
      },
      mode: 'light',
    },
  },
  zhTW // 使用中文語系
);

export default function App() {
  const isAuthed = useAtomValue(selectAuthed)
  const { refillLoginUserAsync } = useStaffAccountAction()

  useEffect(() => {
    //console.info('App.useEffect', { isAuthed });
    if (!isAuthed) {
      refillLoginUserAsync()
    }
  }, [isAuthed])

  return (
    <ThemeProvider theme={customTheme} defaultMode='light' >
      <CssBaseline />
      <AppRouter />
      <ToastContainer />
    </ThemeProvider>
  )
}
