'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Order } from '@/types';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (params.id) {
      fetchOrder(params.id as string);
    }
  }, [user, params.id]);

  const fetchOrder = async (id: string) => {
    try {
      const response = await fetch(`/api/orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Order not found');
      }

      const data = await response.json();
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      router.push('/orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Väntar';
      case 'paid':
        return 'Betald';
      case 'shipped':
        return 'Skickad';
      case 'delivered':
        return 'Levererad';
      case 'cancelled':
        return 'Avbruten';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">Laddar order...</div>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">Ordern hittades inte</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <button
          onClick={() => router.back()}
          className="mb-6 text-gold-600 hover:text-gold-700 flex items-center"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Tillbaka till Mina Ordrar
        </button>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Order #{order.id.slice(0, 8)}
              </h1>
              <p className="text-gray-600">
                Beställd{' '}
                {new Date(order.createdAt).toLocaleDateString('sv-SE', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-lg font-semibold ${getStatusColor(
                order.status
              )}`}
            >
              {getStatusText(order.status)}
            </span>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-2xl font-semibold mb-6">Orderstatus & Spårning</h2>
            
            {/* Order tracking progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between relative">
                {/* Progress line */}
                <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
                  <div
                    className="h-full bg-gold-500 transition-all duration-500"
                    style={{
                      width:
                        order.status === 'pending'
                          ? '0%'
                          : order.status === 'paid'
                          ? '33%'
                          : order.status === 'shipped'
                          ? '66%'
                          : order.status === 'delivered'
                          ? '100%'
                          : '0%',
                    }}
                  />
                </div>

                {/* Status steps */}
                <div className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      ['paid', 'shipped', 'delivered'].includes(order.status)
                        ? 'bg-gold-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="mt-2 text-sm font-medium">Betald</span>
                </div>

                <div className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      ['shipped', 'delivered'].includes(order.status)
                        ? 'bg-gold-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                    </svg>
                  </div>
                  <span className="mt-2 text-sm font-medium">Skickad</span>
                </div>

                <div className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      order.status === 'delivered'
                        ? 'bg-gold-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                  </div>
                  <span className="mt-2 text-sm font-medium">Levererad</span>
                </div>
              </div>

              {/* Status description */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  {order.status === 'pending' && (
                    <>
                      <strong>Väntar på betalning:</strong> Din order väntar på att betalningen ska bekräftas.
                    </>
                  )}
                  {order.status === 'paid' && (
                    <>
                      <strong>Betalning mottagen:</strong> Din betalning har bekräftats och din order förbereds för leverans.
                    </>
                  )}
                  {order.status === 'shipped' && (
                    <>
                      <strong>Skickad:</strong> Din order har skickats och är på väg till dig. Förväntad leveranstid: 2-5 arbetsdagar.
                    </>
                  )}
                  {order.status === 'delivered' && (
                    <>
                      <strong>Levererad:</strong> Din order har levererats. Tack för ditt köp!
                    </>
                  )}
                  {order.status === 'cancelled' && (
                    <>
                      <strong>Avbruten:</strong> Denna order har avbrutits.
                    </>
                  )}
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-semibold mb-4">Produkter</h2>
            <div className="space-y-4">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="w-20 h-20 bg-gray-200 rounded flex-shrink-0">
                    {item.product?.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        Bild
                      </div>
                    )}
                  </div>

                  <div className="flex-grow">
                    <h3 className="font-semibold">{item.product?.name || 'Produkt'}</h3>
                    <p className="text-gray-600">
                      {item.priceAtPurchase} kr × {item.quantity}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-gold-600">
                      {item.priceAtPurchase * item.quantity} kr
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t mt-6 pt-6">
            <div className="flex justify-between items-center text-2xl font-bold">
              <span>Totalt:</span>
              <span className="text-gold-600">{order.totalPrice} kr</span>
            </div>
          </div>

          {order.stripePaymentIntentId && (
            <div className="border-t mt-6 pt-6">
              <p className="text-sm text-gray-600">
                Betalnings-ID: {order.stripePaymentIntentId}
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
