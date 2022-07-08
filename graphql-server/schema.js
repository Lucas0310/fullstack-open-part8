const { gql } = require('apollo-server')
const typeDefs = gql`
type Book {
    title: String!,
    published: Int!,
    author: Author!,
    id: ID!,
    genres: [String!]!
}

type Author {
    name: String!,
    id: ID!,
    born: Int,
    bookCount: Int!
}
type User {
    username: String!
    favouriteGenre: String!
    id: ID!
  }
  
type Token {
    value: String!
  }

type Mutation {
    addBook(
        title: String!,
        author: String!,
        genres: [String!]!,
        published: Int!
    ): Book,

    editAuthor(
        name: String!,
        setBornTo: Int!
    ): Author,

    createUser(
        username: String!
        favouriteGenre: String!
      ): User,

      login(
        username: String!
        password: String!
      ): Token
}

  type Query {
    bookCount: Int!,
    authorCount: Int!,
    allBooks(author: String, genre: String): [Book!]!,
    allAuthors: [Author!]!,
    me: User,
    genres: [String!]
  }

  type Subscription {
    bookAdded: Book!
  }
`
module.exports = typeDefs