const { ApolloServer } = require('apollo-server-express')
const mongoose = require('mongoose')
const User = require('./models/User')
const jwt = require('jsonwebtoken')
const typeDefs = require('./schema')
const resolvers = require('./resolvers')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core')
const express = require('express')
const http = require('http')
const { execute, subscribe } = require('graphql')
const { SubscriptionServer } = require('subscriptions-transport-ws')
const JWT_SECRET = require('./secret')


const MONGODB_URI = 'mongodb+srv://sysadmin:3iDKty7jvBqWpkc@cluster0.wkq1i.mongodb.net/library?retryWrites=true&w=majority'

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.log('error connection to MongoDB:', error.message)
    })


const start = async () => {
    const app = express()
    const httpServer = http.createServer(app)
    const schema = makeExecutableSchema({ typeDefs, resolvers })
    const subscriptionServer = SubscriptionServer.create({
        schema,
        execute,
        subscribe
    },
    {
        server: httpServer,
        path: ''
    }
    )
    const server = new ApolloServer({
        schema,
        context: async ({ req }) => {
            const auth = req ? req.headers.authorization : null
            if (auth && auth.toLowerCase().startsWith('bearer ')) {
                const decodedToken = jwt.verify(
                    auth.substring(7), JWT_SECRET)
                    const currentUser = await User.findById(decodedToken.id)
                    return { currentUser }
                }
            },
            plugins: [ApolloServerPluginDrainHttpServer({ httpServer }),
                {
                    async serverWillStart() {
                        return {
                            async drainServer() {
                                subscriptionServer.close()
                            }
                        }
                    }
                }
        ]
    })

    await server.start()
    
    server.applyMiddleware({
        app,
        path: '/'
    })
    
    const PORT = 4000
    
    httpServer.listen(PORT, () =>
    console.log(`Server is now running on http://localhost:${PORT}`)
    )
}

start()