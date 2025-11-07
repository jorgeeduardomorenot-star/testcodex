'use client'

import { useCartStore } from '@/lib/store/cart'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { Trash2, Plus, Minus } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Tu carrito está vacío
          </h1>
          <p className="text-gray-600 mb-8">
            Agrega algunos servicios para comenzar
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
        <div className="mb-8">
          <Link href="/servicios" className="text-primary hover:underline mb-4 inline-block">
            ← Volver a servicios
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Carrito de Compras</h1>
          <p className="text-gray-600 mt-2">
            {getTotalItems()} {getTotalItems() === 1 ? 'artículo' : 'artículos'}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <Card key={item.service.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {item.service.image_url && (
                      <div className="relative w-24 h-24 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={item.service.image_url}
                          alt={item.service.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{item.service.name}</h3>
                      {item.service.duration && (
                        <p className="text-sm text-gray-600">
                          Duración: {item.service.duration}
                        </p>
                      )}
                      <p className="text-lg font-bold text-primary mt-2">
                        {formatCurrency(item.service.price)}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() =>
                            updateQuantity(item.service.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-12 text-center font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() =>
                            updateQuantity(item.service.id, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.service.stock}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Remove Button */}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeItem(item.service.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    {formatCurrency(getTotalPrice())}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total de artículos</span>
                  <span className="font-medium">{getTotalItems()}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">
                      {formatCurrency(getTotalPrice())}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-2">
                <Link href="/checkout" className="w-full">
                  <Button className="w-full" size="lg">
                    Proceder al Pago
                  </Button>
                </Link>
                <Link href="/servicios" className="w-full">
                  <Button variant="outline" className="w-full">
                    Continuar Comprando
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
