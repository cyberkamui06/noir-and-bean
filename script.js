/* =========================
   CART
========================= */

let cart = [];


function addToCart(name, price) {

    const existingItem = cart.find(
        item => item.name === name
    );

    if (existingItem) {

        existingItem.quantity++;

    } else {

        cart.push({
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


function updateCart() {

    const cartItems =
        document.getElementById("cart-items");

    const cartCount =
        document.getElementById("cart-count");

    const cartTotal =
        document.getElementById("cart-total");

    cartItems.innerHTML = "";

    let total = 0;
    let itemCount = 0;


    cart.forEach((item, index) => {

        const itemTotal =
            item.price * item.quantity;

        total += itemTotal;

        itemCount += item.quantity;


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

    });


    if (cart.length === 0) {

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


    cartCount.textContent = itemCount;

    cartTotal.textContent =
        `₦${total.toLocaleString()}`;
}


function increaseQuantity(index) {

    cart[index].quantity++;

    updateCart();
}


function decreaseQuantity(index) {

    if (cart[index].quantity > 1) {

        cart[index].quantity--;

    } else {

        cart.splice(index, 1);

    }

    updateCart();
}


function removeItem(index) {

    cart.splice(index, 1);

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
        document.getElementById("cart-panel");

    cartPanel.classList.toggle("active");
}


/* =========================
   CHECKOUT
========================= */

let orderType = "delivery";


function checkout() {

    if (cart.length === 0) {

        showToast(
            "Cart is empty",
            "Add something before checking out."
        );

        return;
    }


    document
        .getElementById("checkout-overlay")
        .classList.add("active");


    updateCheckout();
}


function closeCheckout() {

    document
        .getElementById("checkout-overlay")
        .classList.remove("active");
}


function selectOrderType(type) {

    orderType = type;


    document
        .querySelectorAll(".order-option")
        .forEach(option => {

            option.classList.remove("active");

        });


    document
        .getElementById(type + "-option")
        .classList.add("active");


    const addressGroup =
        document.getElementById("address-group");


    if (type === "delivery") {

        addressGroup.style.display = "block";

    } else {

        addressGroup.style.display = "none";

    }

}


function updateCheckout() {

    const checkoutItems =
        document.getElementById("checkout-items");

    const checkoutTotal =
        document.getElementById("checkout-total");


    checkoutItems.innerHTML = "";


    let total = 0;


    cart.forEach(item => {

        const itemTotal =
            item.price * item.quantity;


        total += itemTotal;


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

    });


    checkoutTotal.textContent =
        `₦${total.toLocaleString()}`;
}


/* =========================
   PLACE ORDER
========================= */

function placeOrder() {

    const name =
        document
            .getElementById("customer-name")
            .value
            .trim();


    const phone =
        document
            .getElementById("customer-phone")
            .value
            .trim();


    const address =
        document
            .getElementById("customer-address")
            .value
            .trim();


    if (!name || !phone) {

        showToast(
            "Missing details",
            "Please enter your name and phone number."
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


    let total = 0;


    let message =
        `Hello NOIR & BEAN 👋\n\n`;


    message +=
        `New ${orderType} order\n\n`;


    message +=
        `Customer: ${name}\n`;


    message +=
        `Phone: ${phone}\n`;


    if (orderType === "delivery") {

        message +=
            `Address: ${address}\n`;

    }


    message +=
        `\nORDER:\n`;


    cart.forEach(item => {

        const itemTotal =
            item.price * item.quantity;


        total += itemTotal;


        message +=
            `${item.name} × ${item.quantity} — ₦${itemTotal.toLocaleString()}\n`;

    });


    message +=
        `\nTOTAL: ₦${total.toLocaleString()}`;


    const whatsappURL =
        "https://wa.me/2347040636421?text=" +
        encodeURIComponent(message);


    showToast(
        "Order ready",
        "Opening WhatsApp to complete your order."
    );


    setTimeout(() => {

        window.open(
            whatsappURL,
            "_blank"
        );

    }, 700);

}


/* =========================
   TOAST
========================= */

let toastTimer;


function showToast(title, message) {

    const toast =
        document.getElementById("toast");


    const toastTitle =
        document.getElementById("toast-title");


    const toastMessage =
        document.getElementById("toast-message");


    toastTitle.textContent = title;

    toastMessage.textContent = message;


    toast.classList.add("show");


    clearTimeout(toastTimer);


    toastTimer =
        setTimeout(() => {

            toast.classList.remove("show");

        }, 3000);

}


/* =========================
   PAGE LOADER
========================= */

window.addEventListener("load", () => {

    const loader =
        document.getElementById("page-loader");


    setTimeout(() => {

        loader.classList.add("loaded");

    }, 700);

});


/* =========================
   SCROLL REVEAL
========================= */

const revealElements =
    document.querySelectorAll(
        ".product-card, .about, .contact-container, .section-title"
    );


revealElements.forEach(element => {

    element.classList.add("reveal");

});


const revealObserver =
    new IntersectionObserver(

        entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

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
            threshold: 0.12
        }

    );


revealElements.forEach(element => {

    revealObserver.observe(element);

});


/* =========================
   INITIAL CART
========================= */

updateCart();