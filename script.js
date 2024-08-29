document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation
    const bar = document.getElementById('bar');
    const close = document.getElementById('close');
    const nav = document.getElementById('navbar');

    if (bar) {
        bar.addEventListener('click', () => {
            nav.classList.add('active');
        });
    }

    if (close) {
        close.addEventListener('click', () => {
            nav.classList.remove('active');
        });
    }

    // Cart Functionality
    const cartCountElement = document.getElementById('cart-count');
    const mobileCartCountElement = document.getElementById('mobile-cart-count');
    const cartItemsElement = document.getElementById('cart-items');
    const cartSubtotalElement = document.getElementById('cart-subtotal');
    const cartTotalElement = document.getElementById('cart-total');
    const shippingFeeElement = document.getElementById('shipping-fee');
    const couponSelect = document.getElementById('coupon-select');
    const applyCouponButton = document.getElementById('apply-coupon');
    const couponDiscountElement = document.getElementById('coupon-discount');

    // Load cart data from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let cartCount = parseInt(localStorage.getItem('cartCount')) || 0;
    let couponDiscount = parseFloat(localStorage.getItem('couponDiscount')) || 0;

    // Update cart count display
    cartCountElement.textContent = cartCount;
    mobileCartCountElement.textContent = cartCount;

    // Handle 'Add to Cart' button clicks
    document.querySelectorAll('.cart').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();

            const productData = event.target.closest('.pro').dataset;
            addToCart(productData);
        });
    });

    function addToCart(productData) {
        cartCount++;
        cartCountElement.textContent = cartCount;
        mobileCartCountElement.textContent = cartCount;
        localStorage.setItem('cartCount', cartCount);

        const existingProductIndex = cart.findIndex(item => item.id === productData.id);
        if (existingProductIndex !== -1) {
            cart[existingProductIndex].quantity++;
        } else {
            cart.push({
                id: productData.id,
                name: productData.name,
                price: parseFloat(productData.price),
                image: productData.image,
                quantity: 1,
                subtotal: parseFloat(productData.price)
            });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartUI();
    }

    function updateCartUI() {
        cartItemsElement.innerHTML = '';
        let cartSubtotal = 0;

        cart.forEach(item => {
            const subtotal = item.price * item.quantity;
            cartSubtotal += subtotal;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><i class="far fa-times-circle" onclick="removeItem('${item.id}')"></i></td>
                <td><img src="${item.image}" alt="${item.name}"></td>
                <td>${item.name}</td>
                <td>${item.price.toFixed(2)}</td>
                <td><input type="number" value="${item.quantity}" min="1" onchange="updateQuantity('${item.id}', this.value)"></td>
                <td>${subtotal.toFixed(2)}</td>
            `;
            cartItemsElement.appendChild(row);
        });

        const shippingFee = calculateShippingFee(cartSubtotal);
        const total = cartSubtotal + shippingFee - couponDiscount;

        cartSubtotalElement.textContent = `$${cartSubtotal.toFixed(2)}`;
        shippingFeeElement.textContent = `$${shippingFee.toFixed(2)}`;
        couponDiscountElement.textContent = `-$${couponDiscount.toFixed(2)}`;
        cartTotalElement.textContent = `$${total.toFixed(2)}`;
    }

    function removeItem(id) {
        cart = cart.filter(item => item.id !== id);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartUI();
        updateCartCount();
    }

    function updateQuantity(id, quantity) {
        quantity = parseInt(quantity) || 1;
        cart = cart.map(item => {
            if (item.id === id) {
                item.quantity = quantity;
                item.subtotal = item.price * quantity;
            }
            return item;
        });
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartUI();
    }

    function updateCartCount() {
        cartCount = cart.length;
        cartCountElement.textContent = cartCount;
        mobileCartCountElement.textContent = cartCount;
        localStorage.setItem('cartCount', cartCount);
    }

    // Reset Cart Functionality
    function resetCart() {
        cart = [];
        cartCount = 0;
        couponDiscount = 0;
        localStorage.removeItem('cart');
        localStorage.removeItem('cartCount');
        localStorage.removeItem('couponDiscount');
        updateCartUI();
        updateCartCount();
    }

    // Auto Reset Cart
    function autoResetCart() {
        resetCart();
    }

    const resetButton = document.getElementById('reset-cart');
    if (resetButton) {
        resetButton.addEventListener('click', autoResetCart);
    }

    // Calculate shipping fee based on cart subtotal
    function calculateShippingFee(subtotal) {
        if (subtotal === 0) {
            return 0; // No shipping fee if there are no products
        } else if (subtotal > 300) {
            return 0;
        } else if (subtotal > 200) {
            return 5;
        } else {
            return 10;
        }
    }    
    // Apply selected coupon
    function applyCoupon() {
        const selectedOption = couponSelect.options[couponSelect.selectedIndex];
        const discountValue = parseFloat(selectedOption.dataset.discount);
        const discountPercent = parseFloat(selectedOption.dataset.percent);
        const subtotal = parseFloat(cartSubtotalElement.textContent.replace('$', ''));
        let discount = 0;

        if (discountPercent > 0) {
            if (subtotal > 500) {
                discount = subtotal * (discountPercent / 100);
            }
        } else {
            if (subtotal > 300 && discountValue === 20) {
                discount = discountValue;
            } else if (subtotal > 200 && discountValue === 10) {
                discount = discountValue;
            } else if (subtotal > 100 && discountValue === 5) {
                discount = discountValue;
            }
        }

        couponDiscount = discount;
        localStorage.setItem('couponDiscount', couponDiscount);
        updateCartUI();
    }

    if (applyCouponButton) {
        applyCouponButton.addEventListener('click', applyCoupon);
    }

    // Initial cart UI update
    updateCartUI();
});
