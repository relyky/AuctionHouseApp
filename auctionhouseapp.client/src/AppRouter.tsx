/**
 * 負責註冊 routing 規則。
 */

import { createBrowserRouter, RouterProvider } from "react-router";
import type { LoaderFunction } from "react-router";
import MainLayout from "./layout/MainLayout";
import BidderLayout from "./layout/BidderLayout";
import AuctionLayout from "./layout/AuctionLayout";
import Home from './pages/home/AppForm'
import LotsPage from './pages/lots/AppForm';
import Demo01 from './pages/Demo01/AppForm';
import Demo02 from './pages/Demo02/AppForm';
import ACU1010 from './pages/AUC1010/AppForm';
import ACU1020 from './pages/AUC1020/AppForm';
import ACU1030 from './pages/AUC1030/AppForm';
import ACU2010 from './pages/AUC2010/AppForm';
import ACU2020 from './pages/AUC2020/AppForm';
import ACU2030 from './pages/AUC2030/AppForm';
import ACU2040 from './pages/AUC2040/AppForm';
import ACU3010 from './pages/AUC3010/AppForm';

/**
 * 設計於載入畫面時限定有授權才可開啟畫面！
 * loader 不支援 hooks。
 */
const authGuardLoader: LoaderFunction = (args, handlerCtx) => {
  console.debug("authGuardLoader", { args, handlerCtx });

  if (false) {
    // 拋出一個 401 錯誤，帶有自定義的訊息
    throw new Response("YOU SHALL NOT PASS!!", { status: 401, statusText: "Unauthorized" });
  }

  return true;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "demo01", element: <Demo01 />, loader: authGuardLoader },
    ]
  },
  {
    path: "lots",
    element: <LotsPage />,
  },
  {
    path: "bidder",
    element: <BidderLayout />,
    children: [
      { path: "auc1010", element: <ACU1010 /> },
      { path: "auc1020", element: <ACU1020 /> },
      { path: "auc1030", element: <ACU1030 /> },
      { path: "demo02", element: <Demo02 /> },
    ]
  },
  {
    path: "auction",
    element: <AuctionLayout />,
    children: [
      { path: "auc2010", element: <ACU2010 /> },
      { path: "auc2020", element: <ACU2020 /> },
      { path: "auc2030", element: <ACU2030 /> },
      { path: "auc2040", element: <ACU2040 /> },
    ]
  },
  {
    path: "broadcast",
    element: <ACU3010 />,
  }
]);

export default function AppRouter() {
  return (
    <RouterProvider router={router} />
  )
}
