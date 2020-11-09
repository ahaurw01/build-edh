'use strict'

const fs = require('fs').promises
const path = require('path')
const _ = require('lodash')
const mongoose = require('mongoose')
const debug = require('debug')('ingest')
const bent = require('bent')
const moment = require('moment')

const { Card, Metadata } = require('../site/server/api/models')
const getJson = bent('json')
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/buildedh'

async function connectToDb() {
  await mongoose.connect(MONGO_URI)
  debug('connected to db')
}

async function disconnectFromDb() {
  await mongoose.disconnect()
  debug('disconnected from db')
}

async function fetchScryfallMetaInfo() {
  const bulkDataInfo = await getJson('https://api.scryfall.com/bulk-data')
  const defaultInfo = _.find(bulkDataInfo?.data, { type: 'default_cards' })
  if (!defaultInfo) {
    throw new Error('could not find default card info')
  }

  debug('fetched scryfall bulk data info:', defaultInfo)

  return {
    updatedAt: defaultInfo.updated_at,
    url: defaultInfo.download_uri,
  }
}

async function isUpdateNeeded(updatedAtscryfallUpdatedAt) {
  const metadata = await Metadata.findOne({ type: 'bulk' }).exec()
  if (!metadata) return true

  debug('update is needed')

  return moment(scryfallUpdatedAt).isAfter(moment(metadata.info.asOf))
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

async function writeMetadata(asOf) {
  return Metadata.findOneAndUpdate({ type: 'bulk' }, { asOf }).exec()
}

;(async function work() {
  try {
    await connectToDb()
    const { updatedAt, url } = await fetchScryfallMetaInfo()
    const shouldUpdate = await isUpdateNeeded(updatedAt)
    if (!shouldUpdate) {
      debug('No updated needed.')
      return
    }

    const [rawCards] = await Promise.all([getJson(url), Card.createIndexes()])
    await insertCardsToDb(rawCards)
    await writeMetadata(updatedAt)
  } catch (e) {
    debug(e)
  } finally {
    await disconnectFromDb()
  }
})()
