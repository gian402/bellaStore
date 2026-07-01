'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem, Product } from '@/types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  // Acciones
  addItem: (product: Product, cantidad?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, cantidad: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  // Calculados
  getTotal: () => number;
  getSubtotal: () => number;
  getItemCount: () => number;
  getItemQuantity: (productId: string) => number;
  isInCart: (productId: string) => boolean;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, cantidad = 1) => {
        const { items } = get();
        const existingItem = items.find((item) => item.producto.id === product.id);

        if (existingItem) {
          // Incrementar cantidad si ya existe
          const newCantidad = Math.min(
            existingItem.cantidad + cantidad,
            product.stock
          );
          set({
            items: items.map((item) =>
              item.producto.id === product.id
                ? {
                    ...item,
                    cantidad: newCantidad,
                    subtotal: item.precio_unitario * newCantidad,
                  }
                : item
            ),
          });
        } else {
          // Agregar nuevo ítem
          const precio = product.precio_oferta ?? product.precio;
          const newItem: CartItem = {
            id: `cart-${product.id}-${Date.now()}`,
            producto: product,
            cantidad: Math.min(cantidad, product.stock),
            precio_unitario: precio,
            subtotal: precio * Math.min(cantidad, product.stock),
          };
          set({ items: [...items, newItem] });
        }
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item.producto.id !== productId),
        });
      },

      updateQuantity: (productId, cantidad) => {
        if (cantidad <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.producto.id === productId
              ? {
                  ...item,
                  cantidad: Math.min(cantidad, item.producto.stock),
                  subtotal:
                    item.precio_unitario * Math.min(cantidad, item.producto.stock),
                }
              : item
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getTotal: () => {
        return get().items.reduce((acc, item) => acc + item.subtotal, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((acc, item) => acc + item.subtotal, 0);
      },

      getItemCount: () => {
        return get().items.reduce((acc, item) => acc + item.cantidad, 0);
      },

      getItemQuantity: (productId) => {
        const item = get().items.find((i) => i.producto.id === productId);
        return item?.cantidad ?? 0;
      },

      isInCart: (productId) => {
        return get().items.some((item) => item.producto.id === productId);
      },
    }),
    {
      name: 'carrito-tienda',
      storage: createJSONStorage(() => localStorage),
      // Solo persistir los items, no el estado del panel
      partialize: (state) => ({ items: state.items }),
    }
  )
);
