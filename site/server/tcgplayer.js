const Axios = require('axios')
const createAuthRefreshInterceptor = require('axios-auth-refresh').default
const { TCGPLAYER_PUBLIC_KEY, TCGPLAYER_PRIVATE_KEY } = process.env

const axios = Axios.create()
axios.defaults.baseURL = 'http://api.tcgplayer.com/v1.36.0'

// Function that will be called to refresh authorization
const refreshAuthLogic = async () => {
  const {
    data: { access_token },
  } = await axios({
    url: 'https://api.tcgplayer.com/token',
    method: 'POST',
    data: `grant_type=client_credentials&client_id=${TCGPLAYER_PUBLIC_KEY}&client_secret=${TCGPLAYER_PRIVATE_KEY}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })

  axios.defaults.headers.common['Authorization'] = `bearer ${access_token}`
}

createAuthRefreshInterceptor(axios, refreshAuthLogic)

async function getPricesForProductIds(productIds) {
  if (!Array.isArray(productIds)) productIds = [productIds]

  try {
    const { data } = await axios.get(`/pricing/product/${productIds.join(',')}`)
    return data.results.reduce((prices, cur) => {
      return {
        ...prices,
        [cur.productId]: {
          tcgplayerId: cur.productId,
          ...(prices[cur.productId] || {}),
          [cur.subTypeName === 'Foil' ? 'usdFoil' : 'usd']: cur.midPrice,
        },
      }
    }, {})
  } catch (error) {
    throw new Error('Could not retrieve prices')
  }
}

module.exports = {
  getPricesForProductIds,
}
