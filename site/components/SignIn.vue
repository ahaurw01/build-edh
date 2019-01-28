<template>
  <div>
    <h2>Sign in to get started.</h2>
    <div>
      <a href="/sign-in/google">
        <i class="fab fa-google"></i>
        <span>Google</span>
      </a>
      <a href="/sign-in/facebook">
        <i class="fab fa-facebook"></i>
        <span>Facebook</span>
      </a>
      <a href="/sign-in/twitter">
        <i class="fab fa-twitter"></i>
        <span>Twitter</span>
      </a>
    </div>
  </div>
</template>

<script></script>

<style scoped>
h2 {
  text-align: center;
  margin: 10px 0;
}
a {
  display: flex;
  align-items: center;
  margin: 10px auto;
  max-width: 350px;
  font-size: 25px;
  text-decoration: none;
  color: var(--gray-50);
  background-color: var(--gray-700);
  border: 1px solid var(--gray-900);
  border-radius: 4px;
  padding: 10px;
}

a i {
  flex: 0;
}

a span {
  flex: 1;
  text-align: center;
}
</style>
