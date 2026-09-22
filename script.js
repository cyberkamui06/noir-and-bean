/* =========================
   BACKEND
========================= */

const API_URL =
    "https://music-affect-shoulder-boss.trycloudflare.com";


/* =========================
   PRODUCTS
========================= */

let products = [];

async function loadProducts() {

    try {

        const response =
            await fetch(
                `${API_URL}/api/products`
            );

        if (!response.ok) {

            throw new Error(
                "Failed to load products"
            );

        }


        products =
            await response.json();


        updateProductButtons();

    } catch (error) {

        console.error(
            "Failed to load products:",
            error
        );

    }

}


function updateProductButtons() {

    products.forEach(
        product => {

            const button =
                document.querySelector(
                    `.product-card button[onclick*="addToCart(${product.id},"]`
                );


            if (!button) return;


            const card =
                button.closest(
                    ".product-card"
                );


            if (!card) return;


            /* =========================
               PRODUCT NAME
            ========================= */

            const nameElement =
                card.querySelector(
                    "h3"
                );


            if (nameElement) {

                nameElement.textContent =
                    product.name.toUpperCase();

            }


            /* =========================
               DESCRIPTION
            ========================= */

            const descriptionElement =
                card.querySelector(
                    ".description"
                );


            if (descriptionElement) {

                descriptionElement.textContent =
                    product.description || "";

            }


            /* =========================
               PRICE
            ========================= */

            const priceElement =
                card.querySelector(
                    ".price"
                );


            if (priceElement) {

                priceElement.textContent =
                    `₦${Number(
                        product.price
                    ).toLocaleString()}`;

            }


            /* =========================
               IMAGE
            ========================= */

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


            /* =========================
               AVAILABILITY
            ========================= */

            if (product.available) {

                button.disabled =
                    false;


                button.textContent =
                    "ADD TO ORDER +";


                button.style.opacity =
                    "1";


                button.style.cursor =
                    "pointer";

            } else {

                button.disabled =
                    true;


                button.textContent =
                    "UNAVAILABLE";


                button.style.opacity =
                    "0.5";


                button.style.cursor =
                    "not-allowed";

            }

        }
    );

}


/* =========================
   CART
========================= */

let cart = [];


function addToCart(
    id,
    name,
    price
) {

    const product =
        products.find(
            product =>
                product.id === id
        );


    if (
        product &&
        !product.available
    ) {

        showToast(
            "Unavailable",
            `${name} is currently unavailable.`
        );


        return;

    }


    const existingItem =
        cart.find(
            item =>
                item.id === id
        );


    if (existingItem) {

        existingItem.quantity++;

    } else {

        cart.push({

            id: id,

            name: name,

            price: price,

            quantity: 1

        });

    }


    updateCart();


    showToast(
        "Added to cart",
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


    cartItems.innerHTML =
        "";


    let total = 0;

    let itemCount = 0;


    cart.forEach(
        (item, index) => {

            const itemTotal =
                item.price *
                item.quantity;


            total +=
                itemTotal;


            itemCount +=
                item.quantity;


            cartItems.innerHTML += `

                <div class="cart-item">

                    <div class="cart-item-top">

                        <span class="cart-item-name">

                            ${item.name}

                        </span>


                        <span class="cart-item-price">

                            ₦${itemTotal.toLocaleString()}

                        </span>

                    </div>


                    <div class="quantity-controls">

                        <button
                            onclick="decreaseQuantity(${index})"
                        >

                            −

                        </button>


                        <span>

                            ${item.quantity}

                        </span>


                        <button
                            onclick="increaseQuantity(${index})"
                        >

                            +

                        </button>


                        <button
                            class="remove-item"
                            onclick="removeItem(${index})"
                        >

                            REMOVE

                        </button>

                    </div>

                </div>

            `;

        }
    );


    if (
        cart.length === 0
    ) {

        cartItems.innerHTML = `

            <p style="
                color:#756d66;
                font-size:12px;
                padding:20px 0;
            ">

                Your order is empty.

            </p>

        `;

    }


    /* =========================
       DESKTOP CART COUNT
    ========================= */

    cartCount.textContent =
        itemCount;


    /* =========================
       MOBILE CART COUNT
    ========================= */

    if (mobileCartCount) {

        mobileCartCount.textContent =
            itemCount;

    }


    /* =========================
       CART TOTAL
    ========================= */

    cartTotal.textContent =
        `₦${total.toLocaleString()}`;

}


/* =========================
   INCREASE QUANTITY
========================= */

function increaseQuantity(index) {

    cart[index].quantity++;


    updateCart();

}


/* =========================
   DECREASE QUANTITY
========================= */

function decreaseQuantity(index) {

    if (
        cart[index].quantity > 1
    ) {

        cart[index].quantity--;

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

    cart.splice(
        index,
        1
    );


    updateCart();


    showToast(
        "Removed",
        "Item removed from your order."
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

    if (
        cart.length === 0
    ) {

        showToast(
            "Cart is empty",
            "Add something before checking out."
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

    orderType =
        type;


    document
        .querySelectorAll(
            ".order-option"
        )
        .forEach(
            option => {

                option.classList.remove(
                    "active"
                );

            }
        );


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


    if (
        type === "delivery"
    ) {

        addressGroup.style.display =
            "block";

    } else {

        addressGroup.style.display =
            "none";

    }

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


    checkoutItems.innerHTML =
        "";


    let total = 0;


    cart.forEach(
        item => {

            const itemTotal =
                item.price *
                item.quantity;


            total +=
                itemTotal;


            checkoutItems.innerHTML += `

                <div class="checkout-item">

                    <span>

                        ${item.name} × ${item.quantity}

                    </span>


                    <strong>

                        ₦${itemTotal.toLocaleString()}

                    </strong>

                </div>

            `;

        }
    );


    checkoutTotal.textContent =
        `₦${total.toLocaleString()}`;

}


/* =========================
   PLACE ORDER
========================= */

async function placeOrder() {

    const name =
        document
            .getElementById(
                "customer-name"
            )
            .value
            .trim();


    const email =
        document
            .getElementById(
                "customer-email"
            )
            .value
            .trim();


    const phone =
        document
            .getElementById(
                "customer-phone"
            )
            .value
            .trim();


    const address =
        document
            .getElementById(
                "customer-address"
            )
            .value
            .trim();


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


    /* =========================
       CHECK LATEST AVAILABILITY
    ========================= */

    try {

        const productResponse =
            await fetch(
                `${API_URL}/api/products`
            );


        if (
            productResponse.ok
        ) {

            const latestProducts =
                await productResponse.json();


            for (
                const item of cart
            ) {

                const product =
                    latestProducts.find(
                        product =>
                            product.id ===
                            item.id
                    );


                if (
                    !product ||
                    !product.available
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

        console.error(
            "Availability check failed:",
            error
        );

    }


    /* =========================
       PREPARE ORDER ITEMS
    ========================= */

    const orderItems =
        cart.map(
            item => ({

                productId:
                    item.id,


                quantity:
                    item.quantity

            })
        );


    try {

        showToast(
            "Processing order",
            "Please wait while we save your order."
        );


        /* =========================
           SEND ORDER TO BACKEND
        ========================= */

        const response =
            await fetch(
                `${API_URL}/api/orders`,
                {

                    method:
                        "POST",


                    headers: {

                        "Content-Type":
                            "application/json"

                    },


                    body:
                        JSON.stringify({

                            customer: {

                                name:
                                    name,


                                email:
                                    email,


                                phone:
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


        if (
            !response.ok
        ) {

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
            `Hello NOIR & BEAN \n\n`;


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


        order.items.forEach(
            item => {

                const itemTotal =
                    Number(
                        item.price
                    ) *
                    item.quantity;


                message +=
                    `${item.product.name} × ${item.quantity} — ₦${itemTotal.toLocaleString()}\n`;

            }
        );


        message +=
            `\nTOTAL: ₦${Number(
                order.total
            ).toLocaleString()}`;


        /* =========================
           WHATSAPP URL
        ========================= */

        const whatsappURL =
            "https://wa.me/2347040636421?text=" +
            encodeURIComponent(
                message
            );


        showToast(
            "Order placed!",
            `Order #${order.id} has been saved successfully.`
        );


        /* =========================
           CLEAR CART
        ========================= */

        cart = [];


        updateCart();


        closeCheckout();


        /* =========================
           OPEN WHATSAPP
        ========================= */

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

                /* =========================
                   HIDE LOADER
                ========================= */

                if (loader) {

                    loader.classList.add(
                        "loaded"
                    );

                }


                /* =========================
                   SHOW MOBILE ORDER BUTTON
                ========================= */

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
        ".product-card, .about, .contact-container, .section-title"
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

            entries.forEach(
                entry => {

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

                }
            );

        },

        {

            threshold:
                0.12

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


document
    .querySelectorAll(
        "#nav-links a"
    )
    .forEach(
        link => {

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


                    if (navLinks) {

                        navLinks.classList.remove(
                            "active"
                        );

                    }


                    if (menuToggle) {

                        menuToggle.classList.remove(
                            "active"
                        );

                    }

                }
            );

        }
    );


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
        async function (event) {

            event.preventDefault();


            const orderId =
                document
                    .getElementById(
                        "tracking-order-id"
                    )
                    .value
                    .trim();


            if (!orderId) {

                return;

            }


            trackingResult.innerHTML =
                "<p>Checking your order...</p>";


            try {

                const response =
                    await fetch(
                        `${API_URL}/api/orders/track/${orderId}`
                    );


                const data =
                    await response.json();


                if (
                    !response.ok
                ) {

                    trackingResult.innerHTML = `

                        <div class="tracking-error">

                            ${data.error || "Order not found."}

                        </div>

                    `;


                    return;

                }


                /* =========================
                   CURRENT STATUS
                ========================= */

                const status =
                    data.status
                        .replace(
                            "-",
                            " "
                        )
                        .toUpperCase();


                /* =========================
                   STATUS ORDER
                ========================= */

                const progressStatuses = [

                    "pending",

                    "confirmed",

                    "preparing",

                    "ready",

                    "delivered"

                ];


                const currentStatusIndex =
                    progressStatuses.indexOf(
                        data.status
                    );


                /* =========================
                   PROGRESS STEPS
                ========================= */

                const progressSteps = [

                    "PENDING",

                    "CONFIRMED",

                    "PREPARING",

                    "READY",

                    "DELIVERED"

                ];


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
                        .map(
                            item => `

                                <div class="tracking-item">

                                    <span>

                                        ${item.product.name}
                                        ×
                                        ${item.quantity}

                                    </span>


                                    <span>

                                        ₦${Number(
                                            item.price
                                        ).toLocaleString()}

                                    </span>

                                </div>

                            `
                        )
                        .join("");


                /* =========================
                   DISPLAY TRACKING
                ========================= */

                trackingResult.innerHTML = `

                    <div class="tracking-card">

                        <p class="tracking-order-number">

                            ORDER #${data.id}

                        </p>


                        <div class="tracking-status">

                            ${status}

                        </div>


                        <div class="tracking-progress">

                            ${progressHTML}

                        </div>


                        <div class="tracking-items">

                            ${items}

                        </div>


                        <div class="tracking-total">

                            <span>

                                TOTAL

                            </span>


                            <span>

                                ₦${Number(
                                    data.total
                                ).toLocaleString()}

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

/*
    Makes sure both the desktop
    and mobile cart counters start
    at 0 when the page opens.
*/

updateCart();


/*
    Load products from backend.
*/

loadProducts();