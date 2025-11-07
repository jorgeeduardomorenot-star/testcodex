'use client'

import { supabase } from './client'

export function subscribeToTicketUpdates(
  ticketId: string,
  callback: (payload: any) => void
) {
  return supabase
    .channel(`ticket:${ticketId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'ticket_messages',
        filter: `ticket_id=eq.${ticketId}`,
      },
      callback
    )
    .subscribe()
}

export function subscribeToUserTickets(
  userId: string,
  callback: (payload: any) => void
) {
  return supabase
    .channel(`user-tickets:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tickets',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe()
}

export function subscribeToAdminTickets(callback: (payload: any) => void) {
  return supabase
    .channel('admin-tickets')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tickets',
      },
      callback
    )
    .subscribe()
}
