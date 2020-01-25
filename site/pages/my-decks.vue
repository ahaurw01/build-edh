<template>
  <div />
</template>

<script>
export default {
  middleware({ store, redirect }) {
    return redirect(`/decks/${store.state.auth.user.username}`)
  },
}
</script>
