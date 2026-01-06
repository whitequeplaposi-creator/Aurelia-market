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
    strictRateLimit(request);
    
    const body = await request.json();
    
    // Sanitera input
    const sanitizedBody = sanitizeInput(body);
    const { email, password } = loginSchema.parse(sanitizedBody);

    // Demo mode - returnera mock user
    if (isDemoMode()) {
      const token = jwt.sign(
        { userId: mockDemoUser.id, email: mockDemoUser.email, role: mockDemoUser.role },
        process.env.JWT_SECRET || 'demo-secret',
        { expiresIn: '7d' }
      );

      return NextResponse.json({
        user: mockDemoUser,
        token,
      });
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
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
