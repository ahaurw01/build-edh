const _ = require('lodash')
const mongoose = require('mongoose')
const { Schema } = mongoose

const userSchema = new Schema({
  username: String,
  passwordHash: String,
})
userSchema.methods.safeProps = function() {
  return {
    username: this.username,
    _id: this._id,
  }
}
const User = mongoose.model('User', userSchema)

const deckCardSchema = {
  uuid: String,
  scryfallId: String,
  purposes: [String],
  isFoil: Boolean,
}

const deckSchema = new Schema({
  name: String,
  purpose: String,
  description: String,
  compuPurposes: [Object],
  owner: Schema.Types.ObjectId,
  createdAt: Date,
  commanders: [deckCardSchema],
  the99: [deckCardSchema],
})
const Deck = mongoose.model('Deck', deckSchema)

const cardSchema = new Schema({
  scryfallId: { type: String, index: true },
  oracleId: String,
  name: { type: String, index: true },
  cmc: { type: Number, index: true },
  ci: { type: [String], index: true },
  isLegal: Boolean,
  existsInFoil: Boolean,
  existsInNonFoil: Boolean,
  rarity: String,
  setCode: String,
  setName: String,
  canHaveMultiple: Boolean,
  imageUris: { large: String, small: String },
  typeLine: String,
  canBeCommander: { type: Boolean, index: true },
  isPartner: { type: Boolean, index: true },
  partnerWith: String,
  faces: [
    {
      name: String,
      imageUris: { large: String, small: String },
      manaCost: String,
      typeLine: String,
      types: { type: [String], index: true },
      superTypes: { type: [String], index: true },
      subTypes: { type: [String], index: true },
      oracleText: String,
      power: String,
      toughness: String,
      colors: [String],
      loyalty: String,
    },
  ],
})
const dash = '—'
const types = [
  'Land',
  'Creature',
  'Artifact',
  'Enchantment',
  'Planeswalker',
  'Instant',
  'Sorcery',
  'Tribal',
]
cardSchema.statics.typeLineToTypes = function(typeLine = '') {
  return typeLine
    .split(dash)[0]
    .trim()
    .split(' ')
    .filter(item => types.includes(item))
}
cardSchema.statics.typeLineToSuperTypes = function(typeLine = '') {
  return typeLine
    .split(dash)[0]
    .trim()
    .split(' ')
    .filter(item => !types.includes(item))
}
cardSchema.statics.typeLineToSubTypes = function(typeLine = '') {
  return (typeLine.split(dash)[1] || '').trim().split(' ')
}
cardSchema.statics.canHaveMultiple = function(scryfallData) {
  const oracleText = scryfallData.card_faces
    ? scryfallData.card_faces.map(face => face.oracle_text).join('')
    : scryfallData.oracle_text

  return (
    (scryfallData.type_line || '').startsWith(`Basic Land ${dash}`) ||
    (scryfallData.type_line || '').startsWith(`Basic Snow Land ${dash}`) ||
    (scryfallData.type_line || '') ===
      'Basic Land' /* Captures the Wastes case */ ||
    oracleText.includes('A deck can have any number of cards named')
  )
}
cardSchema.statics.canBeCommander = function(doc) {
  const { types, superTypes, oracleText } = doc.faces[0]
  const isLegendaryCreature =
    types.includes('Creature') && superTypes.includes('Legendary')
  if (isLegendaryCreature) return true

  const oracleSaysSo = oracleText.includes('can be your commander.')
  return oracleSaysSo
}
cardSchema.statics.isPartner = function(doc) {
  const { oracleText } = doc.faces[0]
  return (
    oracleText.startsWith('Partner with') ||
    oracleText.includes('\nPartner with') ||
    oracleText.includes('Partner (You can have')
  )
}
cardSchema.statics.partnerWith = function(doc) {
  // Relies on isPartner applied to the doc.
  //
  const { isPartner } = doc
  if (!isPartner) return

  const { oracleText } = doc.faces[0]
  const partnerNameRegexp = /Partner with ([-_,.'"!?/\w ]+)( \(|\n)/
  const result = partnerNameRegexp.exec(oracleText)
  if (!result) return null
  return result[1]
}
cardSchema.statics.upsertCardFromScryfallData = function(rawCard) {
  const Card = this

  if (!rawCard.games.includes('paper')) {
    return Card.deleteOne({
      scryfallId: rawCard.id,
    })
  }

  const doc = {
    scryfallId: rawCard.id,
    oracleId: rawCard.oracle_id,
    name: rawCard.name,
    cmc: rawCard.cmc,
    ci: rawCard.color_identity,
    isLegal: rawCard.legalities.commander === 'legal',
    existsInFoil: rawCard.foil,
    existsInNonFoil: rawCard.nonfoil,
    rarity: rawCard.rarity,
    setCode: rawCard.set,
    setName: rawCard.set_name,
    canHaveMultiple: Card.canHaveMultiple(rawCard),
    imageUris: _.pick(rawCard.image_uris || {}, ['large', 'small']),
    typeLine: rawCard.type_line,
    faces: (rawCard.card_faces || [rawCard]).map(rawFace => ({
      name: rawFace.name,
      imageUris: _.pick(rawFace.image_uris || {}, ['large', 'small']),
      manaCost: rawFace.mana_cost,
      typeLine: rawFace.type_line,
      types: Card.typeLineToTypes(rawFace.type_line),
      superTypes: Card.typeLineToSuperTypes(rawFace.type_line),
      subTypes: Card.typeLineToSubTypes(rawFace.type_line),
      oracleText: rawFace.oracle_text,
      power: rawFace.power,
      toughness: rawFace.toughness,
      colors: rawFace.colors,
      loyalty: rawFace.loyalty,
    })),
  }
  doc.canBeCommander = Card.canBeCommander(doc)
  doc.isPartner = Card.isPartner(doc)
  doc.partnerWith = Card.partnerWith(doc)

  return Card.updateOne({ scryfallId: doc.scryfallId }, doc, { upsert: true })
}

const Card = mongoose.model('Card', cardSchema)

const allCardFieldsGroup = {
  ...Object.keys(Card.schema.paths).reduce((acc, key) => {
    key = key.split('.')[0]
    acc[key] = { $last: `$${key}` }
    return acc
  }, {}),
  _id: '$name',
}

/**
 * Find cards with given name regular expressions and sets.
 *
 * @param {Object[]} filters  {nameRegex, setCode}
 *
 * @return {Card[]}
 */
Card.findWithNames = async filters => {
  const cards = []
  for (const { nameRegex, setCode } of filters) {
    const query = {
      name: { $regex: nameRegex },
    }
    if (setCode) query.setCode = setCode
    const card = await Card.findOne(query)
    if (card) cards.push(card)
  }

  return cards
}

module.exports = {
  User,
  Deck,
  Card,
  allCardFieldsGroup,
}
