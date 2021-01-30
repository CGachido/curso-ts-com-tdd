import { adapRoute } from '@/main/adapters/express-route-adapter'
import { adminAuth } from '@/main/middlewares/admin-auth'
import { auth } from '@/main/middlewares/auth'
import { makeAddSurveyController } from '@/main/factories/controllers/survey/add-survey/add-survey-controller-factory'
import { makeLoadSurveysController } from '@/main/factories/controllers/survey/load-surveys/load-surveys-controller-factory'
import { Router } from 'express'

export default (router: Router): void => {
  router.post('/surveys', adminAuth, adapRoute(makeAddSurveyController()))
  router.get('/surveys', auth, adapRoute(makeLoadSurveysController()))
}
