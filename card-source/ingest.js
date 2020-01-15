'use strict'

const fs = require('fs').promises
const path = require('path')
const _ = require('lodash')
const mongoose = require('mongoose')
const debug = require('debug')('ingest')

const { Card } = require('../site/server/api/models')
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/buildedh'

async function connectToDb() {
  await mongoose.connect(MONGO_URI)
  debug('connected to db')
}

async function disconnectFromDb() {
  await mongoose.disconnect()
  debug('disconnected from db')
}

async function readAllCardsFromFile() {
  const fileContents = await fs.readFile(
    path.join(__dirname, '/data/scryfall-default-cards.json'),
    'utf8'
  )
  return JSON.parse(fileContents)
}

async function insertCardsToDb(rawCards) {
  debug(`processing ${rawCards.length} cards`)
  const chunks = _.chunk(rawCards, 100)
  let numCardsProcessed = 0

  for (const chunk of chunks) {
    await Promise.all(
      chunk.map(rawCard =>
        Card.upsertCardFromScryfallData(rawCard).catch(debug)
      )
    ).then(() => {
      numCardsProcessed += chunk.length
      debug(`processed ${numCardsProcessed} cards`)
    })
  }
}

;(async function work() {
  try {
    await connectToDb()
    const [rawCards] = await Promise.all([
      readAllCardsFromFile(),
      Card.createIndexes(),
    ])
    await insertCardsToDb(rawCards)
  } catch (e) {
    debug(e)
  } finally {
    await disconnectFromDb()
  }
})()
