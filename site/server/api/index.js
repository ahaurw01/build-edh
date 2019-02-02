const koaJwt = require('koa-jwt')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')
const mongoose = require('mongoose')
const { login, register } = require('./auth')

const apiRouter = new Router({
  prefix: '/api',
})
apiRouter.use(bodyParser())
apiRouter.post('/login', login)
apiRouter.post('/register', register)
apiRouter.use(koaJwt({ secret: 'secret' }))
apiRouter.get('/me', ctx => {
  ctx.body = ctx.state.user
})

module.exports = apiRouter

mongoose.connect('mongodb://localhost:27017/buildedh')
