const supertest = require('supertest')
const { app } = require('../../../server')

const server = app.callback()

describe('auth endpoints', () => {
  describe('me', () => {
    test('it provides current user', async () => {
      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFhcm9uIiwiX2lkIjoiNWM3MTlkNDhhYmZlYTNlMDgxNDNmNGIxIiwiaWF0IjoxNTUwOTQ5NzA0fQ.MYbWyUCcVippNrMpWVgWXog35tT_8HcXwaybBuH1AJw'

      await supertest(server)
        .get('/api/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect({
          username: 'aaron',
          _id: '5c719d48abfea3e08143f4b1',
          iat: 1550949704,
        })
    })
  })
})
