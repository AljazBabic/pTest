var sails = require('sails');

before(function (done) {

  // Increase the Mocha timeout so that Sails has enough time to lift.
  this.timeout(5000);
  sails.lift({
    connections: {
      someMongodbServer: {
        database: 'testDatabase'
      }
    },
    models:{
      connection: 'someMongodbServer',
      migrate: 'drop'
    }

  }, function (err) {
    if (err) return done(err);
    // here you can load fixtures, etc.
    done(err, sails);
  });
});

after(function (done) {
  sails.lower(done);
});