const koaJwt = require('koa-jwt')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')
const { login } = require('./auth')

const apiRouter = new Router({
  prefix: '/api',
})
apiRouter.use(bodyParser())
apiRouter.post('/login', login)
apiRouter.use(koaJwt({ secret: 'secret' }))
apiRouter.get('/me', ctx => {
  ctx.body = ctx.state.user
})

module.exports = apiRouter
