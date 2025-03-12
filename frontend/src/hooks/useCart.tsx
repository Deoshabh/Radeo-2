import React, { createContext, useState, useContext, useEffect } from 'react';

// Define types for cart items
export interface CartItem {
  _id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface CartState {
  items: CartItem[];
}

// Define the context type
export interface CartContextType {
  cart: CartState;
  addToCart: (product: any, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

// Create the context with default values
const CartContext = createContext<CartContextType>({
  cart: { items: [] },
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {}
});

// Custom hook to use the cart context
export const useCart = () => useContext(CartContext);

// Cart provider component
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize cart state from localStorage if available
  const [cart, setCart] = useState<CartState>(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : { items: [] };
    }
    return { items: [] };
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart]);

  // Add a product to the cart
  const addToCart = (product: any, quantity: number) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.items.findIndex(item => item._id === product._id);
      
      if (existingItemIndex >= 0) {
        // Update quantity if product already exists in cart
        const updatedItems = [...prevCart.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity
        };
        return { ...prevCart, items: updatedItems };
      } else {
        // Add new product to cart
        return {
          ...prevCart,
          items: [...prevCart.items, { ...product, quantity }]
        };
      }
    });
  };

  // Remove a product from the cart
  const removeFromCart = (productId: string) => {
    setCart(prevCart => ({
      ...prevCart,
      items: prevCart.items.filter(item => item._id !== productId)
    }));
  };

  // Update quantity of a product in the cart
  const updateQuantity = (productId: string, quantity: number) => {
    setCart(prevCart => ({
      ...prevCart,
      items: prevCart.items.map(item => 
        item._id === productId ? { ...item, quantity } : item
      )
    }));
  };

  // Clear the entire cart
  const clearCart = () => {
    setCart({ items: [] });
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider; 