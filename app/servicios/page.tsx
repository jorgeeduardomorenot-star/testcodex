import { createClient } from '@/lib/supabase/server'
import { ServiceCard } from '@/components/services/service-card'
import Link from 'next/link'

export default async function ServicesPage() {
  const supabase = createClient()

  // Get user session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get all active services
  const { data: services, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching services:', error)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary">
              Col Stream Shop
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/servicios" className="text-gray-700 hover:text-primary">
                Servicios
              </Link>
              {user ? (
                <>
                  <Link href="/carrito" className="text-gray-700 hover:text-primary">
                    Carrito
                  </Link>
                  <Link href="/compras" className="text-gray-700 hover:text-primary">
                    Mis Compras
                  </Link>
                  <Link href="/soporte" className="text-gray-700 hover:text-primary">
                    Soporte
                  </Link>
                </>
              ) : (
                <Link
                  href="/login"
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
                >
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Servicios de Streaming
          </h1>
          <p className="text-gray-600">
            Encuentra las mejores cuentas a precios increíbles
          </p>
        </div>

        {!user && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-blue-900">
              <strong>Nota:</strong> Debes{' '}
              <Link href="/login" className="text-blue-600 hover:underline font-medium">
                iniciar sesión
              </Link>{' '}
              para agregar servicios al carrito y realizar compras.
            </p>
          </div>
        )}

        {!services || services.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">
              No hay servicios disponibles en este momento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(service => (
              <ServiceCard
                key={service.id}
                service={service}
                isAuthenticated={!!user}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} Col Stream Shop. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
