module.exports = {
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/site/$1',
    '^~/(.*)$': '<rootDir>/site/$1',
    '^vue$': 'vue/dist/vue.common.js'
  },
  moduleFileExtensions: ['js', 'vue', 'json'],
  transform: {
    '^.+\\.js$': 'babel-jest',
    '.*\\.(vue)$': 'vue-jest'
  }
}
