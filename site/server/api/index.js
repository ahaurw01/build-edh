const koaJwt = require('koa-jwt')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')
const { me, discordLogin } = require('./auth')
const {
  ensureDeckOwner,
  createDeck,
  getDecksByOwner,
  getDeck,
  updateDeck,
  bulkUpdateDeckMiddlewares,
  addDeckCommander,
  updateDeckCommander,
  deleteDeckCommander,
  addDeckCardMiddlewares,
  updateDeckCardMiddlewares,
  deleteDeckCardMiddlewares,
  deleteDeck,
} = require('./decks')
const { getUser } = require('./users')
const { getCards, getPrintings } = require('./cards')
const { getCardPrice, getDeckPricesMiddlewares } = require('./prices')

const apiRouter = new Router({
  prefix: '/api',
})
apiRouter.use(bodyParser())

// Un-authed routes:
apiRouter.post('/login/discord', discordLogin)

apiRouter.get('/cards', getCards)
apiRouter.get('/cards/printings', getPrintings)

apiRouter.get('/decks/:id', getDeck)
apiRouter.get('/decks', getDecksByOwner)

apiRouter.get('/users/:id', getUser)

apiRouter.get('/prices/card/:tcgplayerId', getCardPrice)
apiRouter.get('/prices/deck/:deckId', ...getDeckPricesMiddlewares)

// Authed routes below here:
apiRouter.use(koaJwt({ secret: 'secret' }))

apiRouter.get('/me', me)

apiRouter.post('/decks', createDeck)

apiRouter.use('/decks/:id', ensureDeckOwner)
apiRouter.put('/decks/:id/bulk', ...bulkUpdateDeckMiddlewares)
apiRouter.put('/decks/:id', updateDeck)
apiRouter.post('/decks/:id/commanders', addDeckCommander)
apiRouter.put('/decks/:id/commanders/:uuid', updateDeckCommander)
apiRouter.delete('/decks/:id/commanders/:uuid', deleteDeckCommander)
apiRouter.post('/decks/:id/the99', ...addDeckCardMiddlewares)
apiRouter.put('/decks/:id/the99/:uuid', ...updateDeckCardMiddlewares)
apiRouter.delete('/decks/:id/the99/:uuid', ...deleteDeckCardMiddlewares)
apiRouter.delete('/decks/:id', deleteDeck)

module.exports = apiRouter
