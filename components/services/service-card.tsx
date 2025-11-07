'use client'

import Image from 'next/image'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { useCartStore } from '@/lib/store/cart'
import { ShoppingCart } from 'lucide-react'

interface Service {
  id: string
  name: string
  description: string | null
  image_url: string | null
  price: number
  stock: number
  category: string | null
  duration: string | null
  is_active: boolean
}

interface ServiceCardProps {
  service: Service
  isAuthenticated: boolean
}

export function ServiceCard({ service, isAuthenticated }: ServiceCardProps) {
  const addItem = useCartStore(state => state.addItem)

  const handleAddToCart = () => {
    addItem(service)
  }

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        {service.image_url && (
          <div className="relative w-full h-40 mb-4 rounded-md overflow-hidden bg-gray-100">
            <Image
              src={service.image_url}
              alt={service.name}
              fill
              className="object-cover"
            />
          </div>
        )}
        <CardTitle className="text-xl">{service.name}</CardTitle>
        {service.description && (
          <p className="text-sm text-gray-600 mt-2">{service.description}</p>
        )}
      </CardHeader>

      <CardContent className="flex-1">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(service.price)}
            </span>
            {service.duration && (
              <Badge variant="secondary">{service.duration}</Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {service.stock > 0 ? (
              <Badge variant="success">
                {service.stock} disponible{service.stock !== 1 ? 's' : ''}
              </Badge>
            ) : (
              <Badge variant="destructive">Sin stock</Badge>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          onClick={handleAddToCart}
          className="w-full"
          disabled={!isAuthenticated || service.stock === 0}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {!isAuthenticated
            ? 'Inicia sesión para comprar'
            : service.stock === 0
            ? 'Sin stock'
            : 'Agregar al carrito'}
        </Button>
      </CardFooter>
    </Card>
  )
}
