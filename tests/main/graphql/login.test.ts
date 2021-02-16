import { makeApolloServer } from './helpers'
import { MongoHelper } from '@/infra/db/mongodb/mongo-helper'

import { ApolloServer, gql } from 'apollo-server-express'
import { Collection } from 'mongodb'
import { hash } from 'bcrypt'
import { createTestClient } from 'apollo-server-integration-testing'

let accountCollection: Collection
let apolloServer: ApolloServer

describe('Login GraphQL', () => {
  beforeAll(async () => {
    apolloServer = makeApolloServer()
    await MongoHelper.connect(process.env.MONGO_URL)
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  beforeEach(async () => {
    accountCollection = await MongoHelper.getCollection('accounts')
    await accountCollection.deleteMany({})
  })

  describe('Login Query', () => {
    const loginQuery = gql`
      query login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
          accessToken,
          name
        }
      }
    `
    test('Should return an Account on valid credentials', async () => {
      const password = await hash('123456', 12)
      await accountCollection.insertOne({
        name: 'Cassius Souza',
        email: 'cassius.sanches@gmail.com',
        password
      })

      const { query } = createTestClient({ apolloServer })
      const res: any = await query(loginQuery, {
        variables: {
          email: 'cassius.sanches@gmail.com',
          password: '123456'
        }
      })

      expect(res.data.login.accessToken).toBeTruthy()
      expect(res.data.login.name).toBe('Cassius Souza')
    })

    test('Should return UnauthorizedErrors on invalid credentials', async () => {
      const { query } = createTestClient({ apolloServer })
      const res: any = await query(loginQuery, {
        variables: {
          email: 'cassius.sanches@gmail.com',
          password: '123456'
        }
      })
      expect(res.data).toBeFalsy()
      expect(res.errors[0].message).toBe('Unauthorized')
    })

    test('Should return InvalidParamError on invalid credentials', async () => {
      const { query } = createTestClient({ apolloServer })
      const res: any = await query(loginQuery, {
        variables: {
          email: 'cassius.sanches@',
          password: '123456'
        }
      })
      expect(res.data).toBeFalsy()
      expect(res.errors[0].message).toBe('Invalid param: email')
    })
  })

  describe('SignUp Mutation', () => {
    const signUpMutation = gql`
      mutation signUp($name: String!, $email: String!, $password: String!, $passwordConfirmation: String!) {
        signUp(name: $name, email: $email, password: $password, passwordConfirmation: $passwordConfirmation) {
          accessToken,
          name
        }
      }
    `
    test('Should return an Account on valid data', async () => {
      const { mutate } = createTestClient({ apolloServer })
      const res: any = await mutate(signUpMutation, {
        variables: {
          name: 'Cassius Souza',
          email: 'cassius.sanches@gmail.com',
          password: '123456',
          passwordConfirmation: '123456'
        }
      })
      expect(res.data.signUp.accessToken).toBeTruthy()
      expect(res.data.signUp.name).toBe('Cassius Souza')
    })

    test('Should return EmailInUseError on email in use', async () => {
      const password = await hash('123456', 12)
      await accountCollection.insertOne({
        name: 'Cassius Souza',
        email: 'cassius.sanches@gmail.com',
        password
      })
      const { mutate } = createTestClient({ apolloServer })
      const res: any = await mutate(signUpMutation, {
        variables: {
          name: 'Cassius Souza',
          email: 'cassius.sanches@gmail.com',
          password: '123456',
          passwordConfirmation: '123456'
        }
      })
      expect(res.data).toBeFalsy()
      expect(res.errors[0].message).toBe('The received email is already in use')
    })
  })
})
