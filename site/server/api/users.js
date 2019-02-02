const { User } = require('./models')

module.exports = {
  getUser,
}

async function getUser(ctx) {
  const { id } = ctx.params
  const user = await User.findById(id)
  if (!user) ctx.response.status = 404
  else ctx.body = user.safeProps()
}
