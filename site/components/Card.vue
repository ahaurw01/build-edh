<template>
  <div
    :class="typeof size === 'number' ? 'exact' : size"
    :style="styleFromSize"
    class="mtg-card"
  >
    <span v-if="count > 1" class="count">x{{ count }}</span>
    <img
      :src="loading || faceDown ? placeholderSrc : imgSrc"
      :class="{ 'special-shadow': specialShadow, loading }"
      draggable="false"
    />
    <button
      v-if="showEditButton"
      class="button edit-button"
      @click.prevent="$emit('edit-card')"
    >
      <BIcon icon="pencil" />
    </button>
    <div v-if="isFoil || isOnlyEverFoil" class="foil-overlay" />
  </div>
</template>

<script>
import get from 'lodash/get'
import { placeholderSrc } from './InlineImage'

export default {
  props: {
    card: { type: Object, required: true },
    size: {
      type: [String, Number],
      default: 'auto',
      validator(value) {
        return (
          (typeof value === 'string' &&
            ['large', 'medium', 'small', 'x-small', 'auto'].indexOf(value) !==
              -1) ||
          (typeof value === 'number' && value > 0)
        )
      },
    },
    count: { type: Number, default: 1 },
    showEditButton: { type: Boolean, default: false },
    specialShadow: { type: Boolean, default: false },
    isFoil: { type: Boolean, default: false },
    reverse: { type: Boolean, default: false },
    faceDown: { type: Boolean, default: false },
  },

  data() {
    return {
      placeholderSrc,
      loading: true,
      image: null,
    }
  },

  computed: {
    imgSrc() {
      const faceIndex = this.reverse ? 1 : 0
      const size =
        typeof this.size === 'number'
          ? this.size <= 100
            ? 'small'
            : 'large'
          : this.size === 'x-small'
          ? 'small'
          : 'large'
      return get(
        this,
        `card.faces[${faceIndex}].imageUris.${size}`,
        get(this, `card.imageUris.${size}`)
      )
    },

    isOnlyEverFoil() {
      return !this.card.existsInNonFoil
    },

    styleFromSize() {
      if (typeof this.size === 'number') {
        return { width: `${this.size}px` }
      }
      return {}
    },
  },

  mounted() {
    this.fetchImage()
  },

  updated() {
    this.fetchImage()
  },

  methods: {
    fetchImage() {
      if (this.image) return
      const image = document.createElement('img')
      image.src = this.imgSrc
      image.onload = () => {
        this.loading = false
      }
      this.image = image
    },
  },
}
</script>

<style scoped>
.mtg-card {
  position: relative;
}
.mtg-card:not(.auto):not(.x-small):not(.exact) {
  display: inline-block;
  margin: 0.25rem;
}

.exact {
  line-height: 0;
}

:not(.x-small) > img {
  border-radius: 4.75% / 3.5%;
  width: 100%;
  box-shadow: 0 0 4px 4px rgba(0, 0, 0, 0.25);
}

img.special-shadow {
  box-shadow: 0 0 4px 3px hsl(48, 100%, 67%);
}

.loading {
  filter: grayscale(0.5);
}

.large {
  max-width: 20rem;
}
.medium {
  max-width: 15rem;
}
.small {
  max-width: 10rem;
}
.x-small {
  max-width: 4rem;
}

.count {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  color: #eee;
  background: rgba(0, 0, 0, 0.75);
  font-size: 0.95rem;
  padding: 0.2rem 0.3rem 0.3rem;
  line-height: 1;
  border-radius: 0 0 50% 50%;
}

.edit-button {
  position: absolute;
  left: 1rem;
  bottom: 1rem;
  opacity: 0.75;
}

.foil-overlay {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  border-radius: 4.75% / 3.5%;
  background: linear-gradient(
    135deg,
    rgba(253, 187, 45, 0.25) 0%,
    rgba(254, 106, 105, 0.25) 25%,
    rgba(254, 124, 246, 0.25) 50%,
    rgba(207, 255, 177, 0.25) 75%,
    rgba(255, 226, 164, 0.25) 100%
  );
  pointer-events: none;
}
</style>
