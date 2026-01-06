// Mock data för demo-läge
import { Product, User, CartItem, Order } from '@/types';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Lyxig Guldarmband',
    description: 'Handgjort guldarmband i 18K guld med elegant design. Perfekt för speciella tillfällen och vardagsbruk.',
    price: 12999,
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&h=500&fit=crop',
    stock: 5,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Diamantring',
    description: 'Vacker diamantring med 0.5 karat diamant i vitguld. Tidlös elegans som varar för evigt.',
    price: 24999,
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&h=500&fit=crop',
    stock: 3,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Pärla Halsband',
    description: 'Elegant pärla halsband med vita sötvattenpärlor. Klassisk skönhet för alla tillfällen.',
    price: 8999,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop',
    stock: 8,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Guldörhängen',
    description: 'Klassiska guldörhängen i 14K guld. Passar till allt och ger en touch av lyx.',
    price: 5999,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&h=500&fit=crop',
    stock: 10,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Silverarmband',
    description: 'Modernt silverarmband med minimalistisk design. Perfekt för den moderna stilen.',
    price: 3999,
    image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=500&h=500&fit=crop',
    stock: 15,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'Safirring',
    description: 'Blå safirring omgiven av diamanter. Exklusiv design för den som vill sticka ut.',
    price: 18999,
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&h=500&fit=crop',
    stock: 2,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// In-memory storage för demo
export const mockStorage = {
  users: [] as User[],
  cartItems: [] as CartItem[],
  orders: [] as Order[],
};

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
