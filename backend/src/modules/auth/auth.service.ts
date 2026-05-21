import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient, Role } from '@prisma/client';

export class AuthService {
  // Inicjalizacja klienta Prisma do komunikacji z bazą PostgreSQL
  private prisma = new PrismaClient();
  private jwtSecret = process.env.JWT_SECRET || 'super_secret_olympo_key_2026';

  async register(data: any) {
    const { email, password, firstName, lastName, role } = data;

    // 1. Walidacja unikalności e-maila w bazie danych
    const existingUser = await this.prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      throw new Error('Użytkownik o podanym adresie e-mail już istnieje.');
    }

    // 2. Hashowanie hasła (zabezpieczenie przed wyciekiem bazy)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Automatyczne generowanie unikalnego kodu QR dla Klienta (potrzebne do modułu recepcji)
    let qrCode: string | null = null;
    if (role === 'CLIENT' || !role) {
      qrCode = `OLYMPO-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    }

    // 4. Zapis nowego użytkownika do bazy danych PostgreSQL przez Prismę
    const newUser = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: (role as Role) || Role.CLIENT, // Mapowanie typu na Enum z Prismy
        qrCode
      }
    });

    // Bezpieczeństwo: Wycinamy hash hasła przed wysłaniem odpowiedzi do frontendu
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async login(data: any) {
    const { email, password } = data;

    // 1. Znalezienie użytkownika w bazie po unikalnym adresie e-mail
    const user = await this.prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      throw new Error('Nieprawidłowy e-mail lub hasło.');
    }

    // 2. Weryfikacja hasła przy użyciu bcrypt (POPRAWIONE: sprawdzamy hasło konkretnego usera)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Nieprawidłowy e-mail lub hasło.');
    }

    // 3. Generowanie tokenu JWT zawierającego id, email i rolę z bazy danych
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      this.jwtSecret,
      { expiresIn: '1d' } // Token ważny 24 godziny
    );

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async findById(id: string) {
    // Służy do strategii Passport JWT, pobiera aktualne dane zalogowanego użytkownika
    return this.prisma.user.findUnique({
      where: { id }
    });
  }
}