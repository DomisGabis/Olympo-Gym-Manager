import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient, Role } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library';

export class AuthService {
  private prisma = new PrismaClient();
  private jwtSecret = process.env.JWT_SECRET || 'super_secret_olympo_key_2026';

  private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  async register(data: any) {
    const { email, password, firstName, lastName, role } = data;

    const existingUser = await this.prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      throw new Error('Użytkownik o podanym adresie e-mail już istnieje.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let qrCode: string | null = null;
    if (role === 'CLIENT' || !role) {
      qrCode = `OLYMPO-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    }

    const newUser = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: (role as Role) || Role.CLIENT,
        qrCode
      }
    });

    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async login(data: any) {
    const { email, password } = data;

    const user = await this.prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      throw new Error('Nieprawidłowy e-mail lub hasło.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Nieprawidłowy e-mail lub hasło.');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      this.jwtSecret,
      { expiresIn: '1d' }
    );

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async googleLogin(googleToken: string) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: googleToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new Error('Nieprawidłowy lub wygasły token Google.');
      }

      const { email, given_name, family_name } = payload;

      let user = await this.prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        const randomPassword = Math.random().toString(36).substring(2, 15) + Date.now().toString();
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        const qrCode = `OLYMPO-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

        user = await this.prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            firstName: given_name || 'Użytkownik',
            lastName: family_name || 'Google',
            role: Role.CLIENT,
            qrCode
          }
        });
      }

      const appToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        this.jwtSecret,
        { expiresIn: '1d' }
      );

      const { password: _, ...userWithoutPassword } = user;
      return { user: userWithoutPassword, token: appToken };

    } catch (error: any) {
      console.error('Google Auth Error:', error);
      throw new Error(error.message || 'Błąd autoryzacji Google SSO.');
    }
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id }
    });
  }
}