import React, { createContext, useContext, useState, useCallback, useMemo } from "react";

export interface CartAddon {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  addons: CartAddon[];
  imageUrl?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((item: Omit<CartItem, "id">) => {
    try {
      const id = crypto.randomUUID();
      const newItem: CartItem = {
        ...item,
        id,
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 1),
        addons: (item.addons || []).map(a => ({ ...a, price: Number(a.price || 0) }))
      };
      setItems((prev) => [...(prev || []), newItem]);
    } catch (error) {
      console.error("Erro ao adicionar item ao carrinho:", error);
    }
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => (prev || []).filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => (prev || []).filter((i) => i.id !== id));
    } else {
      setItems((prev) => (prev || []).map((i) => (i.id === id ? { ...i, quantity: Number(quantity) } : i)));
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = useMemo(() => (items || []).reduce((sum, i) => sum + (Number(i.quantity) || 0), 0), [items]);
  
  const subtotal = useMemo(() => (items || []).reduce((sum, i) => {
    const itemPrice = Number(i.price || 0);
    const itemQuantity = Number(i.quantity || 0);
    const addons = i.addons || [];
    const addonTotal = addons.reduce((a, ad) => a + (Number(ad.price) || 0), 0);
    return sum + (itemPrice + addonTotal) * itemQuantity;
  }, 0), [items]);

  const value = useMemo(() => ({
    items: items || [],
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    subtotal
  }), [items, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    // Retorno seguro para evitar crash se usado fora do provider, embora o App.tsx já o envolva
    return {
      items: [],
      addItem: () => {},
      removeItem: () => {},
      updateQuantity: () => {},
      clearCart: () => {},
      totalItems: 0,
      subtotal: 0
    } as CartContextType;
  }
  return ctx;
};
