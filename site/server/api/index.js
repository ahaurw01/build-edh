const koaJwt = require('koa-jwt')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')
const { login, register, me } = require('./auth')
const {
  ensureDeckOwner,
  createDeck,
  getMyDecks,
  getDeck,
  updateDeck,
  bulkUpdateDeck,
  addDeckCommander,
  updateDeckCommander,
  deleteDeckCommander,
  addDeckCard,
  deleteDeckCard,
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

// Authed routes below here:
apiRouter.use(koaJwt({ secret: 'secret' }))

apiRouter.get('/me', me)

apiRouter.post('/decks', createDeck)
apiRouter.get('/decks/mine', getMyDecks)
apiRouter.get('/decks/:id', getDeck)

apiRouter.use('/decks/:id', ensureDeckOwner)
apiRouter.put('/decks/:id', updateDeck)
apiRouter.put('/decks/:id/bulk', bulkUpdateDeck)
apiRouter.post('/decks/:id/commanders', addDeckCommander)
apiRouter.put('/decks/:id/commanders/:uuid', updateDeckCommander)
apiRouter.delete('/decks/:id/commanders/:uuid', deleteDeckCommander)
apiRouter.post('/decks/:id/the99', addDeckCard)
apiRouter.delete('/decks/:id/the99/:uuid', deleteDeckCard)

apiRouter.get('/users/:id', getUser)

module.exports = apiRouter
