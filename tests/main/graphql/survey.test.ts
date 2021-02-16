import env from '@/main/config/env'
import { makeApolloServer } from './helpers'
import { MongoHelper } from '@/infra/db/mongodb/mongo-helper'

import { ApolloServer, gql } from 'apollo-server-express'
import { Collection } from 'mongodb'
import { createTestClient } from 'apollo-server-integration-testing'
import { sign } from 'jsonwebtoken'

let surveyCollection: Collection
let accountCollection: Collection
let apolloServer: ApolloServer

const makeAccessToken = async (): Promise<string> => {
  const res = await accountCollection.insertOne({
    name: 'Cassius Souza',
    email: 'cassius.sanches@gmail.com',
    password: '123',
    role: 'admin'
  })
  const id = res.ops[0]._id
  const accessToken = sign({ id }, env.jwtSecret)
  await accountCollection.updateOne({ _id: id }, {
    $set: {
      accessToken
    }
  })
  return accessToken
}

describe('Survey GraphQL', () => {
  beforeAll(async () => {
    apolloServer = makeApolloServer()
    await MongoHelper.connect(process.env.MONGO_URL)
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  beforeEach(async () => {
    surveyCollection = await MongoHelper.getCollection('surveys')
    await surveyCollection.deleteMany({})
    accountCollection = await MongoHelper.getCollection('accounts')
    await accountCollection.deleteMany({})
  })

  describe('Surveys Query', () => {
    const surveysQuery = gql`     
      query surveys {
        surveys {
          id,
          question,
          answers {
            image,
            answer
          },
          date,
          didAnswer
        }
      }      
    `
    test('Should return Surveys', async () => {
      const accessToken = await makeAccessToken()
      const now = new Date()
      await surveyCollection.insertOne({
        question: 'Question',
        answers: [{
          answer: 'Answer 1',
          image: 'http://image.com'
        }, {
          answer: 'Answer 2'
        }],
        date: now
      })
      const { query } = createTestClient({
        apolloServer,
        extendMockRequest: {
          headers: {
            'x-access-token': accessToken
          }
        }
      })
      const res: any = await query(surveysQuery)
      expect(res.data.surveys.length).toBe(1)
      expect(res.data.surveys[0].id).toBeTruthy()
      expect(res.data.surveys[0].question).toBe('Question')
      expect(res.data.surveys[0].date).toBe(now.toISOString())
      expect(res.data.surveys[0].didAnswer).toBe(false)
      expect(res.data.surveys[0].answers).toEqual([{
        answer: 'Answer 1',
        image: 'http://image.com'
      }, {
        answer: 'Answer 2',
        image: null
      }])
    })

    test('Should return AccessDeniedError if no token is provided', async () => {
      const now = new Date()
      await surveyCollection.insertOne({
        question: 'Question',
        answers: [{
          answer: 'Answer 1',
          image: 'http://image.com'
        }, {
          answer: 'Answer 2'
        }],
        date: now
      })
      const { query } = createTestClient({
        apolloServer
      })
      const res: any = await query(surveysQuery)
      expect(res.data).toBeFalsy()
      expect(res.errors[0].message).toBe('Access Denied')
    })
  })
})