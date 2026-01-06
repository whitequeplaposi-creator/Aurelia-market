import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '@/lib/supabase';
import { z } from 'zod';
import { strictRateLimit } from '@/lib/rateLimit';
import { sanitizeInput } from '@/middleware/security';
import { isDemoMode, mockDemoUser } from '@/lib/mockData';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
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
      validatedData = loginSchema.parse(sanitizedBody);
    } catch (validationError) {
      console.error('Validation error:', validationError);
      return NextResponse.json(
        { error: 'Ogiltig e-postadress eller lösenord' },
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

    // Production mode - använd Supabase
    // Get user
    const { data: user, error } = await (supabaseAdmin as any)
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Felaktig e-postadress eller lösenord' },
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return NextResponse.json(
        { error: 'Felaktig e-postadress eller lösenord' },
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
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
    console.error('Login error:', error);
    
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
      { error: 'Inloggning misslyckades. Försök igen.' },
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
