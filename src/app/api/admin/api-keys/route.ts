import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/middleware/auth';
import { supabase } from '@/lib/supabase';
import { ApiError } from '@/middleware/errorHandler';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Enkel kryptering med base64 (tillfällig lösning för Vercel build)
function encryptApiKey(apiKey: string): { encrypted: string; iv: string } {
  // Använd base64 encoding som tillfällig lösning
  const encrypted = Buffer.from(apiKey).toString('base64');
  const iv = Buffer.from('temporary-iv').toString('base64');
  
  return {
    encrypted,
    iv
  };
}

// POST /api/admin/api-keys - Spara krypterad API-nyckel
export async function POST(request: NextRequest) {
  try {
    const user = requireAdmin(request);
    
    const body = await request.json();
    const { name, api_key, provider } = body;
    
    if (!name || !api_key || !provider) {
      throw new ApiError(400, 'Name, API key och provider är obligatoriska');
    }
    
    // Kryptera API-nyckeln
    const { encrypted, iv } = encryptApiKey(api_key);
    
    // Spara i databasen
    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        name,
        encrypted_key: encrypted,
        iv,
        provider,
        created_by: user.userId
      })
      .select()
      .single();
    
    if (error) {
      throw new ApiError(500, 'Kunde inte spara API-nyckel');
    }
    
    // Ta bort känslig data från response
    const { encrypted_key, iv: _, ...safeData } = data;
    
    return NextResponse.json(safeData, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Internt serverfel' }, { status: 500 });
  }
}

// GET /api/admin/api-keys - Lista API-nycklar
export async function GET(request: NextRequest) {
  try {
    requireAdmin(request);
    
    const { data, error } = await supabase
      .from('api_keys')
      .select('id, name, provider, created_at')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new ApiError(500, 'Kunde inte hämta API-nycklar');
    }
    
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Internt serverfel' }, { status: 500 });
  }
}
