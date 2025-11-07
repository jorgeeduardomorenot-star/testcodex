import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Service {
  id: string
  name: string
  price: number
  image_url: string | null
  stock: number
  duration: string | null
}

interface CartItem {
  service: Service
  quantity: number
}

interface CartStore {
  items: CartItem[]
  addItem: (service: Service) => void
  removeItem: (serviceId: string) => void
  updateQuantity: (serviceId: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (service: Service) => {
        const items = get().items
        const existingItem = items.find(item => item.service.id === service.id)

        if (existingItem) {
          // Check if we can add more based on stock
          if (existingItem.quantity < service.stock) {
            set({
              items: items.map(item =>
                item.service.id === service.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            })
          }
        } else {
          set({ items: [...items, { service, quantity: 1 }] })
        }
      },

      removeItem: (serviceId: string) => {
        set({ items: get().items.filter(item => item.service.id !== serviceId) })
      },

      updateQuantity: (serviceId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(serviceId)
          return
        }

        set({
          items: get().items.map(item =>
            item.service.id === serviceId
              ? { ...item, quantity: Math.min(quantity, item.service.stock) }
              : item
          ),
        })
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.service.price * item.quantity,
          0
        )
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)
