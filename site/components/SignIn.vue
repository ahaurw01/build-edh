<template>
  <div>
    <h4 class="subtitle is-4 has-text-centered">
      Register or log in to get started.
    </h4>
    <BTabs position="is-centered">
      <BTabItem label="Register">
        <section class="columns is-centered">
          <form class="column is-half-tablet" @submit.prevent="register">
            <BField
              label="New Username"
              :type="registerUsernameType"
              :message="registerUsernameError"
            >
              <BInput
                v-model="username"
                placeholder="Username"
                icon="account"
                required
              />
            </BField>
            <BField label="New Password">
              <BInput
                v-model="password"
                type="password"
                icon="key"
                placeholder="Password"
                password-reveal
                required
              />
            </BField>
            <BField class="has-text-centered">
              <button type="submit" class="button is-primary">
                Register
              </button>
            </BField>
          </form>
        </section>
      </BTabItem>

      <BTabItem label="Log In">
        <section class="columns is-centered">
          <form class="column is-half-tablet" @submit.prevent="logIn">
            <BField label="Username">
              <BInput
                v-model="username"
                placeholder="Username"
                icon="account"
                required
              />
            </BField>
            <BField
              label="Password"
              :type="loginPasswordType"
              :message="loginPasswordError"
            >
              <BInput
                v-model="password"
                type="password"
                icon="key"
                placeholder="Password"
                password-reveal
                required
              />
            </BField>
            <BField class="has-text-centered">
              <button type="submit" class="button is-primary">
                Log In
              </button>
            </BField>
          </form>
        </section>
      </BTabItem>
    </BTabs>
  </div>
</template>

<script>
/* eslint-disable no-console */
export default {
  data: function() {
    return {
      username: '',
      password: '',
      registerUsernameError: '',
      loginPasswordError: '',
    }
  },
  computed: {
    registerUsernameType() {
      return this.registerUsernameError ? 'is-danger' : null
    },
    loginPasswordType() {
      return this.loginPasswordError ? 'is-danger' : null
    },
  },
  methods: {
    register() {
      this.$auth
        .loginWith('local', {
          data: {
            username: this.username,
            password: this.password,
          },
          url: '/api/register',
        })
        .catch(({ response }) => {
          if (response && response.data) {
            this.registerUsernameError = response.data
          } else {
            this.registerUsernameError = ''
          }
        })
    },
    logIn() {
      this.$auth
        .loginWith('local', {
          data: {
            username: this.username,
            password: this.password,
          },
        })
        .catch(({ response }) => {
          console.log(response)
          if (response && response.status === 401) {
            this.loginPasswordError = 'Username/password combo not found.'
          } else {
            this.loginPasswordError = ''
          }
        })
    },
  },
}
</script>
