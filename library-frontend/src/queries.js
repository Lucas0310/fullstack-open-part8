import { gql } from "@apollo/client";

export const ALL_AUTHORS = gql`
query {
  allAuthors {
    name
    id
    born
    bookCount
  }
}`

export const CREATE_BOOK = gql`
mutation AddBook($title: String!, $author: String!, $genres: [String!]!, $published: Int!) {
    addBook(title: $title, author: $author, genres: $genres, published: $published) {
      title
      published
      author
      id
      genres
    }
  }
`
export const UPDATE_AUTHOR = gql`
mutation EditAuthor($name: String!, $setBornTo: Int!) {
    editAuthor(name: $name, setBornTo: $setBornTo) {
      name
      id
      born
    }
  }
`
export const ALL_BOOKS = gql`
query {
  allBooks {
    title
    published
    author {
      name
    }
    id
  }
}
`