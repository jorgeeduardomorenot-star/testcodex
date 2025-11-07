'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2 } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const clearCart = useCartStore(state => state.clearCart)

  useEffect(() => {
    // Clear cart on successful payment
    clearCart()
  }, [clearCart])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">¡Pago Exitoso!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">
            Tu pago ha sido procesado correctamente.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>📧 Revisa tu correo electrónico</strong>
              <br />
              Hemos enviado las credenciales de tus cuentas a tu email.
              Si no lo encuentras, revisa tu carpeta de spam.
            </p>
          </div>

          <div className="space-y-2 pt-4">
            <Link href="/compras" className="block">
              <Button className="w-full">Ver Mis Compras</Button>
            </Link>
            <Link href="/servicios" className="block">
              <Button variant="outline" className="w-full">
                Seguir Comprando
              </Button>
            </Link>
          </div>

          {sessionId && (
            <p className="text-xs text-gray-500 text-center pt-4">
              ID de sesión: {sessionId}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
