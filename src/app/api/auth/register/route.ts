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

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    strictRateLimit(request);
    
    const body = await request.json();
    
    // Sanitera input
    const sanitizedBody = sanitizeInput(body);
    const { email, password } = registerSchema.parse(sanitizedBody);

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
    // Check if user exists
    const { data: existingUser } = await (supabaseAdmin as any)
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const { data: user, error } = await (supabaseAdmin as any)
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        role: 'customer',
      })
      .select('id, email, role, created_at, updated_at')
      .single();

    if (error) throw error;

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
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
