// Mock data för demo-läge
import { Product, User, CartItem, Order, OrderStatus } from '@/types';

export const mockProducts: Product[] = [
  {
    id: 'demo-1',
    name: 'Demo Produkt',
    description: 'Detta är en tillfällig demo-produkt. Riktiga produkter kommer att läggas till senare.',
    price: 9999,
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&h=500&fit=crop',
    stock: 10,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// In-memory storage för demo
export const mockStorage = {
  users: [] as User[],
  cartItems: [] as CartItem[],
  orders: [] as Order[],
  sessionId: 'demo-session-' + Date.now(),
};

// Mock user för demo (automatisk inloggning)
export const mockDemoUser: User = {
  id: 'demo-user-1',
  email: 'demo@aurelia-market.se',
  role: 'customer',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Auth functions för demo
export function createMockUser(email: string, password: string): User {
  const user: User = {
    id: 'user-' + Date.now(),
    email,
    role: 'customer',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockStorage.users.push(user);
  return user;
}

export function findMockUser(email: string): User | undefined {
  return mockStorage.users.find(u => u.email === email);
}

export function authenticateMockUser(email: string, password: string): User | null {
  // I demo mode, acceptera alla inloggningar
  const existingUser = findMockUser(email);
  if (existingUser) return existingUser;
  
  // Skapa ny användare automatiskt
  return createMockUser(email, password);
}

// Cart functions för demo
export function addToMockCart(productId: string, quantity: number, userId?: string): CartItem {
  const product = getMockProduct(productId);
  if (!product) throw new Error('Product not found');
  
  const existingItem = mockStorage.cartItems.find(
    item => item.productId === productId && (item.userId === userId || item.sessionId === mockStorage.sessionId)
  );
  
  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.updatedAt = new Date();
    return existingItem;
  }
  
  const cartItem: CartItem = {
    id: 'cart-' + Date.now(),
    userId,
    sessionId: mockStorage.sessionId,
    productId,
    product,
    quantity,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  mockStorage.cartItems.push(cartItem);
  return cartItem;
}

export function getMockCart(userId?: string): CartItem[] {
  return mockStorage.cartItems.filter(
    item => item.userId === userId || item.sessionId === mockStorage.sessionId
  );
}

export function updateMockCartItem(itemId: string, quantity: number): CartItem | undefined {
  const item = mockStorage.cartItems.find(i => i.id === itemId);
  if (item) {
    item.quantity = quantity;
    item.updatedAt = new Date();
  }
  return item;
}

export function removeMockCartItem(itemId: string): void {
  const index = mockStorage.cartItems.findIndex(item => item.id === itemId);
  if (index > -1) {
    mockStorage.cartItems.splice(index, 1);
  }
}

export function clearMockCart(userId?: string): void {
  mockStorage.cartItems = mockStorage.cartItems.filter(
    item => item.userId !== userId && item.sessionId !== mockStorage.sessionId
  );
}

// Order functions för demo
export function createMockOrder(userId: string, cartItems: CartItem[]): Order {
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  
  const orderId = 'order-' + Date.now();
  const order: Order = {
    id: orderId,
    userId,
    totalPrice,
    status: 'paid',
    stripePaymentIntentId: 'demo_pi_' + Date.now(),
    items: cartItems.map((item, index) => ({
      id: 'orderitem-' + Date.now() + '-' + index,
      orderId,
      productId: item.productId,
      product: item.product,
      quantity: item.quantity,
      priceAtPurchase: item.product.price,
      createdAt: new Date(),
    })),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  mockStorage.orders.push(order);
  clearMockCart(userId);
  return order;
}

export function getMockOrders(userId: string): Order[] {
  return mockStorage.orders.filter(order => order.userId === userId);
}

export function getMockOrder(orderId: string): Order | undefined {
  return mockStorage.orders.find(order => order.id === orderId);
}

export function updateMockOrderStatus(orderId: string, status: OrderStatus): Order | undefined {
  const order = getMockOrder(orderId);
  if (order) {
    order.status = status;
    order.updatedAt = new Date();
  }
  return order;
}

// Helper functions
export function getMockProducts(): Product[] {
  return mockProducts.filter(p => p.active);
}

export function getMockProduct(id: string): Product | undefined {
  return mockProducts.find(p => p.id === id && p.active);
}

export function isDemoMode(): boolean {
  return process.env.DEMO_MODE === 'true';
}
