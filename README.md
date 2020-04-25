# edhlist

## Card database setup

See the [card-source README](./card-source/README.md).

## Site dev setup

Create a .env file with the following contents:

```
export DISCORD_CLIENT_SECRET=...
export TCGPLAYER_PUBLIC_KEY=...
export TCGPLAYER_PRIVATE_KEY=...
export JWT_SECRET=secretttt
```

```
$ nvm install # or nvm use
$ yarn
$ npm run dev
```
