const Koa = require('koa')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const mongoose = require('mongoose')
const { default: sslify, xForwardedProtoResolver } = require('koa-sslify')
const config = require('../nuxt.config.js')
const apiRouter = require('./api')

// Acknowledge deprecations
mongoose.set('useFindAndModify', false)

const app = new Koa()

if (app.env === 'production')
  app.use(sslify({ resolver: xForwardedProtoResolver }))
app.use(apiRouter.routes()).use(apiRouter.allowedMethods())

config.dev = !(app.env === 'production')

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/buildedh'

async function start() {
  await mongoose.connect(MONGO_URI)
  // Instantiate nuxt.js
  const nuxt = new Nuxt(config)
  await nuxt.ready()

  const {
    host = process.env.HOST || '127.0.0.1',
    port = process.env.PORT || 3000,
  } = nuxt.options.server

  // Build in development
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  }

  app.use((ctx, next) => {
    if (ctx.path.startsWith('/api')) return next()
    ctx.status = 200
    ctx.respond = false // Bypass Koa's built-in response handling
    ctx.req.ctx = ctx // This might be useful later on, e.g. in nuxtServerInit or with nuxt-stash
    nuxt.render(ctx.req, ctx.res)
  })

  app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true,
  })
}

if (require.main === module) start()

module.exports = { app }
