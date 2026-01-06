import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthUser } from '@/middleware/auth';
import { handleApiError, ApiError } from '@/middleware/errorHandler';
import { z } from 'zod';
import { isDemoMode, getMockCart, createMockOrder } from '@/lib/mockData';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const checkoutSchema = z.object({
  paymentMethod: z.enum(['card', 'paypal', 'klarna']),
});

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    const body = await request.json();
    const { paymentMethod } = checkoutSchema.parse(body);

    // Demo mode - skapa mock order
    if (isDemoMode()) {
      const cartItems = getMockCart(user.userId);
      
      if (!cartItems || cartItems.length === 0) {
        throw new ApiError(400, 'Cart is empty');
      }

      const order = createMockOrder(user.userId, cartItems);

      return NextResponse.json({
        clientSecret: 'demo_secret_' + Date.now(),
        orderId: order.id,
      });
    }

    // Production mode - använd Supabase och Stripe
    // Get cart items
    const { data: cartItems, error: cartError } = await (supabaseAdmin as any)
      .from('cart_items')
      .select(`
        *,
        product:products(*)
      `)
      .eq('user_id', user.userId);

    if (cartError) throw cartError;

    if (!cartItems || cartItems.length === 0) {
      throw new ApiError(400, 'Cart is empty');
    }

    // Calculate total
    const totalPrice = cartItems.reduce(
      (sum, item) => sum + (item.product.price * item.quantity),
      0
    );

    // Create order
    const { data: order, error: orderError } = await (supabaseAdmin as any)
      .from('orders')
      .insert({
        user_id: user.userId,
        total_price: totalPrice,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = cartItems.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_purchase: item.product.price,
    }));

    const { error: itemsError } = await (supabaseAdmin as any)
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100), // Convert to cents
      currency: 'sek',
      metadata: {
        orderId: order.id,
        userId: user.userId,
      },
      payment_method_types: paymentMethod === 'card' ? ['card'] : [paymentMethod],
    });

    // Update order with payment intent ID
    await (supabaseAdmin as any)
      .from('orders')
      .update({ stripe_payment_intent_id: paymentIntent.id })
      .eq('id', order.id);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
