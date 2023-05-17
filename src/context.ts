import { AuthPayload, MyContext } from "./graphql/types"
import { prisma } from "."
import { IncomingMessage, ServerResponse } from "http"
import { ENV } from "./env"
import jwt from "jsonwebtoken"

interface Context {
  req: IncomingMessage
  res: ServerResponse<IncomingMessage>
}

export const context = async ({ req, res }: Context): Promise<MyContext> => {
  try {
    const authHeader = req.headers.authorization
    let account

    if (authHeader) {
      const token = authHeader.split(" ")[1]
      const decoded = jwt.verify(token, ENV.jwt_secret) as AuthPayload

      if (decoded) account = decoded.account
    }

    return {
      account,
      prisma,
      req,
      res,
    }
  } catch (err) {
    console.error("Error in context.ts:", err)
    return {
      account: null,
      prisma,
      req,
      res,
    }
  }
}
