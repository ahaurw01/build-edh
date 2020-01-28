const pkg = require('../package')

const baseURL = process.env.BASE_URL || 'http://localhost:3333'

module.exports = {
  baseURL,

  DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,

  mode: 'universal',

  /*
   ** Headers of the page
   */
  head: {
    title: pkg.name,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: pkg.description },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },

  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#fff' },

  /*
   ** Global CSS
   */
  css: [],

  /*
   ** Plugins to load before mounting the App
   */
  plugins: [],

  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/pwa',
    '@nuxtjs/auth',
    'nuxt-buefy',
  ],
  /*
   ** Axios module configuration
   */
  axios: {
    baseURL,
  },

  /*
   ** Auth config
   */
  auth: {
    plugins: ['~/plugins/auth.js'],
    redirect: {
      login: '/',
      logout: '/',
      home: '/my-decks',
      callback: '/',
    },
    strategies: {
      discord: {
        _scheme: 'oauth2',
        authorization_endpoint: 'https://discordapp.com/api/oauth2/authorize',
        access_token_endpoint: '/api/login/discord',
        userinfo_endpoint: '/api/me',
        scope: ['identify', 'email'],
        response_type: 'code',
        redirect_uri: baseURL,
        client_id: '671516199460274178',
      },
    },
  },

  router: {
    middleware: ['auth'],
  },

  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {
      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/,
        })
      }
    },
  },

  server: {
    port: process.env.PORT || 3333,
  },
  srcDir: 'site',
}
