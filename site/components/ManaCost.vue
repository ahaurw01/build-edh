<template>
  <span>
    <i
      v-for="(symbol, index) in symbols"
      :key="index"
      class="ms ms-cost ms-shadow"
      :class="symbol"
    />
  </span>
</template>

<script>
const map = {
  '{W}': 'ms-w',
  '{U}': 'ms-u',
  '{B}': 'ms-b',
  '{R}': 'ms-r',
  '{G}': 'ms-g',
  '{C}': 'ms-c',
  '{P}': 'ms-p',
  '{W/P}': 'ms-wp',
  '{U/P}': 'ms-up',
  '{B/P}': 'ms-bp',
  '{R/P}': 'ms-rp',
  '{G/P}': 'ms-gp',
  '{2/B}': 'ms-2b',
  '{2/G}': 'ms-2g',
  '{2/R}': 'ms-2r',
  '{2/U}': 'ms-2u',
  '{2/W}': 'ms-2w',
  '{B/G}': 'ms-bg',
  '{B/R}': 'ms-br',
  '{G/U}': 'ms-gu',
  '{G/W}': 'ms-gw',
  '{R/G}': 'ms-rg',
  '{R/W}': 'ms-rw',
  '{U/B}': 'ms-ub',
  '{U/R}': 'ms-ur',
  '{W/B}': 'ms-wb',
  '{W/U}': 'ms-wu',
  '{0}': 'ms-0',
  '{1}': 'ms-1',
  '{2}': 'ms-2',
  '{3}': 'ms-3',
  '{4}': 'ms-4',
  '{5}': 'ms-5',
  '{6}': 'ms-6',
  '{7}': 'ms-7',
  '{8}': 'ms-8',
  '{9}': 'ms-9',
  '{10}': 'ms-10',
  '{11}': 'ms-11',
  '{12}': 'ms-12',
  '{13}': 'ms-13',
  '{14}': 'ms-14',
  '{15}': 'ms-15',
  '{16}': 'ms-16',
  '{17}': 'ms-17',
  '{18}': 'ms-18',
  '{19}': 'ms-19',
  '{20}': 'ms-20',
  '{100}': 'ms-100',
  '{1000000}': 'ms-1000000',
  '{S}': 'ms-s',
  '{X}': 'ms-x',
  '{Y}': 'ms-y',
  '{Z}': 'ms-z',
  '{E}': 'ms-e',
  '{T}': 'ms-tap',
  '{Q}': 'ms-untap',
  '{CHAOS}': 'ms-chaos',
}

export default {
  props: {
    manaCost: {
      type: String,
      default() {
        return ''
      },
    },
  },

  computed: {
    symbols() {
      const regexp = /([{].*?[}])/g
      let result = null
      const symbols = []
      while ((result = regexp.exec(this.manaCost))) {
        result[1] && symbols.push(result[1])
      }

      return symbols.map(symbol => map[symbol])
    },
  },
}
</script>
