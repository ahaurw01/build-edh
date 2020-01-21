<template>
  <div :class="size" class="mtg-card">
    <span v-if="count > 1" class="count">x{{ count }}</span>
    <img :src="imgSrc" :class="{ 'special-shadow': specialShadow }" />
    <button
      v-if="showEditButton"
      class="button edit-button"
      @click.prevent="$emit('edit-card')"
    >
      <BIcon icon="pencil" />
    </button>
    <div v-if="card.isFoil" class="foil-overlay" />
  </div>
</template>

<script>
export default {
  props: {
    card: { type: Object, required: true },
    size: {
      type: String,
      default: 'auto',
      validator(value) {
        return (
          ['large', 'medium', 'small', 'x-small', 'auto'].indexOf(value) !== -1
        )
      },
    },
    count: { type: Number, default: 1 },
    showEditButton: { type: Boolean, default: false },
    specialShadow: { type: Boolean, default: false },
  },
  computed: {
    imgSrc() {
      return this.size === 'x-small'
        ? this.card.imageUris.small
        : this.card.imageUris.large
    },
  },
}
</script>

<style scoped>
.mtg-card {
  position: relative;
}
.mtg-card:not(.auto):not(.x-small) {
  display: inline-block;
  margin: 0.25rem;
}

:not(.x-small) > img {
  border-radius: 4.75% / 3.5%;
  width: 100%;
  box-shadow: 0 0 4px 4px rgba(0, 0, 0, 0.25);
}

img.special-shadow {
  box-shadow: 0 0 6px 6px hsl(48, 100%, 67%);
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
  font-size: 0.9rem;
  padding: 0.1rem;
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
    rgba(253, 187, 45, 0.3) 0%,
    rgba(254, 106, 105, 0.3) 25%,
    rgba(254, 124, 246, 0.3) 50%,
    rgba(207, 255, 177, 0.3) 75%,
    rgba(255, 226, 164, 0.3) 100%
  );
  pointer-events: none;
}
</style>
