import '../styles/globals.css'
import type { AppProps } from 'next/app'
import NextNProgress from 'nextjs-progressbar'
import { SessionProvider } from 'next-auth/react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Provider } from 'react-redux'
import { wrapper }  from '../redux/store';

function App({ Component, ...rest }: AppProps) {
  const { store, props } = wrapper.useWrappedStore(rest);
  const { pageProps } = props;
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
