import gql from "graphql-tag"

export const typeDefs = gql`
  enum Role {
    OWNER
    ADMIN
    STUDENT
  }

  type Account {
    id: ID!
    name: String!
    email: String!
    role: Role!
  }

  type Session {
    id: ID!
    token: String!
  }

  type AuthPayload {
    accessToken: String!
  }

  type Message {
    message: String!
  }

  type Query {
    me: Account
  }

  type Mutation {
    signup(email: String!, password: String!): AuthPayload
    login(email: String!, password: String!): AuthPayload
    refreshToken: AuthPayload
    logout: Message
  }
`
