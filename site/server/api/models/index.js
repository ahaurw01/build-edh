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
  owner: Schema.Types.ObjectId,
  createdAt: Date,
})
const Deck = mongoose.model('Deck', deckSchema)

module.exports = {
  User,
  Deck,
}
