<template>
  <div>
    <h1 class="site-header">
      BuildEDH
    </h1>
    <nuxt />
  </div>
</template>

<style>
:root {
  --gray-50: #fafafa;
  --gray-100: #f5f5f5;
  --gray-200: #eeeeee;
  --gray-300: #e0e0e0;
  --gray-400: #bdbdbd;
  --gray-500: #9e9e9e;
  --gray-600: #757575;
  --gray-700: #616161;
  --gray-800: #424242;
  --gray-900: #212121;
}

html {
  font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
  background-color: var(--gray-800);
  color: var(--gray-50);
}

*,
*:before,
*:after {
  box-sizing: border-box;
  margin: 0;
}
</style>

<style scoped>
.site-header {
  padding: 10px 15px;
  box-shadow: 0 0 0 1px var(--gray-900);
}
</style>
