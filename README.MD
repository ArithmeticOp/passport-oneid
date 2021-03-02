## Usage

**Create Application**

Before using passport-oneid, you must register an application with oneid. If you have not already done so, a new application can be created at [OneID](https://one.th). Your application will be issued a clientId, clientSecret and refCode, which need to be provided to the strategy.

**Configure Strategy**

The OneID authentication strategy authenticates users using a OneID Account. The client id and secret obtained when creating an application are supplied as options when creating the strategy. receives the access token, as well as profile which contains the authenticated user's OneID profile.

```
passport.use(new OneIDStrategy({
    clientID: ONEID_APP_ID,
    clientSecret: ONEID_APP_SECRET,
    refCode: ONEID_APP_REFCODE
  },
  function(accessToken, profile, cb) {
    User.findOrCreate({ OneId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));
```

**Authenticate Requests**

Use passport.authenticate(), specifying the 'oneid' strategy, to authenticate requests.

For example, as route middleware in an Express application:

```
app.get('/auth/oneid',
  passport.authenticate('oneid'));

app.get('/auth/oneid/callback',
  passport.authenticate('oneid', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });
```
