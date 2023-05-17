import { ApolloServer } from "@apollo/server"
import { MyContext } from "./graphql/types"
import { resolvers } from "./graphql/resolvers"
import { typeDefs } from "./graphql/schema"
import { expressMiddleware } from "@apollo/server/express4"
import { json } from "body-parser"
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { context } from "./context"
import { PrismaClient } from "@prisma/client"

export const prisma = new PrismaClient()

const main = async () => {
  const app = express()

  app.use(cookieParser())

  const server = new ApolloServer<MyContext>({
    typeDefs,
    resolvers,
  })

  await server.start()

  app.use(
    "/graphql",
    cors<cors.CorsRequest>({
      origin: "http://localhost:4000",
    }),
    json(),
    expressMiddleware(server, { context })
  )

  app.listen(4000, () => {
    console.log(`🚀 Server ready at: http://localhost:4000`)
  })
}

main()
