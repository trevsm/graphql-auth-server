import jwt from "jsonwebtoken"
import { serialize } from "cookie"
import { AuthPayload } from "./graphql/types"
import { ENV } from "./env"

export const createTokens = async (
  payload: AuthPayload,
  prisma: any,
  res: any
) => {
  const now = Math.floor(Date.now() / 1000)

  const accessToken = jwt.sign(
    {
      ...payload,
      iat: now,
      exp: now + 60 * 15, // 15 minutes
    },
    ENV.jwt_secret
  )

  const refreshToken = jwt.sign(
    {
      ...payload,
      iat: now,
      exp: now + 60 * 60 * 24 * 7, // 7 days
    },
    ENV.refresh_token_secret
  )

  await prisma.session.create({
    data: { accountId: payload.account.id, token: refreshToken },
  })

  res.setHeader(
    "Set-Cookie",
    serialize("refreshToken", refreshToken, {
      httpOnly: true,
      secure: ENV.node_env !== "development", // use secure in production
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "strict",
      path: "/",
    })
  )

  return accessToken
}
