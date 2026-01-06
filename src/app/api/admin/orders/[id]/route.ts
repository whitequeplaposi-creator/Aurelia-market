import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/middleware/auth';
import { handleApiError, ApiError } from '@/middleware/errorHandler';
import { z } from 'zod';
import { OrderStatus } from '@/types';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'paid', 'shipped', 'delivered', 'cancelled']),
});

// GET single order (admin)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireAdmin(request);

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        user:users(id, email),
        items:order_items(
          *,
          product:products(*)
        )
      `)
      .eq('id', params.id)
      .single();

    if (error || !order) {
      throw new ApiError(404, 'Order not found');
    }

    return NextResponse.json({ order });
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT update order status (admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireAdmin(request);

    const body = await request.json();
    const { status } = updateStatusSchema.parse(body);

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw new ApiError(404, 'Order not found');

    return NextResponse.json({ order });
  } catch (error) {
    return handleApiError(error);
  }
}
