import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define type for cart items
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

// Define cart context type
interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

// Create the context with default values
const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalItems: 0,
  totalPrice: 0,
});

// Provider component
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Add item to cart
  const addItem = (item: CartItem) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(i => i.id === item.id);
      
      if (existingItem) {
        // Update quantity if item already exists
        return currentItems.map(i => 
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      } else {
        // Add new item
        return [...currentItems, item];
      }
    });
  };

  // Remove item from cart
  const removeItem = (id: string) => {
    setItems(currentItems => currentItems.filter(i => i.id !== id));
  };

  // Update item quantity
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    
    setItems(currentItems => 
      currentItems.map(i => i.id === id ? { ...i, quantity } : i)
    );
  };

  // Clear cart
  const clearCart = () => {
    setItems([]);
  };

  // Calculate total items and price
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook for using cart context
export const useCart = () => useContext(CartContext);

export default CartContext;
