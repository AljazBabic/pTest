var request = require('supertest');

var user = {
  username: 'testUser1',
  password: 'testpassword123',
}
var user1 = {
  username: 'testUser2',
  password: 'testpassword123'
}
var user2 = {
  username: 'testUser3',
  password: 'testpassword123'
}

describe('UserController', function () {

  before(function (done) {
    request(sails.hooks.http.app)
      .post('/signup')
      .send({ username: user.username, password: user.password })
      .expect(201)
      .end(function (err, res) {
        user.id = res.body.id;
        request(sails.hooks.http.app)
          .post('/login')
          .send({ username: user.username, password: user.password })
          .expect(200)
          .end(function (err, res) {
            user.token = res.body.token;
            done();
          });
      });
  });
  before(function (done) {
    request(sails.hooks.http.app)
      .post('/signup')
      .send({ username: user1.username, password: user1.password })
      .expect(201)
      .end(function (err, res) {
        user1.id = res.body.id;
        request(sails.hooks.http.app)
          .post('/login')
          .send({ username: user1.username, password: user1.password })
          .expect(200)
          .end(function (err, res) {
            user1.token = res.body.token;
            done();
          });
      });
  });
  before(function (done) {
    request(sails.hooks.http.app)
      .post('/signup')
      .send({ username: user2.username, password: user2.password })
      .expect(201)
      .end(function (err, res) {
        user2.id = res.body.id;
        request(sails.hooks.http.app)
          .post('/login')
          .send({ username: user2.username, password: user2.password })
          .expect(200)
          .end(function (err, res) {
            user2.token = res.body.token;
            done();
          });
      });
  });
  describe('#signup', function () {
    it('Should create a user.', function (done) {
      request(sails.hooks.http.app)
        .post('/signup')
        .send({ username: 'testuser', password: 'test' })
        .expect(201, done)
    });

    it('Should return bad request (username missing).', function (done) {
      request(sails.hooks.http.app)
        .post('/signup')
        .send({ name: 'testuser', password: 'test' })
        .expect(400, done)
    });

    it('Should return conflict (username already in use).', function (done) {
      request(sails.hooks.http.app)
        .post('/signup')
        .send({ username: 'testuser', password: 'test' })
        .expect(409, done)
    });
  });

  describe('#login', function () {
    it('Should return success.', function (done) {
      request(sails.hooks.http.app)
        .post('/login')
        .send({ username: 'testuser', password: 'test' })
        .expect(200)
        .expect(hasToken)
        .end(done);
    });

    it('Should return unauthorized (incorrect password).', function (done) {
      request(sails.hooks.http.app)
        .post('/login')
        .send({ username: user1.username, password: user1.password + '22' })
        .expect(400, done);
    });
  });

  describe('#me', function () {
    it('Should return ok.', function (done) {
      request(sails.hooks.http.app)
        .get('/me')
        .set('Authorization', 'Bearer ' + user1.token)
        .expect(200, done);
    })

    it('Should return unauthorized (token missing).', function (done) {
      request(sails.hooks.http.app)
        .get('/me')
        .expect(401, done);
    })

    it('Should return unauthorized (token incorrect).', function (done) {
      request(sails.hooks.http.app)
        .get('/me')
        .set('Authorization', 'Bearer ' + user1.token + '1')
        .expect(401, done);
    })
  });

  describe('#me/update-password', function () {
    it('Should return ok.', function (done) {
      request(sails.hooks.http.app)
        .patch('/me/update-password')
        .set('Authorization', 'Bearer ' + user1.token)
        .send({ password: user1.password, newPassword: user1.password + '123' })
        .expect(200, done);
    })

    it('Should return bad request (password incorrect).', function (done) {
      request(sails.hooks.http.app)
        .patch('/me/update-password')
        .set('Authorization', 'Bearer ' + user.token)
        .send({ password: user.password + '1', newPassword: user.password + '123' })
        .expect(400, done);
    })
  });

  describe('#user/id:', function () {
    it('Should return ok.', function (done) {
      request(sails.hooks.http.app)
        .get('/user/' + user1.id + '/')
        .expect(200, done);
    })

    it('Should return not found.', function (done) {
      request(sails.hooks.http.app)
        .patch('/user/123/')
        .expect(404, done);
    })
  });

  describe('#user/id/like:', function () {
    it('Should return created.', function (done) {
      request(sails.hooks.http.app)
        .post('/user/' + user1.id + '/like')
        .set('Authorization', 'Bearer ' + user2.token)
        .expect(201, done);
    })

    it('Should return conflict.', function (done) {
      request(sails.hooks.http.app)
        .post('/user/' + user1.id + '/like')
        .set('Authorization', 'Bearer ' + user1.token)
        .expect(409, done);
    })

    it('Should return not found.', function (done) {
      request(sails.hooks.http.app)
        .post('/user/123/like')
        .set('Authorization', 'Bearer ' + user2.token)
        .expect(404, done);
    })
  });

  describe('#user/id/unlike:', function () {
    it('Should return ok.', function (done) {
      request(sails.hooks.http.app)
        .delete('/user/' + user1.id + '/unlike')
        .set('Authorization', 'Bearer ' + user2.token)
        .expect(200, done);
    })

    it('Should return not found.', function (done) {
      request(sails.hooks.http.app)
        .post('/user/123/unlike')
        .set('Authorization', 'Bearer ' + user2.token)
        .expect(404, done);
    })
  });

  describe('#most-liked', function () {
    it('Should return ok.', function (done) {
      request(sails.hooks.http.app)
        .get('/most-liked')
        .expect(200, done)
    });
  });

});

function hasToken(res) {
  if (!('token' in res.body)) throw new Error("missing token key");
}