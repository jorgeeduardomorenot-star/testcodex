import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function ComprasPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/compras')
  }

  // Get user's orders with items and accounts
  const { data: orders } = await supabase
    .from('orders')
    .select(
      `
      *,
      order_items (
        *,
        services:service_id (name, duration),
        accounts:account_id (email, password, profile_name, pin)
      )
    `
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const statusColors: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
    pending: 'warning',
    completed: 'success',
    failed: 'destructive',
    refunded: 'default',
  }

  const statusLabels: Record<string, string> = {
    pending: 'Pendiente',
    completed: 'Completado',
    failed: 'Fallido',
    refunded: 'Reembolsado',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-primary hover:underline mb-4 inline-block">
            ← Volver al inicio
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Mis Compras</h1>
          <p className="text-gray-600 mt-2">
            Aquí puedes ver todas tus compras y acceder a tus cuentas
          </p>
        </div>

        {!orders || orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600 mb-4">Aún no has realizado ninguna compra</p>
              <Link href="/servicios">
                <button className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90">
                  Ver Servicios
                </button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">
                        Orden #{order.id.slice(0, 8)}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <Badge variant={statusColors[order.status]}>
                      {statusLabels[order.status]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.order_items.map((item: any) => (
                      <div
                        key={item.id}
                        className="border-l-4 border-primary pl-4 py-2"
                      >
                        <div className="flex justify-between mb-2">
                          <div>
                            <h3 className="font-semibold">{item.services.name}</h3>
                            {item.services.duration && (
                              <p className="text-sm text-gray-600">
                                Duración: {item.services.duration}
                              </p>
                            )}
                          </div>
                          <p className="font-medium">
                            {formatCurrency(item.unit_price)}
                          </p>
                        </div>

                        {item.accounts && order.status === 'completed' && (
                          <div className="bg-gray-50 rounded-lg p-4 mt-2">
                            <p className="text-sm font-medium mb-2">
                              Credenciales de Acceso:
                            </p>
                            <div className="space-y-1 text-sm">
                              <p>
                                <strong>Email:</strong> {item.accounts.email}
                              </p>
                              <p>
                                <strong>Contraseña:</strong> {item.accounts.password}
                              </p>
                              {item.accounts.profile_name && (
                                <p>
                                  <strong>Perfil:</strong> {item.accounts.profile_name}
                                </p>
                              )}
                              {item.accounts.pin && (
                                <p>
                                  <strong>PIN:</strong> {item.accounts.pin}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    <div className="border-t pt-4 flex justify-between items-center">
                      <span className="font-semibold">Total Pagado:</span>
                      <span className="text-xl font-bold text-primary">
                        {formatCurrency(order.total_amount)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
