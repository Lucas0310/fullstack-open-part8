const Author = require('./models/Author')
const Book = require('./models/Book')
const { UserInputError } = require('apollo-server')
const User = require('./models/User')
const jwt = require('jsonwebtoken')
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

module.exports = resolvers