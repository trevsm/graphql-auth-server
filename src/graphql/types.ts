import { BaseContext } from "@apollo/server"
import { PrismaClient } from "@prisma/client"

interface SimpleAccount {
  id: number
}

export interface MyContext extends BaseContext {
  prisma: PrismaClient
  account?: SimpleAccount | null
  req: any
  res: any
}

export type AuthPayload = {
  account: {
    id: number
  }
}
