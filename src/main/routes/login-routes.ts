import { adapRoute } from '@/main/adapters/express-route-adapter'
import { makeSignUpController } from '@/main/factories/controllers/signup/signup-controller-factory'
import { makeLoginController } from '@/main/factories/controllers/login/login/login-controller-factory'
import { Router } from 'express'

export default (router: Router): void => {
  router.post('/signup', adapRoute(makeSignUpController()))
  router.post('/login', adapRoute(makeLoginController()))
}
