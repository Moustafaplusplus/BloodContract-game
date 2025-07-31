import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/User.js';
import { Character } from '../models/Character.js';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;

export function configurePassport() {
  // Only configure Google OAuth if environment variables are set
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    console.log('✅ Google OAuth configured successfully');
    
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.NODE_ENV === 'production' 
        ? "https://bloodcontract-game-production.up.railway.app/api/auth/google/callback"
        : "http://localhost:3000/api/auth/google/callback",
      scope: ['profile', 'email']
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('🔐 Google OAuth callback received for:', profile.emails[0].value);
        
        // Check if user already exists
        let user = await User.findOne({ 
          where: { 
            email: profile.emails[0].value 
          } 
        });

        if (user) {
          console.log('👤 Existing user found, linking Google account');
          // User exists, check if they have Google ID
          if (!user.googleId) {
            // Link existing account to Google
            user.googleId = profile.id;
            await user.save();
            console.log('✅ Existing account linked to Google');
          }
        } else {
          console.log('🆕 Creating new user from Google OAuth');
          // Create new user
          const username = profile.displayName.replace(/\s+/g, '_').toLowerCase();
          let finalUsername = username;
          let counter = 1;
          
          // Ensure unique username
          while (await User.findOne({ where: { username: finalUsername } })) {
            finalUsername = `${username}_${counter}`;
            counter++;
          }

          user = await User.create({
            username: finalUsername,
            email: profile.emails[0].value,
            googleId: profile.id,
            age: 18, // Default age
            gender: 'male', // Default gender
            password: Math.random().toString(36).slice(-10), // Random password for Google users
            avatarUrl: profile.photos[0]?.value || null
          });

          // Create character for new user
          await Character.create({
            userId: user.id,
            name: user.username
          });
          
          console.log('✅ New user created successfully');
        }

        // Generate JWT token
        const character = await Character.findOne({ where: { userId: user.id } });
        const token = jwt.sign(
          { id: user.id, characterId: character.id },
          SECRET,
          { expiresIn: '7d' }
        );

        // Check if this is a new user (no Google ID was set before)
        const isNewUser = !user.googleId || user.googleId === profile.id;

        console.log('🎫 JWT token generated for user:', user.id);
        console.log('🆕 Is new user:', isNewUser);
        return done(null, { user, token, isNewUser });
      } catch (error) {
        console.error('❌ Google OAuth error:', error);
        return done(error, null);
      }
    }));
  } else {
    console.log('⚠️  Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable Google authentication.');
  }

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findByPk(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
} 