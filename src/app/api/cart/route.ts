import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthUser } from '@/middleware/auth';
import { handleApiError } from '@/middleware/errorHandler';
import { isDemoMode, getMockCart } from '@/lib/mockData';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET cart
export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);

    // Demo mode - använd mock data
    if (isDemoMode()) {
      const cartItems = getMockCart(user.userId);
      const totalPrice = cartItems.reduce(
        (sum, item) => sum + (item.product.price * item.quantity),
        0
      );

      return NextResponse.json({
        items: cartItems,
        totalPrice,
        totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      });
    }

    // Production mode - använd Supabase
    const { data: cartItems, error } = await (supabaseAdmin as any)
      .from('cart_items')
      .select(`
        *,
        product:products(*)
      `)
      .eq('user_id', user.userId);

    if (error) throw error;

    const totalPrice = cartItems?.reduce(
      (sum, item) => sum + (item.product.price * item.quantity),
      0
    ) || 0;

    return NextResponse.json({
      items: cartItems || [],
      totalPrice,
      totalItems: cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
