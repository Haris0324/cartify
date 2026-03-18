const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

let BASE_URL = (process.env.SERVER_URL || process.env.VITE_API_URL || 'https://cartify-backend-go9q.onrender.com').replace(/\/$/, '');

// Force https for production Render URLs to prevent redirect_uri_mismatch
if (BASE_URL.includes('onrender.com') && BASE_URL.startsWith('http:')) {
  BASE_URL = BASE_URL.replace('http:', 'https:');
}

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
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: `${BASE_URL}/api/auth/github/callback`,
    scope: ['user:email']
    }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('GitHub Profile:', JSON.stringify(profile, null, 2));

      const email =
        profile.emails?.[0]?.value ||
        `${profile.username}@github.user`;

      let user = await User.findOne({ githubId: profile.id });

      if (user) {
        if (user.email.includes('@github.user') && email && !email.includes('@github.user')) {
          const existingRealUser = await User.findOne({ email });
          if (existingRealUser && existingRealUser._id.toString() !== user._id.toString()) {
            existingRealUser.githubId = profile.id;
            await existingRealUser.save();
            await User.findByIdAndDelete(user._id);
            return done(null, existingRealUser);
          } else {
            user.email = email;
            await user.save();
          }
        }
        return done(null, user);
      }

      user = await User.findOne({ email });

      if (user) {
        user.githubId = profile.id;
        await user.save();
        return done(null, user);
      }

      user = await User.create({
        name: profile.displayName || profile.username,
        email,
        githubId: profile.id,
        avatar: profile.photos?.[0]?.value || ""
      });

      done(null, user);

    } catch (err) {
      done(err, null);
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