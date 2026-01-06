import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthUser } from '@/middleware/auth';
import { handleApiError } from '@/middleware/errorHandler';
import { isDemoMode, getMockOrders } from '@/lib/mockData';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET user's orders
export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);

    // Demo mode - använd mock data
    if (isDemoMode()) {
      const orders = getMockOrders(user.userId);
      return NextResponse.json({ orders });
    }

    // Production mode - använd Supabase
    const { data: orders, error } = await (supabaseAdmin as any)
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          product:products(*)
        )
      `)
      .eq('user_id', user.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ orders: orders || [] });
  } catch (error) {
    return handleApiError(error);
  }
}
