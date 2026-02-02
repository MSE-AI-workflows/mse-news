import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import pool from './database.js';
import dotenv from 'dotenv';

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails[0].value;
        const name = profile.displayName;

        // Check if user exists
        const [existingUsers] = await pool.query(
          'SELECT * FROM users WHERE google_id = ?',
          [googleId]
        );

        let user;
        if (existingUsers.length > 0) {
          user = existingUsers[0];
        } else {
          // Create new user
          const [result] = await pool.query(
            'INSERT INTO users (google_id, email, name) VALUES (?, ?, ?)',
            [googleId, email, name]
          );
          const [newUsers] = await pool.query(
            'SELECT * FROM users WHERE id = ?',
            [result.insertId]
          );
          user = newUsers[0];
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    done(null, users[0]);
  } catch (error) {
    done(error, null);
  }
});

export default passport;