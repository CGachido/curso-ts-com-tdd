import { Router } from 'express'
import { adapRoute } from '../adapters/express-route-adapter'
import { makeSignUpController } from '../factories/controllers/signup/signup-controller-factory'
import { makeLoginController } from '../factories/controllers/login/login/login-controller-factory'

export default (router: Router): void => {
  router.post('/signup', adapRoute(makeSignUpController()))
  router.post('/login', adapRoute(makeLoginController()))
}
