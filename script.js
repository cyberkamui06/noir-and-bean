/* =========================
   CONFIG
========================= */

const API_URL = "https://noir-and-bean-uwub.onrender.com";

const WHATSAPP_NUMBER = "2347040636421";


/* =========================
   HELPERS
========================= */

function formatCurrency(value) {
    return `₦${Number(value).toLocaleString()}`;
}


function escapeHTML(value = "") {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================
   PRODUCTS
========================= */

let products = [];


async function loadProducts() {
    try {
        const response = await fetch(
            `${API_URL}/api/products`
        );

        if (!response.ok) {
            throw new Error(
                "Failed to load products"
            );
        }

        products = await response.json();

        updateProductCards();
    } catch (error) {
        console.error(
            "Failed to load products:",
            error
        );
    }
}


/* =========================
   UPDATE PRODUCT CARDS
========================= */

function updateProductCards() {
    products.forEach(product => {
        const button =
            document.querySelector(
                `.product-card button[onclick*="addToCart(${product.id},"]`
            );

        if (!button) {
            return;
        }

        const card =
            button.closest(
                ".product-card"
            );

        if (!card) {
            return;
        }


        /* PRODUCT NAME */

        const nameElement =
            card.querySelector("h3");

        if (nameElement) {
            nameElement.textContent =
                product.name;
        }


        /* DESCRIPTION */

        const descriptionElement =
            card.querySelector(
                ".description"
            );

        if (descriptionElement) {
            descriptionElement.textContent =
                product.description || "";
        }


        /* PRICE */

        const priceElement =
            card.querySelector(
                ".price"
            );

        if (priceElement) {
            priceElement.textContent =
                formatCurrency(
                    product.price
                );
        }


        /* IMAGE */

        const imageElement =
            card.querySelector(
                ".product-image img"
            );

        if (
            imageElement &&
            product.image
        ) {
            imageElement.src =
                product.image;

            imageElement.alt =
                product.name;
        }


        /* AVAILABILITY */

        if (product.available) {
            button.disabled = false;

            button.innerHTML = `
                <span>Add to order</span>
                <span>+</span>
            `;

            button.style.opacity = "1";
            button.style.cursor = "pointer";

            button.removeAttribute(
                "aria-disabled"
            );
        } else {
            button.disabled = true;

            button.textContent =
                "Unavailable";

            button.style.opacity = "0.45";
            button.style.cursor =
                "not-allowed";

            button.setAttribute(
                "aria-disabled",
                "true"
            );
        }
    });
}


/* =========================
   CART
========================= */

let cart = [];


/* =========================
   ADD TO CART
========================= */

function addToCart(
    id,
    fallbackName,
    fallbackPrice
) {
    const product =
        products.find(
            item =>
                item.id === id
        );

    if (
        product &&
        !product.available
    ) {
        showToast(
            "Unavailable",
            `${product.name} is currently unavailable.`
        );

        return;
    }


    /*
        Prefer the latest product data
        from the backend.

        The fallback values are only used
        if product data has not loaded yet.
    */

    const name =
        product?.name ||
        fallbackName;

    const price =
        product
            ? Number(product.price)
            : Number(fallbackPrice);


    const existingItem =
        cart.find(
            item =>
                item.id === id
        );


    if (existingItem) {
        existingItem.quantity += 1;

        /*
            Keep price/name synced
            with the latest backend data.
        */

        existingItem.name = name;
        existingItem.price = price;
    } else {
        cart.push({
            id,
            name,
            price,
            quantity: 1
        });
    }


    updateCart();


    showToast(
        "Added to order",
        `${name} has been added to your order.`
    );
}


/* =========================
   UPDATE CART
========================= */

function updateCart() {
    const cartItems =
        document.getElementById(
            "cart-items"
        );

    const cartCount =
        document.getElementById(
            "cart-count"
        );

    const mobileCartCount =
        document.getElementById(
            "mobile-cart-count"
        );

    const cartTotal =
        document.getElementById(
            "cart-total"
        );


    if (
        !cartItems ||
        !cartCount ||
        !cartTotal
    ) {
        return;
    }


    cartItems.innerHTML = "";


    let total = 0;
    let itemCount = 0;


    cart.forEach(
        (item, index) => {
            const itemTotal =
                item.price *
                item.quantity;


            total += itemTotal;

            itemCount +=
                item.quantity;


            cartItems.insertAdjacentHTML(
                "beforeend",
                `
                    <div class="cart-item">

                        <div class="cart-item-top">

                            <span class="cart-item-name">
                                ${escapeHTML(item.name)}
                            </span>

                            <span class="cart-item-price">
                                ${formatCurrency(itemTotal)}
                            </span>

                        </div>


                        <div class="quantity-controls">

                            <button
                                type="button"
                                onclick="decreaseQuantity(${index})"
                                aria-label="Decrease quantity"
                            >
                                −
                            </button>

                            <span>
                                ${item.quantity}
                            </span>

                            <button
                                type="button"
                                onclick="increaseQuantity(${index})"
                                aria-label="Increase quantity"
                            >
                                +
                            </button>

                            <button
                                type="button"
                                class="remove-item"
                                onclick="removeItem(${index})"
                            >
                                Remove
                            </button>

                        </div>

                    </div>
                `
            );
        }
    );


    if (cart.length === 0) {
        cartItems.innerHTML = `
            <p
                style="
                    color:#8e8074;
                    font-size:12px;
                    padding:20px 0;
                "
            >
                Your order is empty.
            </p>
        `;
    }


    cartCount.textContent =
        itemCount;


    if (mobileCartCount) {
        mobileCartCount.textContent =
            itemCount;
    }


    cartTotal.textContent =
        formatCurrency(total);
}


/* =========================
   QUANTITY
========================= */

function increaseQuantity(index) {
    if (!cart[index]) {
        return;
    }

    cart[index].quantity += 1;

    updateCart();
}


function decreaseQuantity(index) {
    if (!cart[index]) {
        return;
    }


    if (
        cart[index].quantity > 1
    ) {
        cart[index].quantity -= 1;
    } else {
        cart.splice(
            index,
            1
        );
    }


    updateCart();
}


/* =========================
   REMOVE ITEM
========================= */

function removeItem(index) {
    if (!cart[index]) {
        return;
    }


    const removedItem =
        cart[index];


    cart.splice(
        index,
        1
    );


    updateCart();


    showToast(
        "Removed",
        `${removedItem.name} was removed from your order.`
    );
}


/* =========================
   CART PANEL
========================= */

function toggleCart() {
    const cartPanel =
        document.getElementById(
            "cart-panel"
        );


    if (!cartPanel) {
        return;
    }


    cartPanel.classList.toggle(
        "active"
    );
}


/* =========================
   CHECKOUT
========================= */

let orderType =
    "delivery";


function checkout() {
    if (cart.length === 0) {
        showToast(
            "Your order is empty",
            "Choose a drink before checking out."
        );

        return;
    }


    const checkoutOverlay =
        document.getElementById(
            "checkout-overlay"
        );


    if (!checkoutOverlay) {
        return;
    }


    checkoutOverlay.classList.add(
        "active"
    );


    updateCheckout();
}


/* =========================
   CLOSE CHECKOUT
========================= */

function closeCheckout() {
    const checkoutOverlay =
        document.getElementById(
            "checkout-overlay"
        );


    if (!checkoutOverlay) {
        return;
    }


    checkoutOverlay.classList.remove(
        "active"
    );
}


/* =========================
   SELECT ORDER TYPE
========================= */

function selectOrderType(type) {
    orderType = type;


    document
        .querySelectorAll(
            ".order-option"
        )
        .forEach(option => {
            option.classList.remove(
                "active"
            );
        });


    const selectedOption =
        document.getElementById(
            `${type}-option`
        );


    if (selectedOption) {
        selectedOption.classList.add(
            "active"
        );
    }


    const addressGroup =
        document.getElementById(
            "address-group"
        );


    if (!addressGroup) {
        return;
    }


    addressGroup.style.display =
        type === "delivery"
            ? "block"
            : "none";
}


/* =========================
   UPDATE CHECKOUT
========================= */

function updateCheckout() {
    const checkoutItems =
        document.getElementById(
            "checkout-items"
        );

    const checkoutTotal =
        document.getElementById(
            "checkout-total"
        );


    if (
        !checkoutItems ||
        !checkoutTotal
    ) {
        return;
    }


    checkoutItems.innerHTML = "";


    let total = 0;


    cart.forEach(item => {
        const itemTotal =
            item.price *
            item.quantity;


        total += itemTotal;


        checkoutItems.insertAdjacentHTML(
            "beforeend",
            `
                <div class="checkout-item">

                    <span>
                        ${escapeHTML(item.name)}
                        ×
                        ${item.quantity}
                    </span>

                    <strong>
                        ${formatCurrency(itemTotal)}
                    </strong>

                </div>
            `
        );
    });


    checkoutTotal.textContent =
        formatCurrency(total);
}


/* =========================
   PLACE ORDER
========================= */

async function placeOrder() {
    const nameInput =
        document.getElementById(
            "customer-name"
        );

    const emailInput =
        document.getElementById(
            "customer-email"
        );

    const phoneInput =
        document.getElementById(
            "customer-phone"
        );

    const addressInput =
        document.getElementById(
            "customer-address"
        );


    if (
        !nameInput ||
        !emailInput ||
        !phoneInput ||
        !addressInput
    ) {
        showToast(
            "Checkout error",
            "Some checkout fields could not be found."
        );

        return;
    }


    const name =
        nameInput.value.trim();

    const email =
        emailInput.value.trim();

    const phone =
        phoneInput.value.trim();

    const address =
        addressInput.value.trim();


    if (
        !name ||
        !email ||
        !phone
    ) {
        showToast(
            "Missing details",
            "Please enter your name, email and phone number."
        );

        return;
    }


    if (
        orderType === "delivery" &&
        !address
    ) {
        showToast(
            "Missing address",
            "Please enter your delivery address."
        );

        return;
    }


    if (cart.length === 0) {
        showToast(
            "Your order is empty",
            "Choose a drink before placing your order."
        );

        return;
    }


    /* =========================
       CHECK AVAILABILITY
    ========================= */

    try {
        const productResponse =
            await fetch(
                `${API_URL}/api/products`
            );


        if (productResponse.ok) {
            const latestProducts =
                await productResponse.json();


            for (const item of cart) {
                const latestProduct =
                    latestProducts.find(
                        product =>
                            product.id ===
                            item.id
                    );


                if (
                    !latestProduct ||
                    !latestProduct.available
                ) {
                    showToast(
                        "Product unavailable",
                        `${item.name} is no longer available.`
                    );

                    return;
                }
            }
        }
    } catch (error) {
        /*
            The backend validates the products again
            when the order is submitted, so this
            preliminary check failing does not have
            to stop checkout.
        */

        console.error(
            "Availability check failed:",
            error
        );
    }


    /* =========================
       PREPARE ORDER ITEMS
    ========================= */

    const orderItems =
        cart.map(item => ({
            productId:
                item.id,

            quantity:
                item.quantity
        }));


    try {
        showToast(
            "Processing order",
            "We're saving your order."
        );


        /* =========================
           SEND TO BACKEND
        ========================= */

        const response =
            await fetch(
                `${API_URL}/api/orders`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            customer: {
                                name,
                                email,
                                phone,

                                address:
                                    orderType ===
                                    "delivery"
                                        ? address
                                        : "Pickup"
                            },

                            items:
                                orderItems
                        })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {
            throw new Error(
                data.error ||
                "Failed to create order"
            );
        }


        const order =
            data.order;


        /* =========================
           WHATSAPP MESSAGE
        ========================= */

        let message =
            `Hello NOIR & BEAN\n\n`;


        message +=
            `New ${orderType} order\n\n`;


        message +=
            `Order ID: #${order.id}\n`;


        message +=
            `Customer: ${name}\n`;


        message +=
            `Email: ${email}\n`;


        message +=
            `Phone: ${phone}\n`;


        if (
            orderType === "delivery"
        ) {
            message +=
                `Address: ${address}\n`;
        }


        message +=
            `\nORDER:\n`;


        order.items.forEach(item => {
            const itemTotal =
                Number(item.price) *
                item.quantity;


            message +=
                `${item.product.name} × ${item.quantity} — ${formatCurrency(itemTotal)}\n`;
        });


        message +=
            `\nTOTAL: ${formatCurrency(order.total)}`;


        const whatsappURL =
            `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;


        /* =========================
           SUCCESS
        ========================= */

        showToast(
            "Order placed",
            `Order #${order.id} has been saved successfully.`
        );


        cart = [];

        updateCart();

        closeCheckout();


        /*
            Clear checkout fields
            after successful order.
        */

        nameInput.value = "";
        emailInput.value = "";
        phoneInput.value = "";
        addressInput.value = "";


        setTimeout(
            () => {
                window.open(
                    whatsappURL,
                    "_blank"
                );
            },
            700
        );
    } catch (error) {
        console.error(
            "Order failed:",
            error
        );


        showToast(
            "Order failed",
            error.message ||
                "We couldn't save your order. Please try again."
        );
    }
}


/* =========================
   TOAST
========================= */

let toastTimer;


function showToast(
    title,
    message
) {
    const toast =
        document.getElementById(
            "toast"
        );

    const toastTitle =
        document.getElementById(
            "toast-title"
        );

    const toastMessage =
        document.getElementById(
            "toast-message"
        );


    if (
        !toast ||
        !toastTitle ||
        !toastMessage
    ) {
        return;
    }


    toastTitle.textContent =
        title;

    toastMessage.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {
                toast.classList.remove(
                    "show"
                );
            },
            3000
        );
}


/* =========================
   PAGE LOADER
========================= */

window.addEventListener(
    "load",
    () => {
        const loader =
            document.getElementById(
                "page-loader"
            );


        setTimeout(
            () => {
                if (loader) {
                    loader.classList.add(
                        "loaded"
                    );
                }


                document.body.classList.add(
                    "page-ready"
                );
            },
            700
        );
    }
);


/* =========================
   SCROLL REVEAL
========================= */

const revealElements =
    document.querySelectorAll(
        [
            ".product-card",
            ".about",
            ".tracking-container",
            ".contact-container",
            ".section-heading"
        ].join(", ")
    );


revealElements.forEach(
    element => {
        element.classList.add(
            "reveal"
        );
    }
);


const revealObserver =
    new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (
                    entry.isIntersecting
                ) {
                    entry.target.classList.add(
                        "visible"
                    );

                    revealObserver.unobserve(
                        entry.target
                    );
                }
            });
        },
        {
            threshold: 0.1
        }
    );


revealElements.forEach(
    element => {
        revealObserver.observe(
            element
        );
    }
);


/* =========================
   MOBILE MENU
========================= */

function toggleMobileMenu() {
    const navLinks =
        document.getElementById(
            "nav-links"
        );

    const menuToggle =
        document.getElementById(
            "menu-toggle"
        );


    if (
        !navLinks ||
        !menuToggle
    ) {
        return;
    }


    navLinks.classList.toggle(
        "active"
    );

    menuToggle.classList.toggle(
        "active"
    );
}


/* CLOSE MOBILE MENU
   AFTER LINK CLICK
========================= */

document
    .querySelectorAll(
        "#nav-links a"
    )
    .forEach(link => {
        link.addEventListener(
            "click",
            () => {
                const navLinks =
                    document.getElementById(
                        "nav-links"
                    );

                const menuToggle =
                    document.getElementById(
                        "menu-toggle"
                    );


                navLinks?.classList.remove(
                    "active"
                );

                menuToggle?.classList.remove(
                    "active"
                );
            }
        );
    });


/* =========================
   ORDER TRACKING
========================= */

const trackingForm =
    document.getElementById(
        "tracking-form"
    );

const trackingResult =
    document.getElementById(
        "tracking-result"
    );


if (
    trackingForm &&
    trackingResult
) {
    trackingForm.addEventListener(
        "submit",
        async event => {
            event.preventDefault();


            const orderInput =
                document.getElementById(
                    "tracking-order-id"
                );


            if (!orderInput) {
                return;
            }


            const orderId =
                orderInput.value.trim();


            if (!orderId) {
                return;
            }


            trackingResult.innerHTML = `
                <p>
                    Checking your order...
                </p>
            `;


            try {
                const response =
                    await fetch(
                        `${API_URL}/api/orders/track/${orderId}`
                    );


                const data =
                    await response.json();


                if (!response.ok) {
                    trackingResult.innerHTML = `
                        <div class="tracking-error">
                            ${escapeHTML(
                                data.error ||
                                "Order not found."
                            )}
                        </div>
                    `;

                    return;
                }


                /* =========================
                   STATUS
                ========================= */

                const rawStatus =
                    String(
                        data.status ||
                        "pending"
                    );


                const status =
                    rawStatus
                        .replaceAll("-", " ")
                        .toUpperCase();


                const progressStatuses = [
                    "pending",
                    "confirmed",
                    "preparing",
                    "ready",
                    "delivered"
                ];


                const progressSteps = [
                    "PENDING",
                    "CONFIRMED",
                    "PREPARING",
                    "READY",
                    "DELIVERED"
                ];


                const currentStatusIndex =
                    progressStatuses.indexOf(
                        rawStatus
                    );


                /* =========================
                   PROGRESS BAR
                ========================= */

                const progressHTML =
                    progressSteps
                        .map(
                            (
                                step,
                                index
                            ) => {
                                const completed =
                                    index <=
                                    currentStatusIndex
                                        ? "completed"
                                        : "";


                                const line =
                                    index <
                                    progressSteps.length - 1
                                        ? `
                                            <div
                                                class="progress-line ${
                                                    index <
                                                    currentStatusIndex
                                                        ? "completed"
                                                        : ""
                                                }"
                                            ></div>
                                        `
                                        : "";


                                return `
                                    <div
                                        class="progress-step ${completed}"
                                    >
                                        <span
                                            class="progress-dot"
                                        ></span>

                                        <span>
                                            ${step}
                                        </span>
                                    </div>

                                    ${line}
                                `;
                            }
                        )
                        .join("");


                /* =========================
                   ORDER ITEMS
                ========================= */

                const items =
                    data.items
                        .map(item => {
                            const itemTotal =
                                Number(
                                    item.price
                                ) *
                                item.quantity;


                            return `
                                <div
                                    class="tracking-item"
                                >
                                    <span>
                                        ${escapeHTML(
                                            item.product.name
                                        )}
                                        ×
                                        ${item.quantity}
                                    </span>

                                    <span>
                                        ${formatCurrency(
                                            itemTotal
                                        )}
                                    </span>
                                </div>
                            `;
                        })
                        .join("");


                /* =========================
                   DISPLAY
                ========================= */

                trackingResult.innerHTML = `
                    <div class="tracking-card">

                        <p class="tracking-order-number">
                            Order #${data.id}
                        </p>

                        <div class="tracking-status">
                            ${escapeHTML(status)}
                        </div>

                        ${
                            rawStatus !==
                            "cancelled"
                                ? `
                                    <div
                                        class="tracking-progress"
                                    >
                                        ${progressHTML}
                                    </div>
                                `
                                : ""
                        }

                        <div class="tracking-items">
                            ${items}
                        </div>

                        <div class="tracking-total">

                            <span>
                                Total
                            </span>

                            <span>
                                ${formatCurrency(
                                    data.total
                                )}
                            </span>

                        </div>

                    </div>
                `;
            } catch (error) {
                console.error(
                    "Tracking failed:",
                    error
                );


                trackingResult.innerHTML = `
                    <div class="tracking-error">
                        Unable to connect to the server.
                        Please try again.
                    </div>
                `;
            }
        }
    );
}


/* =========================
   START
========================= */

updateCart();

loadProducts();