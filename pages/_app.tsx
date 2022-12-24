import '../styles/globals.css'
import type { AppProps } from 'next/app'
import NextNProgress from 'nextjs-progressbar'
import { SessionProvider } from 'next-auth/react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Provider } from 'react-redux'
import { store }  from '../redux/store';

function App({ Component, pageProps }: AppProps) {
  return (
      <SessionProvider session={pageProps.session}>
        <Provider store={store}>
          <NextNProgress color="red"/>
          <ToastContainer />
          <Component {...pageProps} />
        </Provider>

     </SessionProvider>
  )
}

export default App
