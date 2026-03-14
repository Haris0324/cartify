const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

const BASE_URL = "http://13.53.39.196:5000";

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${BASE_URL}/api/auth/google/callback`
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;

      let user = await User.findOne({ googleId: profile.id });
      if (user) return done(null, user);

      if (email) {
        user = await User.findOne({ email });
        if (user) {
          user.googleId = profile.id;
          if (!user.avatar && profile.photos?.[0]?.value) {
            user.avatar = profile.photos[0].value;
          }
          await user.save();
          return done(null, user);
        }
      }

      user = await User.create({
        name: profile.displayName || email?.split('@')[0] || 'User',
        email: email,
        googleId: profile.id,
        avatar: profile.photos?.[0]?.value || ''
      });

      return done(null, user);

    } catch (err) {
      return done(err, null);
    }
  }));
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID || '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    callbackURL: `${process.env.API_URL || 'http://localhost:5000'}/api/auth/github/callback`,
    scope: ['user:email']
  }, async (accessToken, refreshToken, profile, done) => {

    try {
      const email = profile.emails?.[0]?.value || `${profile.id}@github.user`;

      let user = await User.findOne({ githubId: profile.id });
      if (user) return done(null, user);

      user = await User.findOne({ email });

      if (user) {
        user.githubId = profile.id;

        if (!user.avatar && profile.photos?.[0]?.value) {
          user.avatar = profile.photos[0].value;
        }

        await user.save();
        return done(null, user);
      }

      user = await User.create({
        name: profile.displayName || profile.username || email.split('@')[0],
        email,
        githubId: profile.id,
        avatar: profile.photos?.[0]?.value || ''
      });

      return done(null, user);

    } catch (err) {
      return done(err, null);
    }
  }));
}

passport.serializeUser((user, done) => done(null, user._id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});