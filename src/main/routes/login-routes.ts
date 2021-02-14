import { adapRoute } from '@/main/adapters'
import { makeSignUpController , makeLoginController } from '@/main/factories'
import { Router } from 'express'

export default (router: Router): void => {
  router.post('/signup', adapRoute(makeSignUpController()))
  router.post('/login', adapRoute(makeLoginController()))
}
