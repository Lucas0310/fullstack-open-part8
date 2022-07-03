import { useQuery } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { ALL_BOOKS, ME } from '../queries'

const RecommendForm = (props) => {
  const me = useQuery(ME)
  const [favouriteGenre, setFavouriteGenre] = useState("")
  const result = useQuery(ALL_BOOKS, {
    variables: {
      genre: favouriteGenre,
      skip: !favouriteGenre
    }
  })

  useEffect(() => {
    if (me.data?.me) {
      setFavouriteGenre(me.data.me.favouriteGenre)
    }

    return () => false
  }, [me.data])


  if (!props.show) return null

  if (me.loading || result.loading) return <div>Loading...</div>
  return (
    <div>
      <h2>recommendations</h2>
      <p>books in your favourite genre <b>{me.data.me.favouriteGenre}</b></p>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {result.data.allBooks.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default RecommendForm