# Card Source Setup

```
$ mkdir -p card-source/data
$ curl -o card-source/data/scryfall-default-cards.json \
    https://archive.scryfall.com/json/scryfall-default-cards.json
$ docker-compose up -d
$ DEBUG=ingest node card-source/ingest.js
```

The json file is too large for github, so we download it as needed and gitignore the data directory.

`ingest.js` can be run multiple times with no ill effects. It only updates cards if needed.
