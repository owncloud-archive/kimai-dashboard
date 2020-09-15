import { Provider } from 'next-auth/client'

const site = process.env.NEXT_PUBLIC_SITE || 'http://localhost:3000'

const App = ({ Component, pageProps }) => {
  const { session } = pageProps
  return (
    <Provider options={{ site }} session={session} >
      <Component {...pageProps} />
    </Provider>
  )
}
export default App;
