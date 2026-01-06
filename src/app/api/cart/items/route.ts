import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthUser } from '@/middleware/auth';
import { handleApiError, ApiError } from '@/middleware/errorHandler';
import { z } from 'zod';
import { isDemoMode, addToMockCart, getMockProduct } from '@/lib/mockData';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const addToCartSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive().default(1),
});

// POST add item to cart
export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    const body = await request.json();
    const { productId, quantity } = addToCartSchema.parse(body);

    // Demo mode - använd mock data
    if (isDemoMode()) {
      const product = getMockProduct(productId);
      if (!product) {
        throw new ApiError(404, 'Product not found');
      }

      if (product.stock < quantity) {
        throw new ApiError(400, 'Insufficient stock');
      }

      const cartItem = addToMockCart(productId, quantity, user.userId);
      return NextResponse.json({ item: cartItem }, { status: 201 });
    }

    // Production mode - använd Supabase
    // Check if product exists and has stock
    const { data: product, error: productError } = await (supabaseAdmin as any)
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('active', true)
      .single();

    if (productError || !product) {
      throw new ApiError(404, 'Product not found');
    }

    if (product.stock < quantity) {
      throw new ApiError(400, 'Insufficient stock');
    }

    // Check if item already in cart
    const { data: existingItem } = await (supabaseAdmin as any)
      .from('cart_items')
      .select('*')
      .eq('user_id', user.userId)
      .eq('product_id', productId)
      .single();

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      
      if (product.stock < newQuantity) {
        throw new ApiError(400, 'Insufficient stock');
      }

      const { data: updatedItem, error } = await (supabaseAdmin as any)
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', existingItem.id)
        .select(`
          *,
          product:products(*)
        `)
        .single();

      if (error) throw error;

      return NextResponse.json({ item: updatedItem });
    }

    // Add new item
    const { data: newItem, error } = await (supabaseAdmin as any)
      .from('cart_items')
      .insert({
        user_id: user.userId,
        product_id: productId,
        quantity,
      })
      .select(`
        *,
        product:products(*)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({ item: newItem }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
