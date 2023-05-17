import dotenv from "dotenv"
dotenv.config()

export const ENV = {
  admin_password: process.env.ADMIN_PASSWORD as string,
  admin_email: process.env.ADMIN_EMAIL as string,
  jwt_secret: process.env.JWT_SECRET as string,
  refresh_token_secret: process.env.REFRESH_TOKEN_SECRET as string,
  node_env: process.env.NODE_ENV as string,
}

// if missing any ENV variables, throw an error
Object.entries(ENV).map(([key, value]) => {
  if (key === "node_env") return

  if (!value) {
    throw new Error(`Missing ENV variable: ${key}`)
  }
})
