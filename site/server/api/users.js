const {
  Types: { ObjectId },
} = require('mongoose')
const { User } = require('./models')

module.exports = {
  getUser,
}

async function getUser(ctx) {
  const { id } = ctx.params
  const field = ObjectId.isValid(id) ? '_id' : 'username'
  const user = await User.findOne({ [field]: id })

  if (!user) ctx.response.status = 404
  else ctx.body = user.safeProps()
}
