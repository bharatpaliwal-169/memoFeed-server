const express = require('express');
const request = require('supertest');
const routes = require('../routes/posts.js');

describe('The Server', () => {
  const app = express();
  app.use('/', routes);

  test('serves as an example endpoint', done => {
    request(app)
      .get('/posts/')
      .expect(200)
      .expect(response => expect(response.body).toEqual(expect.arrayContaining(['currentPage'])))
      .then(() => done())
      .catch(err => done(err));
  });

  test('returns HTML on an unknown endpoint', done => {
    request(app)
      .get('/*')
      .expect(response => expect(response.header['content-type']).toContain('text/html'))
      .then(() => done())
      .catch(err => done(err));
  });
});
