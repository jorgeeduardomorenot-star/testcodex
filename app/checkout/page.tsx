'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/store/cart'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCheckout = async () => {
    if (items.length === 0) {
      setError('El carrito está vacío')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear la sesión de pago')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No se recibió URL de pago')
      }
    } catch (err: any) {
      console.error('Checkout error:', err)
      setError(err.message || 'Ocurrió un error al procesar el pago')
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Tu carrito está vacío
          </h1>
          <p className="text-gray-600 mb-8">
            Agrega algunos servicios antes de proceder al pago
          </p>
          <Link href="/servicios">
            <Button>Ver Servicios</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Link href="/carrito" className="text-primary hover:underline mb-4 inline-block">
              ← Volver al carrito
            </Link>
            <h1 className="text-4xl font-bold text-gray-900">Finalizar Compra</h1>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Resumen de la Orden</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.service.id} className="flex justify-between">
                    <div>
                      <p className="font-medium">{item.service.name}</p>
                      <p className="text-sm text-gray-600">
                        Cantidad: {item.quantity} × {formatCurrency(item.service.price)}
                      </p>
                    </div>
                    <p className="font-medium">
                      {formatCurrency(item.service.price * item.quantity)}
                    </p>
                  </div>
                ))}
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatCurrency(getTotalPrice())}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Información de Pago</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Nota:</strong> Serás redirigido a Stripe para completar tu pago de forma segura.
                  Una vez completado el pago, recibirás las credenciales de tus cuentas por email.
                </p>
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <Button
              onClick={handleCheckout}
              className="flex-1"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Procesando...' : 'Proceder al Pago'}
            </Button>
            <Link href="/carrito" className="flex-1">
              <Button variant="outline" className="w-full" size="lg">
                Cancelar
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
