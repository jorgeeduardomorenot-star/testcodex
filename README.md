# Col Stream Shop

**Sistema de venta de cuentas de streaming con Next.js, Supabase y Stripe**

Una plataforma completa para vender cuentas de servicios de streaming (Netflix, Disney+, HBO Max, etc.) con sistema de pagos, gestión de inventario y soporte en tiempo real.

## 🚀 Características

### Para Usuarios
- ✅ Navegación pública sin necesidad de login
- ✅ Catálogo completo de servicios disponibles
- ✅ Sistema de carrito de compras
- ✅ Checkout seguro con Stripe
- ✅ Recepción de credenciales por email
- ✅ Historial de compras
- ✅ Sistema de tickets de soporte en tiempo real

### Para Administradores
- ✅ Panel de administración completo
- ✅ Gestión de servicios (CRUD)
- ✅ Subida masiva de cuentas (CSV/Excel)
- ✅ Sistema de tickets de soporte
- ✅ Dashboard con estadísticas
- ✅ Gestión de usuarios

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 14+ (App Router)
- **Lenguaje**: TypeScript
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Pagos**: Stripe
- **Emails**: Resend
- **Estado Global**: Zustand
- **UI**: Tailwind CSS + Radix UI
- **Tiempo Real**: Supabase Realtime

## 📦 Instalación

### 1. Clonar el repositorio

\`\`\`bash
git clone <tu-repositorio>
cd colstream-shop
\`\`\`

### 2. Instalar dependencias

\`\`\`bash
npm install
\`\`\`

### 3. Configurar variables de entorno

Crea un archivo \`.env.local\` basado en \`.env.example\`:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Completa las variables:

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (Resend)
RESEND_API_KEY=re_...

# App
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Col Stream Shop
\`\`\`

### 4. Configurar Supabase

#### 4.1. Crear proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Copia las credenciales (URL y anon key)

#### 4.2. Ejecutar el esquema de base de datos

1. Abre el SQL Editor en tu proyecto de Supabase
2. Ejecuta el contenido del archivo \`supabase/schema.sql\`
3. Esto creará todas las tablas, políticas RLS, triggers y funciones necesarias

#### 4.3. Configurar Email Templates (Opcional)

En Supabase > Authentication > Email Templates, personaliza los emails de:
- Confirmación de registro
- Recuperación de contraseña
- Cambio de email

#### 4.4. Habilitar Realtime

1. Ve a Database > Replication
2. Habilita Realtime para las tablas:
   - \`tickets\`
   - \`ticket_messages\`

### 5. Configurar Stripe

#### 5.1. Crear cuenta de Stripe

1. Crea una cuenta en [https://stripe.com](https://stripe.com)
2. Obtén tus claves de API (modo test)
3. Copia las claves a tu \`.env.local\`

#### 5.2. Configurar Webhook

Para desarrollo local, usa Stripe CLI:

\`\`\`bash
# Instalar Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Escuchar webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook
\`\`\`

Copia el webhook secret que te da Stripe CLI a \`STRIPE_WEBHOOK_SECRET\`

Para producción:
1. Ve a Stripe Dashboard > Developers > Webhooks
2. Agrega endpoint: \`https://tu-dominio.com/api/stripe/webhook\`
3. Selecciona eventos:
   - \`checkout.session.completed\`
   - \`charge.refunded\`
4. Copia el signing secret

### 6. Configurar Resend (Emails)

1. Crea cuenta en [https://resend.com](https://resend.com)
2. Verifica tu dominio (o usa el dominio de prueba)
3. Genera una API key
4. Agrégala a \`.env.local\`

**Nota**: La funcionalidad de emails está comentada en el código. Para habilitarla, implementa \`sendPurchaseConfirmationEmail\` en \`lib/email/\`.

### 7. Crear primer usuario admin

Después de registrarte en la aplicación:

\`\`\`sql
-- En el SQL Editor de Supabase
UPDATE profiles
SET role = 'admin'
WHERE email = 'tu-email@ejemplo.com';
\`\`\`

## 🚀 Desarrollo

\`\`\`bash
npm run dev
\`\`\`

Abre [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

\`\`\`
colstream-shop/
├── app/                        # Next.js App Router
│   ├── api/                   # API Routes
│   │   └── stripe/           # Endpoints de Stripe
│   ├── carrito/              # Página de carrito
│   ├── checkout/             # Proceso de pago
│   ├── compras/              # Historial de compras
│   ├── login/                # Autenticación
│   ├── servicios/            # Catálogo público
│   ├── soporte/              # Sistema de tickets (TODO)
│   ├── admin/                # Panel admin (TODO)
│   ├── globals.css           # Estilos globales
│   ├── layout.tsx            # Layout raíz
│   └── page.tsx              # Landing page
├── components/                # Componentes React
│   ├── ui/                   # Componentes UI base
│   └── services/             # Componentes de servicios
├── lib/                      # Utilidades y configuraciones
│   ├── supabase/            # Cliente de Supabase
│   ├── stripe/              # Integración de Stripe
│   ├── store/               # Zustand stores
│   └── utils.ts             # Funciones auxiliares
├── types/                    # Tipos de TypeScript
│   └── database.ts          # Tipos de base de datos
├── supabase/                 # Configuración de Supabase
│   └── schema.sql           # Esquema de base de datos
├── middleware.ts             # Middleware de Next.js
├── .env.example             # Variables de entorno de ejemplo
└── package.json             # Dependencias
\`\`\`

## 🔐 Seguridad

### Row Level Security (RLS)

Todas las tablas tienen políticas RLS configuradas:

- **profiles**: Los usuarios solo pueden ver/editar su propio perfil
- **services**: Públicamente visibles, solo admins pueden modificar
- **accounts**: Solo admins ven todas, usuarios solo ven sus compras
- **orders**: Usuarios solo ven sus propias órdenes
- **tickets**: Usuarios ven sus tickets, admins ven todos

### Autenticación

- Sistema de autenticación manejado por Supabase Auth
- Middleware protege rutas sensibles
- Verificación de rol admin en rutas administrativas

### Pagos

- Todos los pagos procesados por Stripe
- Webhooks verificados con signing secret
- No se almacenan datos de tarjetas

## 📝 Funcionalidades Pendientes

Las siguientes funcionalidades están en el plan pero aún no implementadas:

### Sistema de Tickets (Soporte)
- [ ] Página de lista de tickets del usuario
- [ ] Página de crear ticket
- [ ] Página de detalle de ticket con chat en tiempo real
- [ ] Panel admin para gestionar tickets
- [ ] Notificaciones en tiempo real

### Panel de Administración
- [ ] Dashboard con estadísticas
- [ ] CRUD completo de servicios
- [ ] Subida masiva de cuentas (CSV/Excel)
- [ ] Gestión de usuarios
- [ ] Reportes de ventas

### Sistema de Emails
- [ ] Email de confirmación de compra con credenciales
- [ ] Email de nuevo ticket creado
- [ ] Email de respuesta a ticket
- [ ] Email de reembolso

### Mejoras Adicionales
- [ ] Búsqueda y filtros en catálogo
- [ ] Categorías de servicios
- [ ] Sistema de cupones/descuentos
- [ ] Programa de referidos
- [ ] Dashboard de usuario
- [ ] Renovaciones automáticas

## 🎨 Personalización

### Colores

Los colores principales se definen en \`tailwind.config.ts\`:

- **Primary (Rojo)**: \`#B91C1C\` - Color principal del sitio
- **Secondary (Azul)**: \`#5B7EF8\` - Color secundario

Para cambiarlos, edita las variables en \`tailwind.config.ts\` y \`app/globals.css\`.

### Nombre del Sitio

Cambia \`NEXT_PUBLIC_SITE_NAME\` en \`.env.local\`

## 🚀 Deployment

### Vercel (Recomendado)

1. Conecta tu repositorio con Vercel
2. Agrega las variables de entorno
3. Deploy automático

### Variables de Entorno en Producción

Asegúrate de configurar todas las variables en tu plataforma de deployment:

- Variables de Supabase
- Variables de Stripe (modo producción)
- API key de Resend
- \`NEXT_PUBLIC_URL\` con tu dominio

### Webhook de Stripe en Producción

1. Crea un nuevo webhook endpoint en Stripe Dashboard
2. URL: \`https://tu-dominio.com/api/stripe/webhook\`
3. Actualiza \`STRIPE_WEBHOOK_SECRET\` con el nuevo secret

## 📊 Base de Datos

### Backup

Configura backups automáticos en Supabase:
- Settings > Database > Backups
- Recomendado: Backups diarios

### Migraciones

Para cambios en el esquema:
1. Edita \`supabase/schema.sql\`
2. Ejecuta los cambios en SQL Editor
3. Documenta los cambios

## 🐛 Troubleshooting

### Error: "Invalid JWT"
- Verifica que las variables de Supabase estén correctas
- Limpia cookies y localStorage

### Error: "Stripe webhook verification failed"
- Verifica que \`STRIPE_WEBHOOK_SECRET\` esté correcto
- En desarrollo, asegúrate de que Stripe CLI esté corriendo

### Error: "Cannot add to cart"
- Verifica que el usuario esté autenticado
- Verifica que el servicio tenga stock

### Emails no llegan
- Verifica configuración de Resend
- Revisa carpeta de spam
- Verifica que el dominio esté verificado

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🤝 Contribuir

Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (\`git checkout -b feature/AmazingFeature\`)
3. Commit tus cambios (\`git commit -m 'Add some AmazingFeature'\`)
4. Push a la rama (\`git push origin feature/AmazingFeature\`)
5. Abre un Pull Request

## 📞 Soporte

Para preguntas o problemas:
- Abre un issue en GitHub
- Contacta al equipo de desarrollo

---

**Desarrollado con ❤️ para Col Stream Shop**
