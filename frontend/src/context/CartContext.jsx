import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);

const getProductId = (product) => {
    return String(product?._id || product?.id || '');
};

const getInitialCart = () => {
    try {
        const savedCart = localStorage.getItem('cart');

        if (!savedCart) {
            return [];
        }

        const parsedCart = JSON.parse(savedCart);

        return Array.isArray(parsedCart) ? parsedCart : [];
    } catch (error) {
        console.error('Failed to load cart:', error);
        return [];
    }
};

export function CartProvider({ children }) {
    const [cart, setCart] = useState(getInitialCart);

    useEffect(() => {
        try {
            localStorage.setItem('cart', JSON.stringify(cart));
        } catch (error) {
            console.error('Failed to save cart:', error);
        }
    }, [cart]);

    const addToCart = (product, quantity = 1) => {
        const productId = getProductId(product);
        const safeQuantity = Math.max(1, Number(quantity) || 1);

        if (!productId) {
            console.error('Cannot add product without an ID:', product);
            return;
        }

        setCart((previousCart) => {
            const existingItem = previousCart.find(
                (item) => getProductId(item) === productId
            );

            if (existingItem) {
                return previousCart.map((item) =>
                    getProductId(item) === productId
                        ? {
                            ...item,
                            quantity: item.quantity + safeQuantity,
                        }
                        : item
                );
            }

            // Preserve the complete product, including its image
            return [
                ...previousCart,
                {
                    ...product,
                    quantity: safeQuantity,
                },
            ];
        });
    };

    const removeFromCart = (id) => {
        const productId = String(id);

        setCart((previousCart) =>
            previousCart.filter(
                (item) => getProductId(item) !== productId
            )
        );
    };

    const updateQuantity = (id, quantity) => {
        const productId = String(id);
        const safeQuantity = Number(quantity);

        if (!Number.isFinite(safeQuantity) || safeQuantity <= 0) {
            removeFromCart(productId);
            return;
        }

        setCart((previousCart) =>
            previousCart.map((item) =>
                getProductId(item) === productId
                    ? {
                        ...item,
                        quantity: Math.floor(safeQuantity),
                    }
                    : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const totalItems = cart.reduce(
        (sum, item) => sum + (Number(item.quantity) || 0),
        0
    );

    const totalPrice = cart.reduce(
        (sum, item) =>
            sum +
            (Number(item.price) || 0) *
            (Number(item.quantity) || 0),
        0
    );

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                totalItems,
                totalPrice,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error('useCart must be used inside a CartProvider');
    }

    return context;
};