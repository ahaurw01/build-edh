<template>
  <Component
    :is="wrappingElement"
    v-bind="wrappingElementProps"
    v-on="$listeners"
  >
    <div :class="size" class="mtg-card">
      <span v-if="count > 1" class="count">x{{ count }}</span>
      <img :src="imgSrc" />
    </div>
  </Component>
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
  },
  computed: {
    imgSrc() {
      return this.size === 'x-small'
        ? this.card.imageUris.small
        : this.card.imageUris.large
    },
    wrappingElement() {
      return this.$listeners.click ? 'a' : 'div'
    },
    wrappingElementProps() {
      return this.wrappingElement === 'a' ? { href: '#' } : {}
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
  /*background: radial-gradient(circle, #000 0%, rgba(0, 0, 0, 0) 100%);*/
  font-size: 0.9rem;
  /*border-radius: 0.25rem;*/
  padding: 0.1rem;
}
</style>
