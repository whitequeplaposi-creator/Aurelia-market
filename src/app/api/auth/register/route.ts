import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { turso } from '@/lib/turso';
import { z } from 'zod';
import { isAdminEmail } from '@/lib/config';

// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Validation schema
const registerSchema = z.object({
  email: z.string().email('Ogiltig e-postadress'),
  password: z.string().min(8, 'Lösenordet måste vara minst 8 tecken'),
});

// Response type
interface RegisterResponse {
  user: {
    id: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
  token: string;
}

interface ErrorResponse {
  error: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<RegisterResponse | ErrorResponse>> {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = registerSchema.parse(body);
    const { email, password } = validatedData;

    console.log('[REGISTER] Attempt for:', email);

    // Check if database is available
    if (!turso) {
      console.error('[REGISTER] Database not available');
      return NextResponse.json(
        { error: 'Databas ej tillgänglig. Kontakta support.' },
        { status: 500 }
      );
    }

    // Check if user already exists
    const existingUserResult = await turso.execute({
      sql: 'SELECT id FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1',
      args: [email]
    });

    if (existingUserResult.rows.length > 0) {
      console.log('[REGISTER] User already exists:', email);
      return NextResponse.json(
        { error: 'E-postadressen är redan registrerad' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Determine role based on email
    const role = isAdminEmail(email) ? 'admin' : 'customer';

    console.log('[REGISTER] Creating user with role:', role);

    // Create user
    const insertResult = await turso.execute({
      sql: `INSERT INTO users (email, password_hash, role, created_at, updated_at) 
            VALUES (?, ?, ?, datetime('now'), datetime('now')) 
            RETURNING id, email, role, created_at, updated_at`,
      args: [email, passwordHash, role]
    });

    if (insertResult.rows.length === 0) {
      console.error('[REGISTER] Failed to create user');
      return NextResponse.json(
        { error: 'Kunde inte skapa användare. Försök igen.' },
        { status: 500 }
      );
    }

    const user = insertResult.rows[0];

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('[REGISTER] JWT_SECRET not configured');
      return NextResponse.json(
        { error: 'Server-konfigurationsfel. Kontakta support.' },
        { status: 500 }
      );
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    console.log('[REGISTER] Success for:', email);

    // Return success response
    return NextResponse.json({
      user: {
        id: user.id as string,
        email: user.email as string,
        role: user.role as string,
        createdAt: user.created_at as string,
        updatedAt: user.updated_at as string,
      },
      token,
    });

  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      console.error('[REGISTER] Validation error:', error.errors);
      const firstError = error.errors[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      );
    }

    // Handle other errors
    console.error('[REGISTER] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Ett oväntat fel uppstod. Försök igen.' },
      { status: 500 }
    );
  }
}
