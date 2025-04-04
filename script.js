

// Cart functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart from localStorage if available
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    updateCartCount();
    
    // Add to cart functionality
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const product = {
                id: productCard.dataset.id,
                name: productCard.dataset.name,
                price: parseFloat(productCard.dataset.price),
                image: productCard.dataset.image,
                quantity: 1
            };
            
            // Check if product already in cart
            const existingProductIndex = cart.findIndex(item => item.id === product.id);
            
            if (existingProductIndex !== -1) {
                // Increment quantity if already in cart
                cart[existingProductIndex].quantity += 1;
            } else {
                // Add new product to cart
                cart.push(product);
            }
            
            // Save cart to localStorage
            localStorage.setItem('cart', JSON.stringify(cart));
            
            // Update cart count
            updateCartCount();
            
            // Show toast notification
            showToast('Item added to cart!');
        });
    });
    
    // Cart modal functionality
    const cartLink = document.getElementById('cart-link');
    const cartModal = document.getElementById('cart-modal');
    const continueShopping = document.getElementById('continue-shopping');
    const continueShoppingAfterOrder = document.getElementById('continue-shopping-after-order');
    const closeButtons = document.querySelectorAll('.close-modal');
    const checkoutBtn = document.getElementById('checkout-btn');
    const orderModal = document.getElementById('order-modal');
    
    cartLink.addEventListener('click', function(e) {
        e.preventDefault();
        openCartModal();
    });
    
    continueShopping.addEventListener('click', function() {
        cartModal.style.display = 'none';
    });
    
    continueShoppingAfterOrder.addEventListener('click', function() {
        orderModal.style.display = 'none';
        // Clear cart after successful order
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    });
    
    checkoutBtn.addEventListener('click', function() {
        if (cart.length > 0) {
            // Process checkout
            processCheckout();
        } else {
            alert('Your cart is empty!');
        }
    });
    
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === cartModal) {
            cartModal.style.display = 'none';
        }
        if (e.target === orderModal) {
            orderModal.style.display = 'none';
        }
    });
    
    // Function to update cart count
    function updateCartCount() {
        const cartCount = document.getElementById('cart-count');
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.innerText = `(${totalItems})`;
    }
    
    // Function to show toast notification
    function showToast(message) {
        const toast = document.getElementById('toast');
        toast.innerText = message;
        toast.className = 'toast show';
        setTimeout(() => {
            toast.className = toast.className.replace('show', '');
        }, 3000);
    }
    
    // Function to open cart modal
    function openCartModal() {
        cartModal.style.display = 'block';
        renderCartItems();
        calculateCartTotals();
    }
    
    // Function to render cart items
    function renderCartItems() {
        const cartItemsContainer = document.getElementById('cart-items');
        const emptyCartMessage = document.getElementById('empty-cart-message');
        
        // Clear previous items
        cartItemsContainer.innerHTML = '';
        
        if (cart.length === 0) {
            emptyCartMessage.style.display = 'block';
            document.querySelector('.cart-table').style.display = 'none';
        } else {
            emptyCartMessage.style.display = 'none';
            document.querySelector('.cart-table').style.display = 'table';
            
            // Add items to cart
            cart.forEach((item, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>
                        <div class="cart-product">
                            <div class="cart-product-icon"><i class="fas fa-${item.image}"></i></div>
                            <div class="cart-product-info">
                                <h4>${item.name}</h4>
                            </div>
                        </div>
                    </td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td>
                        <div class="quantity-control">
                            <button class="quantity-btn decrease" data-index="${index}">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn increase" data-index="${index}">+</button>
                        </div>
                    </td>
                    <td>$${(item.price * item.quantity).toFixed(2)}</td>
                    <td>
                        <button class="remove-btn" data-index="${index}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                cartItemsContainer.appendChild(row);
            });
            
            // Add event listeners to quantity buttons
            document.querySelectorAll('.quantity-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const index = parseInt(this.dataset.index);
                    if (this.classList.contains('decrease')) {
                        if (cart[index].quantity > 1) {
                            cart[index].quantity -= 1;
                        }
                    } else if (this.classList.contains('increase')) {
                        cart[index].quantity += 1;
                    }
                    
                    // Save cart to localStorage
                    localStorage.setItem('cart', JSON.stringify(cart));
                    
                    // Re-render cart
                    renderCartItems();
                    calculateCartTotals();
                    updateCartCount();
                });
            });
            
            // Add event listeners to remove buttons
            document.querySelectorAll('.remove-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const index = parseInt(this.dataset.index);
                    cart.splice(index, 1);
                    
                    // Save cart to localStorage
                    localStorage.setItem('cart', JSON.stringify(cart));
                    
                    // Re-render cart
                    renderCartItems();
                    calculateCartTotals();
                    updateCartCount();
                });
            });
        }
    }
    
    // Function to calculate cart totals
    function calculateCartTotals() {
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const shipping = subtotal > 0 ? 10 : 0;
        const tax = subtotal * 0.07;
        const total = subtotal + shipping + tax;
        
        document.getElementById('cart-subtotal').innerText = `$${subtotal.toFixed(2)}`;
        document.getElementById('cart-shipping').innerText = `$${shipping.toFixed(2)}`;
        document.getElementById('cart-tax').innerText = `$${tax.toFixed(2)}`;
        document.getElementById('cart-total').innerText = `$${total.toFixed(2)}`;
    }
    
    // Function to process checkout
    function processCheckout() {
        // Generate random order number
        const orderNumber = 'AM-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        document.getElementById('order-number').innerText = orderNumber;
        
        // Hide cart modal
        cartModal.style.display = 'none';
        
        // Show order success modal
        orderModal.style.display = 'block';
    }
    
    // Scroll to top functionality
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.style.display = 'block';
        } else {
            scrollToTopBtn.style.display = 'none';
        }
    });
    
    scrollToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});
