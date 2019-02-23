const supertest = require('supertest')
const { app } = require('../../../server')
const { User } = require('../../../server/api/models')
const bcrypt = require('bcrypt')

const server = app.callback()

describe('auth endpoints', () => {
  describe('login', () => {
    test('it works for known user', async () => {
      jest
        .spyOn(User, 'findOne')
        .mockImplementation(() =>
          Promise.resolve(new User({ username: 'aaron' }))
        )
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => true)

      const response = await supertest(server)
        .post('/api/login')
        .send({ username: 'aaron', password: 'password' })
        .expect(200)

      expect(response.body).toHaveProperty('token')
      expect(response.body.token).toContain(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
      )
    })
  })

  describe('me', () => {
    test('it provides current user', async () => {
      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFhcm9uIiwiX2lkIjoiNWM3MTlkNDhhYmZlYTNlMDgxNDNmNGIxIiwiaWF0IjoxNTUwOTQ5NzA0fQ.MYbWyUCcVippNrMpWVgWXog35tT_8HcXwaybBuH1AJw'

      await supertest(server)
        .get('/api/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect({
          user: {
            username: 'aaron',
            _id: '5c719d48abfea3e08143f4b1',
            iat: 1550949704,
          },
        })
    })
  })
})
