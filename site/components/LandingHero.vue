<template>
  <div>
    <div class="card-container">
      <div
        v-for="display in displays"
        :key="display.card.name"
        :class="display.class"
      >
        <Card :card="display.card" />
      </div>
    </div>
  </div>
</template>

<script>
import shuffle from 'array-shuffle'
import Card from '~/components/Card.vue'
const popularCardNames = [
  'Sol Ring',
  'Cyclonic Rift',
  'Swords to Plowshares',
  'Cultivate',
  'Counterspell',
  'Eternal Witness',
  'Izzet Signet',
  'Rakdos Signet',
  'Orzhov Signet',
  "Kodama's Reach",
  'Dimir Signet',
  'Boros Signet',
  'Putrefy',
  'Azorius Signet',
  'Anguished Unmaking',
  'Merciless Eviction',
  'Sakura-Tribe Elder',
  'Simic Signet',
  'Lightning Greaves',
  'Demonic Tutor',
  'Supreme Verdict',
  'Utter End',
  'Path to Exile',
  "Mirari's Wake",
  'Golgari Signet',
  'Phyrexian Arena',
  'Beast Within',
  'Swiftfoot Boots',
  'Brainstorm',
  'Sun Titan',
  'Boros Charm',
  'Enlightened Tutor',
  'Terminate',
  'Mortify',
  'Diabolic Tutor',
  'Rhystic Study',
  'Acidic Slime',
  'Krosan Grip',
  'Wrath of God',
  'Blasphemous Act',
  'Birds of Paradise',
  'Mystical Tutor',
  'Gruul Signet',
  'Solemn Simulacrum',
  'Selesnya Signet',
  'Chaos Warp',
  'Reclamation Sage',
  'Sylvan Library',
  'Return to Dust',
  'Explosive Vegetation',
  'Vandalblast',
  'Aura Shards',
  'Deathrite Shaman',
  'Ponder',
  'Crackling Doom',
  'Coiling Oracle',
  'Chromatic Lantern',
  'Skullclamp',
  'Vampiric Tutor',
  "Commander's Sphere",
  'Rampant Growth',
  'Avenger of Zendikar',
  'Fact or Fiction',
  'Gisela, Blade of Goldnight',
  'Temur Ascendancy',
  "Green Sun's Zenith",
  'Farseek',
  'Ghostly Prison',
  'Llanowar Elves',
  'Nicol Bolas, Planeswalker',
  'Swan Song',
  'Propaganda',
  'Tamiyo, Field Researcher',
  'Elvish Mystic',
  'Iroas, God of Victory',
  'Wood Elves',
  'Decimate',
  'Oblivion Ring',
  'Darksteel Ingot',
  'Xenagos, God of Revels',
  'Preordain',
  'Rakdos Charm',
  'Oracle of Mul Daya',
  'Arcane Denial',
  'Venser, the Sojourner',
  'Prime Speaker Zegana',
  'Aurelia, the Warleader',
  'Rite of Replication',
  'Conflux',
  'Vindicate',
  'Gilded Lotus',
  'Baleful Strix',
  'Negate',
  'Maelstrom Wanderer',
  'Toxic Deluge',
  'Abzan Charm',
  'Assemble the Legion',
  'Worldly Tutor',
  "Elspeth, Sun's Champion",
  'Counterflux',
]
export default {
  components: {
    Card,
  },
  data() {
    const uriStart = 'https://api.scryfall.com/cards/named?exact='
    const uriEnd = '&format=image'
    const toUse = shuffle(popularCardNames).slice(0, 3)
    const uri = name => `${uriStart}${encodeURIComponent(name)}${uriEnd}`
    return {
      displays: [
        {
          class: 'card-left',
          card: {
            name: toUse[0],
            imageUris: {
              large: uri(toUse[0]),
            },
            existsInFoil: false,
            existsInNonFoil: true,
          },
        },
        {
          class: 'card-middle',
          card: {
            name: toUse[1],
            imageUris: {
              large: uri(toUse[1]),
            },
            existsInFoil: false,
            existsInNonFoil: true,
          },
        },
        {
          class: 'card-right',
          card: {
            name: toUse[2],
            imageUris: {
              large: uri(toUse[2]),
            },
            existsInFoil: false,
            existsInNonFoil: true,
          },
        },
      ],
    }
  },
}
</script>

<style scoped>
.card-container {
  margin: -20px 0 10px;
  display: flex;
}

@media (min-width: 769px) {
  .card-container {
    margin: 40px 0;
  }
}

.card-left,
.card-middle,
.card-right {
  max-width: 33%;
}

.card-left img,
.card-middle img,
.card-right img {
  box-shadow: 0 0 4px 4px rgba(0, 0, 0, 0.25);
}

@media (min-width: 480px) {
  .card-container {
    max-width: 1000px;
    margin-left: auto;
    margin-right: auto;
  }
}

.card-middle {
  z-index: 1;
}

.card-left {
  transform: scale(0.85) translateX(15%);
}

.card-right {
  transform: scale(0.85) translateX(-15%);
}
</style>
