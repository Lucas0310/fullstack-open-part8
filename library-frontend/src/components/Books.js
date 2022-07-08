import { useQuery } from "@apollo/client"
import { ALL_BOOKS, ALL_GENRES } from "../queries"


const Books = (props) => {
  const result = useQuery(ALL_BOOKS,
    { variables: { genre: props.genre }, skip: !props.genre })
  const genreResult = useQuery(ALL_GENRES)
  
  if (!props.show) {
    return null
  }

  if (result.loading || genreResult.loading) return <div>Loading...</div>

  const books = result.data?.allBooks

  const onGenreButtonClick = (e) => {
    const genre = e.target.textContent
    props.setGenre(genre)
  }

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {props.genre && books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        {genreResult.data.genres.map(genre => <button key={genre} type='button' onClick={e => onGenreButtonClick(e)}>{genre}</button>)}
      </div>
    </div>
  )
}

export default Books
