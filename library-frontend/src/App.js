import { useSubscription, useApolloClient } from '@apollo/client'
import { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import LoginForm from './components/LoginForm'
import NewBook from './components/NewBook'
import RecommendForm from './components/RecommendForm'
import { BOOK_ADDED } from './queries'

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState()
  const [genre, setGenre] = useState()
  const client = useApolloClient()
  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
    console.log(subscriptionData)
    window.alert(`${subscriptionData.data.bookAdded.title} added!`)
    }

  })
  
  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
    setPage('books')
  }

  const loginButtonClick = () => {

    if (token) {
      logout()
    } else {
      setPage('login')
    }
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token && <button onClick={() => setPage('add')}>add book</button>}
        {token && <button onClick={() => setPage('recommend')}>recommend</button>}
        <button onClick={() => loginButtonClick()}>{token ? 'logout' : 'login'}</button>
      </div>

      <Authors show={page === 'authors'} token={token} />

      <Books show={page === 'books'} genre={genre} setGenre={setGenre} />

      <NewBook show={page === 'add'} genre={genre} />

      <LoginForm show={page === 'login'} setToken={setToken} />

      <RecommendForm show={page === 'recommend'} />
    </div>
  )
}

export default App
