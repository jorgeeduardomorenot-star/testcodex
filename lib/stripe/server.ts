import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

interface OrderItem {
  service: {
    id: string
    name: string
    description: string | null
    image_url: string | null
    price: number
  }
  quantity: number
}

export async function createCheckoutSession(
  orderItems: OrderItem[],
  userId: string,
  orderId: string
) {
  const supabase = createClient()

  // Get user email
  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .single()

  if (!profile) throw new Error('User not found')

  const line_items = orderItems.map(item => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.service.name,
        description: item.service.description || undefined,
        images: item.service.image_url ? [item.service.image_url] : undefined,
      },
      unit_amount: Math.round(item.service.price * 100), // Convert to cents
    },
    quantity: item.quantity,
  }))

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items,
    success_url: `${process.env.NEXT_PUBLIC_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/carrito`,
    customer_email: profile.email,
    metadata: {
      order_id: orderId,
      user_id: userId,
    },
  })

  return session
}

export async function handleStripeWebhook(event: Stripe.Event) {
  const supabase = createClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const { order_id } = session.metadata!

      // Update order to completed
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'completed',
          stripe_session_id: session.id,
          stripe_payment_intent_id: session.payment_intent as string,
          completed_at: new Date().toISOString(),
        })
        .eq('id', order_id)

      if (error) {
        console.error('Error updating order:', error)
        throw error
      }

      // The database trigger will automatically assign accounts

      // TODO: Send email with purchase confirmation
      // await sendPurchaseConfirmationEmail(order_id)

      break
    }

    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge
      const paymentIntentId = charge.payment_intent as string

      // Find order by payment intent
      const { data: order } = await supabase
        .from('orders')
        .select('id')
        .eq('stripe_payment_intent_id', paymentIntentId)
        .single()

      if (order) {
        // Update order status to refunded
        await supabase
          .from('orders')
          .update({ status: 'refunded' })
          .eq('id', order.id)

        // TODO: Mark accounts as available again
        // TODO: Send refund notification email
      }

      break
    }
  }
}
