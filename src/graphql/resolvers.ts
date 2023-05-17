import bcrypt from "bcrypt"
import { MyContext, AuthPayload } from "./types"
import { createTokens } from "../utils"
import jwt from "jsonwebtoken"

interface SignupArgs {
  email: string
  name: string
  password: string
}

interface LoginArgs {
  email: string
  password: string
}

export const resolvers = {
  Query: {
    me: async (_: unknown, __: unknown, { account, prisma }: MyContext) => {
      if (!account) {
        throw new Error("Not authenticated")
      }

      const foundAccount = await prisma.account.findUnique({
        where: { id: account.id },
      })
      if (!foundAccount) throw new Error("No such account found")

      return foundAccount
    },
  },
  Mutation: {
    signup: async (
      _: unknown,
      args: SignupArgs,
      { prisma, res }: MyContext
    ) => {
      const { email, name, password } = args

      // check if account already exists
      const existingAccount = await prisma.account.findUnique({
        where: { email },
      })
      if (existingAccount) throw new Error("Account already exists")

      const hashedPassword = await bcrypt.hash(password, 10)
      const account = await prisma.account.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      })

      const payload: AuthPayload = { account: { id: account.id } }
      const accessToken = await createTokens(payload, prisma, res)

      return { accessToken }
    },
    login: async (_: unknown, args: LoginArgs, { prisma, res }: MyContext) => {
      const { email, password } = args
      const account = await prisma.account.findUnique({ where: { email } })
      if (!account) throw new Error("No such account found")

      const valid = await bcrypt.compare(password, account.password)
      if (!valid) throw new Error("Invalid password")

      const payload: AuthPayload = { account: { id: account.id } }
      const accessToken = await createTokens(payload, prisma, res)

      return { accessToken }
    },
    refreshToken: async (
      _: unknown,
      __: unknown,
      { prisma, req, res }: MyContext
    ) => {
      const refreshToken = req.cookies["refreshToken"] as string
      if (!refreshToken) throw new Error("No token found")

      let payload: AuthPayload
      try {
        payload = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET as string
        ) as AuthPayload
      } catch (err) {
        throw new Error("Invalid token")
      }

      // Check if token is blacklisted
      const blacklistedToken = await prisma.tokenBlacklist.findFirst({
        where: {
          token: refreshToken,
          accountId: payload.account.id,
        },
      })
      if (blacklistedToken) throw new Error("Blacklisted token")

      const session = await prisma.session.findFirst({
        where: {
          token: refreshToken,
        },
      })

      if (!session) {
        // Add token to blacklist
        await prisma.tokenBlacklist.create({
          data: {
            account: {
              connect: {
                id: payload.account.id,
              },
            },
            token: refreshToken,
          },
        })

        // Delete all sessions with this account id, forcing them to log in again everywhere
        await prisma.session.deleteMany({
          where: {
            accountId: payload.account.id,
          },
        })

        throw new Error("Invalid token")
      }

      // Delete the old session from the database
      await prisma.session.delete({
        where: {
          id: session.id,
        },
      })

      const newPayload: AuthPayload = { account: payload.account }
      const accessToken = await createTokens(newPayload, prisma, res)

      return { accessToken }
    },
    logout: async (
      _: unknown,
      __: unknown,
      { prisma, req, res }: MyContext
    ) => {
      const refreshToken = req.cookies["refreshToken"] as string
      if (!refreshToken) throw new Error("No token found")

      // Delete the session from the database
      await prisma.session.delete({
        where: {
          token: refreshToken,
        },
      })

      res.cookie("refreshToken", "", {
        httpOnly: true,
      })

      return { message: "Logged out successfully" }
    },
  },
}
