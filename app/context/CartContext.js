"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  getAnonymousCartStorageKey,
  getCartStorageKey,
  getLegacyCartStorageKey,
  mergeCartItems,
  sanitizeCartItems,
} from "../lib/cart";

const CartContext = createContext(null);

function readStoredCart(key) {
  const savedCart = localStorage.getItem(key);
  if (!savedCart) return [];

  try {
    return sanitizeCartItems(JSON.parse(savedCart));
  } catch (error) {
    console.error(`Failed to parse saved cart "${key}":`, error);
    localStorage.removeItem(key);
    return [];
  }
}

function cartMatches(items, snapshot) {
  if (!Array.isArray(snapshot) || items.length !== snapshot.length) {
    return false;
  }

  return items.every(
    (item, index) =>
      String(item.id) === String(snapshot[index]?.id) &&
      item.quantity === snapshot[index]?.quantity
  );
}

export function CartProvider({ children, userId = null, userRole = null }) {
  const [cartItems, setCartItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const storageKey = getCartStorageKey(userId);

  useEffect(() => {
    let isActive = true;

    try {
      localStorage.removeItem(getLegacyCartStorageKey());
      let items = readStoredCart(storageKey);

      if (userId) {
        const anonymousKey = getAnonymousCartStorageKey();
        const anonymousItems = readStoredCart(anonymousKey);

        if (userRole === "customer" && anonymousItems.length > 0) {
          items = mergeCartItems(items, anonymousItems);
          try {
            localStorage.setItem(storageKey, JSON.stringify(items));
            localStorage.removeItem(anonymousKey);
          } catch (error) {
            console.error("Failed to transfer the anonymous cart:", error);
          }
        }
      }

      queueMicrotask(() => {
        if (!isActive) return;
        setCartItems(items);
        setIsLoaded(true);
      });
    } catch (error) {
      console.error("Failed to load cart:", error);
      queueMicrotask(() => {
        if (!isActive) return;
        setCartItems([]);
        setIsLoaded(true);
      });
    }

    return () => {
      isActive = false;
    };
  }, [storageKey, userId, userRole]);

  useEffect(() => {
    if (!isLoaded) return;

    try {
      localStorage.setItem(storageKey, JSON.stringify(cartItems));
    } catch (error) {
      console.error("Failed to save cart:", error);
    }
  }, [cartItems, isLoaded, storageKey]);

  function addToCart(dish) {
    if (!isLoaded) return;
    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => String(item.id) === String(dish.id)
      );

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === dish.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...currentItems,
        {
          ...dish,
          quantity: 1,
        },
      ];
    });
  }

  function increaseQuantity(id) {
    if (!isLoaded) return;
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        String(item.id) === String(id) &&
        Number.isSafeInteger(item.quantity + 1)
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  }

  function decreaseQuantity(id) {
    if (!isLoaded) return;
    setCartItems((currentItems) =>
      currentItems
        .map((item) =>
          String(item.id) === String(id)
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeFromCart(id) {
    if (!isLoaded) return;
    setCartItems((currentItems) =>
      currentItems.filter((item) => String(item.id) !== String(id))
    );
  }

  function clearCart() {
    if (!isLoaded) return;
    setCartItems([]);
  }

  function clearCartIfUnchanged(snapshot) {
    if (!cartMatches(cartItems, snapshot)) return false;
    setCartItems([]);
    return true;
  }

  const canShop = userRole !== "staff";

  return (
    <CartContext.Provider
      value={{
        cartItems: isLoaded && canShop ? cartItems : [],
        isLoaded,
        userId,
        canShop,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        clearCartIfUnchanged,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider.");
  }
  return context;
}