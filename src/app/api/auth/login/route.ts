import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { turso } from '@/lib/turso';
import { z } from 'zod';

// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Ogiltig e-postadress'),
  password: z.string().min(1, 'Lösenord krävs'),
});

// Response type
interface LoginResponse {
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

export async function POST(request: NextRequest): Promise<NextResponse<LoginResponse | ErrorResponse>> {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = loginSchema.parse(body);
    const { email, password } = validatedData;

    console.log('[LOGIN] Attempt for:', email);

    // Check if database is available
    if (!turso) {
      console.error('[LOGIN] Database not available');
      return NextResponse.json(
        { error: 'Databas ej tillgänglig. Kontakta support.' },
        { status: 500 }
      );
    }

    // Get user from database
    const result = await turso.execute({
      sql: 'SELECT id, email, password_hash, role, created_at, updated_at FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1',
      args: [email]
    });

    if (result.rows.length === 0) {
      console.log('[LOGIN] User not found:', email);
      return NextResponse.json(
        { error: 'Felaktig e-postadress eller lösenord' },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash as string);

    if (!validPassword) {
      console.log('[LOGIN] Invalid password for:', email);
      return NextResponse.json(
        { error: 'Felaktig e-postadress eller lösenord' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('[LOGIN] JWT_SECRET not configured');
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

    console.log('[LOGIN] Success for:', email);

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
      console.error('[LOGIN] Validation error:', error.errors);
      return NextResponse.json(
        { error: 'Ogiltig e-postadress eller lösenord' },
        { status: 400 }
      );
    }

    // Handle other errors
    console.error('[LOGIN] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Ett oväntat fel uppstod. Försök igen.' },
      { status: 500 }
    );
  }
}
