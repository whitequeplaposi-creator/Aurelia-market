import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { strictRateLimit } from '@/lib/rateLimit';
import { sanitizeInput } from '@/middleware/security';
import { isDemoMode, mockDemoUser } from '@/lib/mockData';
import { turso } from '@/lib/turso';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    try {
      strictRateLimit(request);
    } catch (rateLimitError: any) {
      return NextResponse.json(
        { error: rateLimitError.message || 'För många förfrågningar, försök igen senare' },
        { 
          status: 429,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error('JSON parse error:', jsonError);
      return NextResponse.json(
        { error: 'Ogiltig förfrågan - JSON-fel' },
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Sanitera input
    const sanitizedBody = sanitizeInput(body);
    
    // Validera input
    let validatedData;
    try {
      validatedData = registerSchema.parse(sanitizedBody);
    } catch (validationError) {
      console.error('Validation error:', validationError);
      return NextResponse.json(
        { error: 'Ogiltig e-postadress eller lösenord (minst 8 tecken krävs)' },
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    const { email, password } = validatedData;

    // Demo mode - returnera mock user
    if (isDemoMode()) {
      const token = jwt.sign(
        { userId: mockDemoUser.id, email: mockDemoUser.email, role: mockDemoUser.role },
        process.env.JWT_SECRET || 'demo-secret',
        { expiresIn: '7d' }
      );

      return NextResponse.json(
        {
          user: mockDemoUser,
          token,
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Production mode - använd Turso
    if (!turso) {
      return NextResponse.json(
        { error: 'Databas ej tillgänglig' },
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Check if user exists
    const existingUserResult = await turso.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [email]
    });

    if (existingUserResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'E-postadressen är redan registrerad' },
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const insertResult = await turso.execute({
      sql: 'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?) RETURNING id, email, role, created_at, updated_at',
      args: [email, passwordHash, 'customer']
    });

    if (insertResult.rows.length === 0) {
      throw new Error('Failed to create user');
    }

    const user = insertResult.rows[0];

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id as string, email: user.email as string, role: user.role as string },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
        token,
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Registration error:', error);
    
    // Ge mer specifika felmeddelanden
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ogiltig e-postadress eller lösenord' },
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    return NextResponse.json(
      { error: 'Registrering misslyckades. Försök igen.' },
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
