import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { AuthService } from './auth.service';

const authService = new AuthService();

const options = {
  // Wyciągaj token z nagłówka HTTP: Bearer <token>
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'super_secret_olympo_key_2026',
};

passport.use(
  new JwtStrategy(options, async (jwtPayload, done) => {
    try {
      const user = await authService.findById(jwtPayload.id);
      
      if (user) {
        const { password, ...userWithoutPassword } = user;
        return done(null, userWithoutPassword);
      }
      
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  })
);

export default passport;