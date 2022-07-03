const { ApolloServer, gql, UserInputError } = require('apollo-server')
const mongoose = require('mongoose')
const Author = require('./models/Author')
const Book = require('./models/Book')
const User = require('./models/User')
const jwt = require('jsonwebtoken')

const MONGODB_URI = 'mongodb+srv://sysadmin:3iDKty7jvBqWpkc@cluster0.wkq1i.mongodb.net/library?retryWrites=true&w=majority'

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.log('error connection to MongoDB:', error.message)
    })

const JWT_SECRET = 'NEED_HERE_A_SECRET_KEY'

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
`

const resolvers = {
    Query: {
        bookCount: async () => Book.collection.countDocuments(),
        authorCount: async () => Author.collection.countDocuments(),
        allBooks: async (root, args) => {
            const { author, genre } = args
            if (Object.keys(args).length === 0) return Book.find({}).populate('author')

            if (author) {
                const bookAuthor = await Author.findOne({ name: author })
                return Book.find({ bookAuthor }).populate('author')
            }

            if (genre) return Book.find({ genres: { $in: [genre] } }).populate('author')
        },
        allAuthors: async () => Author.find({}),
        me: (root, args, context) => {
            return context.currentUser
        },
        genres: async (root, args) => {
            const books = await Book.find({})
            const genreSet = new Set()
            books.map(book => book.genres.map(genre => genreSet.add(genre)))
            return genreSet
        }
    },
    Author: {
        bookCount: async (root) => {
            const author = await Author.findOne({ name: root.name })
            return Book.find({ author }).populate('author').countDocuments()
        }
    },
    Mutation: {
        addBook: async (root, args, context) => {
            if (!context.currentUser) throw new UserInputError('invalid credentials')

            const { author } = args
            const book = new Book({ ...args })
            const bookAuthor = await Author.findOne({ name: author })
            book.author = bookAuthor
            try {
                return book.save()
            }
            catch (error) {
                throw new UserInputError(error.message, { invalidArgs: args })
            }
        },
        editAuthor: async (root, args, context) => {
            if (!context.currentUser) throw new UserInputError('invalid credentials')

            const { name, setBornTo } = args
            const author = await Author.findOne({ name })
            if (author) {
                author.born = setBornTo
                try {
                    return author.save()
                }
                catch (error) {
                    throw new UserInputError(error.message, { invalidArgs: args })
                }
            }

            return null
        },

        login: async (root, args) => {
            const user = await User.findOne({ username: args.username })

            if (!user || args.password !== 'secret') {
                throw new UserInputError("wrong credentials")
            }

            const userForToken = {
                username: user.username,
                id: user._id,
            }

            return { value: jwt.sign(userForToken, JWT_SECRET) }
        },
        createUser: async (root, args) => {
            const user = new User({ ...args })

            return user.save()
                .catch(error => {
                    throw new UserInputError(error.message, {
                        invalidArgs: args,
                    })
                })
        },
    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
        const auth = req ? req.headers.authorization : null
        if (auth && auth.toLowerCase().startsWith('bearer ')) {
            const decodedToken = jwt.verify(
                auth.substring(7), JWT_SECRET
            )
            const currentUser = await User.findById(decodedToken.id)
            return { currentUser }
        }
    }
})

server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`)
})