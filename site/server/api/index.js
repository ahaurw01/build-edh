const koaJwt = require('koa-jwt')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')
const mongoose = require('mongoose')
const { login, register, me } = require('./auth')
const {
  ensureDeckOwner,
  createDeck,
  getMyDecks,
  getDeck,
  updateDeck,
  addDeckCommander,
  updateDeckCommander,
  deleteDeckCommander,
} = require('./decks')
const { getUser } = require('./users')
const { getCards } = require('./cards')

const apiRouter = new Router({
  prefix: '/api',
})
apiRouter.use(bodyParser())

// Un-authed routes:
apiRouter.post('/login', login)
apiRouter.post('/register', register)

apiRouter.get('/cards', getCards)

// Authed routes:
apiRouter.use(koaJwt({ secret: 'secret' }))

apiRouter.get('/me', me)

apiRouter.post('/decks', createDeck)
apiRouter.get('/decks/mine', getMyDecks)
apiRouter.get('/decks/:id', getDeck)

apiRouter.use('/decks/:id', ensureDeckOwner)
apiRouter.put('/decks/:id', updateDeck)
apiRouter.post('/decks/:id/commanders', addDeckCommander)
apiRouter.put('/decks/:id/commanders/:uuid', updateDeckCommander)
apiRouter.delete('/decks/:id/commanders/:uuid', deleteDeckCommander)

apiRouter.get('/users/:id', getUser)

module.exports = apiRouter

mongoose.connect('mongodb://localhost:27017/buildedh')
