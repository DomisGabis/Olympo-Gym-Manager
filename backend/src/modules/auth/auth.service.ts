import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient, Role } from '@prisma/client';

export class AuthService {
  private prisma = new PrismaClient();
  private jwtSecret = process.env.JWT_SECRET || 'super_secret_olympo_key_2026';

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
      { expiresIn: '1d' } // Token ważny 24 godziny
    );

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id }
    });
  }
}