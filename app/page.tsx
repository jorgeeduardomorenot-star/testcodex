import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-800 to-primary-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Col Stream Shop
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            Las mejores cuentas de streaming a los mejores precios
          </p>
          <Link
            href="/servicios"
            className="bg-secondary hover:bg-secondary/90 px-8 py-3 rounded-lg text-lg font-semibold inline-block transition-colors"
          >
            Ver Servicios
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            ¿Por qué elegirnos?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2">Entrega Instantánea</h3>
              <p className="text-gray-600">
                Recibe tus cuentas por email inmediatamente después del pago
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold mb-2">100% Seguro</h3>
              <p className="text-gray-600">
                Pagos protegidos con Stripe. Tus datos están seguros
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-bold mb-2">Soporte 24/7</h3>
              <p className="text-gray-600">
                Sistema de tickets en tiempo real para resolver tus dudas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} Col Stream Shop. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
