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
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSubject, setSupportSubject] = useState('');
  const [supportCategory, setSupportCategory] = useState('order');
  const [submitting, setSubmitting] = useState(false);
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

  const handleCancelOrder = async () => {
    if (!order) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'cancel' })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to cancel order');
      }

      alert('Order avbruten framgångsrikt!');
      setShowCancelModal(false);
      fetchOrder(order.id);
    } catch (error: any) {
      alert(error.message || 'Kunde inte avbryta ordern');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendSupport = async () => {
    if (!supportSubject.trim() || !supportMessage.trim()) {
      alert('Vänligen fyll i både ämne och meddelande');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: order?.id,
          subject: supportSubject,
          message: supportMessage,
          category: supportCategory
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send support message');
      }

      const data = await response.json();
      alert(data.message || 'Meddelande skickat!');
      setShowSupportModal(false);
      setSupportMessage('');
      setSupportSubject('');
    } catch (error) {
      alert('Kunde inte skicka meddelandet. Försök igen.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delivered':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const canCancelOrder = (status: string) => {
    return ['pending', 'paid'].includes(status);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600"></div>
              <p className="mt-4 text-gray-600">Laddar order...</p>
            </div>
          </div>
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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2 text-gold-600 hover:text-gold-700 font-medium transition-colors group"
          >
            <svg
              className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Header */}
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </h1>
                    <p className="text-gray-600 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
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
                    className={`px-4 py-2 rounded-full text-sm font-bold border ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {getStatusText(order.status)}
                  </span>
                </div>

                {/* Order Tracking Progress */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-6">Orderstatus & Spårning</h2>
                  
                  <div className="relative">
                    {/* Progress line */}
                    <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded">
                      <div
                        className="h-full bg-gradient-to-r from-gold-500 to-gold-600 rounded transition-all duration-500"
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
                    <div className="relative z-10 flex justify-between">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                            ['paid', 'shipped', 'delivered'].includes(order.status)
                              ? 'bg-gradient-to-br from-gold-500 to-gold-600 text-white'
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
                        <span className="mt-2 text-xs md:text-sm font-medium text-center">Betald</span>
                      </div>

                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                            ['shipped', 'delivered'].includes(order.status)
                              ? 'bg-gradient-to-br from-gold-500 to-gold-600 text-white'
                              : 'bg-gray-300 text-gray-600'
                          }`}
                        >
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                          </svg>
                        </div>
                        <span className="mt-2 text-xs md:text-sm font-medium text-center">Skickad</span>
                      </div>

                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                            order.status === 'delivered'
                              ? 'bg-gradient-to-br from-gold-500 to-gold-600 text-white'
                              : 'bg-gray-300 text-gray-600'
                          }`}
                        >
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                          </svg>
                        </div>
                        <span className="mt-2 text-xs md:text-sm font-medium text-center">Levererad</span>
                      </div>
                    </div>
                  </div>

                  {/* Status description */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <p className="text-sm text-gray-700">
                      {order.status === 'pending' && (
                        <>
                          <strong className="text-blue-900">⏳ Väntar på betalning:</strong> Din order väntar på att betalningen ska bekräftas.
                        </>
                      )}
                      {order.status === 'paid' && (
                        <>
                          <strong className="text-green-900">✓ Betalning mottagen:</strong> Din betalning har bekräftats och din order förbereds för leverans.
                        </>
                      )}
                      {order.status === 'shipped' && (
                        <>
                          <strong className="text-blue-900">🚚 Skickad:</strong> Din order har skickats och är på väg till dig. Förväntad leveranstid: 2-5 arbetsdagar.
                        </>
                      )}
                      {order.status === 'delivered' && (
                        <>
                          <strong className="text-purple-900">📦 Levererad:</strong> Din order har levererats. Tack för ditt köp!
                        </>
                      )}
                      {order.status === 'cancelled' && (
                        <>
                          <strong className="text-red-900">✕ Avbruten:</strong> Denna order har avbrutits.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200">
                <h2 className="text-xl font-bold mb-6">Produkter i din order</h2>
                <div className="space-y-4">
                  {order.items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="w-20 h-20 bg-white rounded-lg flex-shrink-0 shadow-sm overflow-hidden">
                        {item.product?.image ? (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                            📦
                          </div>
                        )}
                      </div>

                      <div className="flex-grow">
                        <h3 className="font-bold text-gray-900">{item.product?.name || 'Produkt'}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {item.priceAtPurchase} kr × {item.quantity} st
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

                {/* Total */}
                <div className="border-t-2 border-gray-200 mt-6 pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Delsumma</p>
                      <p className="text-sm text-gray-600">Frakt</p>
                      <p className="text-sm text-gray-600">Moms (25%)</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{order.totalPrice} kr</p>
                      <p className="text-sm font-semibold text-green-600">Gratis</p>
                      <p className="text-sm font-semibold">{Math.round(order.totalPrice * 0.2)} kr</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-2xl font-bold mt-4 pt-4 border-t border-gray-200">
                    <span>Totalt:</span>
                    <span className="text-gold-600">{order.totalPrice} kr</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Actions Card */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200 sticky top-24">
                <h3 className="text-lg font-bold mb-4">Orderåtgärder</h3>
                
                <div className="space-y-3">
                  {/* Contact Support */}
                  <button
                    onClick={() => setShowSupportModal(true)}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    Kontakta Support
                  </button>

                  {/* Cancel Order */}
                  {canCancelOrder(order.status) && (
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Avbryt Order
                    </button>
                  )}

                  {/* View Invoice */}
                  <button
                    className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-semibold transition-all duration-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Visa Faktura
                  </button>
                </div>

                {/* Order Info */}
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order-ID:</span>
                    <span className="font-mono font-semibold">{order.id.slice(0, 12)}</span>
                  </div>
                  {order.stripePaymentIntentId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Betalnings-ID:</span>
                      <span className="font-mono text-xs">{order.stripePaymentIntentId.slice(0, 20)}...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Help Card */}
              <div className="bg-gradient-to-br from-gold-50 to-yellow-50 rounded-2xl shadow-md p-6 border border-gold-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Behöver du hjälp?</h4>
                    <p className="text-sm text-gray-700 mb-3">
                      Vårt supportteam finns här för att hjälpa dig med frågor om din order.
                    </p>
                    <p className="text-xs text-gray-600">
                      📧 info@aurelia-market.com<br />
                      🌐 www.aurelia-market.com<br />
                      🕐 Mån-Fre 09:00-17:00
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Support Modal */}
          {showSupportModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Kontakta Support</h2>
                    <button
                      onClick={() => setShowSupportModal(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kategori
                      </label>
                      <select
                        value={supportCategory}
                        onChange={(e) => setSupportCategory(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                      >
                        <option value="order">Order & Leverans</option>
                        <option value="product">Produkt</option>
                        <option value="payment">Betalning</option>
                        <option value="shipping">Frakt</option>
                        <option value="other">Övrigt</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ämne
                      </label>
                      <input
                        type="text"
                        value={supportSubject}
                        onChange={(e) => setSupportSubject(e.target.value)}
                        placeholder="T.ex. Fråga om leveranstid"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                        maxLength={200}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Meddelande
                      </label>
                      <textarea
                        value={supportMessage}
                        onChange={(e) => setSupportMessage(e.target.value)}
                        placeholder="Beskriv ditt ärende..."
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent resize-none"
                        maxLength={2000}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {supportMessage.length}/2000 tecken
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-900">
                        <strong>Order-ID:</strong> {order.id}<br />
                        Vi svarar normalt inom 24 timmar.
                      </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => setShowSupportModal(false)}
                        className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                      >
                        Avbryt
                      </button>
                      <button
                        onClick={handleSendSupport}
                        disabled={submitting || !supportSubject.trim() || !supportMessage.trim()}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                      >
                        {submitting ? 'Skickar...' : 'Skicka Meddelande'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cancel Order Modal */}
          {showCancelModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                <div className="p-6 md:p-8">
                  <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>

                  <h2 className="text-2xl font-bold text-center mb-4">Avbryt Order?</h2>
                  <p className="text-gray-600 text-center mb-6">
                    Är du säker på att du vill avbryta denna order? Denna åtgärd kan inte ångras.
                  </p>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-yellow-900">
                      <strong>Obs:</strong> Om betalning redan har genomförts kommer pengarna att återbetalas inom 5-10 arbetsdagar.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowCancelModal(false)}
                      className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Nej, behåll
                    </button>
                    <button
                      onClick={handleCancelOrder}
                      disabled={submitting}
                      className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                    >
                      {submitting ? 'Avbryter...' : 'Ja, avbryt'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
