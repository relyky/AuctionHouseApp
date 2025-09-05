/**
 * 負責導引與系統基礎初始化工作。
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider, createStore } from 'jotai'
import App from './App.tsx'
// CSS
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './index.css'

const store = createStore()

// StrictMode
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
