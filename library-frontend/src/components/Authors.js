import { useMutation, useQuery } from "@apollo/client"
import { useState } from "react"
import { ALL_AUTHORS, UPDATE_AUTHOR } from "../queries"

const Authors = (props) => {
  const [name, setName] = useState('Robert Martin')
  const [birthYear, setBirthYear] = useState(0)
  const result = useQuery(ALL_AUTHORS)
  const [updateAuthor] = useMutation(UPDATE_AUTHOR, { refetchQueries: [{ query: ALL_AUTHORS }] })

  if (!props.show) {
    return null
  }

  if (result.loading) {
    return <div>loading...</div>
  }

  const onSubmit = e => {
    e.preventDefault()
    updateAuthor({ variables: { name, setBornTo: birthYear } })
    setBirthYear(0)
    setName('')
  }

  return (
    <>
      <div>
        <h2>authors</h2>
        <table>
          <tbody>
            <tr>
              <th></th>
              <th>born</th>
              <th>books</th>
            </tr>
            {result.data.allAuthors.map((a) => (
              <tr key={a.name}>
                <td>{a.name}</td>
                <td>{a.born}</td>
                <td>{a.bookCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h2>Set birthyear</h2>
        <form onSubmit={onSubmit}>
          <div>
            name
            <select value={name} onChange={e => setName(e.target.value)}>
              {result.data.allAuthors.map(author =>
                <option value={author.name}>{author.name}</option>
              )}
            </select>
          </div>
          <div>
            born
            <input type='number' value={birthYear} onChange={e => setBirthYear(parseInt(e.target.value))} />
          </div>
          <button type="submit">update author</button>
        </form>
      </div>
    </>
  )
}

export default Authors
