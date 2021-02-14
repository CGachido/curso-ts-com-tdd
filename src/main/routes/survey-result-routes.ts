import { makeSaveSurveyResultController , makeLoadSurveyResultController } from '@/main/factories'
import { adapRoute } from '@/main/adapters'
import { auth } from '@/main/middlewares'
import { Router } from 'express'

export default (router: Router): void => {
  router.put('/surveys/:surveyId/results', auth, adapRoute(makeSaveSurveyResultController()))
  router.get('/surveys/:surveyId/results', auth, adapRoute(makeLoadSurveyResultController()))
}
