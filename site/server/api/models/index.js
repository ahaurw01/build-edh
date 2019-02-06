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

const deckSchema = new Schema({
  name: String,
  purpose: String,
  description: String,
  owner: Schema.Types.ObjectId,
  createdAt: Date,
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
  imageUri: String,
  typeLine: String,
  faces: [
    {
      name: String,
      imageUri: String,
      manaCost: String,
      typeLine: String,
      types: { type: [String], index: true },
      superTypes: { type: [String], index: true },
      subTypes: { type: [String], index: true },
      oracleText: String,
      power: String,
      toughness: String,
      colors: [String],
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
    oracleText.includes('A deck can have any number of cards named')
  )
}
cardSchema.statics.upsertCardFromScryfallData = function(rawCard) {
  const Card = this
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
    imageUri: (rawCard.image_uris || {}).large,
    typeLine: rawCard.type_line,
    faces: (rawCard.card_faces || [rawCard]).map(rawFace => ({
      name: rawFace.name,
      imageUri: (rawFace.image_uris || {}).large,
      manaCost: rawFace.mana_cost,
      typeLine: rawFace.type_line,
      types: Card.typeLineToTypes(rawFace.type_line),
      superTypes: Card.typeLineToSuperTypes(rawFace.type_line),
      subTypes: Card.typeLineToSubTypes(rawFace.type_line),
      oracleText: rawFace.oracle_text,
      power: rawFace.power,
      toughness: rawFace.toughness,
      colors: rawFace.colors,
    })),
  }

  return Card.updateOne({ scryfallId: doc.scryfallId }, doc, { upsert: true })
}

const Card = mongoose.model('Card', cardSchema)

module.exports = {
  User,
  Deck,
  Card,
}
