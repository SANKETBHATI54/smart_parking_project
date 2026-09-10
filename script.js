/* =========================================================
   SMART PARK - COMPLETE JAVASCRIPT
========================================================= */

const STORAGE = {
    lots: "smart_parking_lots",
    bookings: "smart_parking_bookings",
    customers: "smart_parking_customers",
    session: "smart_parking_session"
};

/* =========================================================
   DEFAULT DATA
========================================================= */

const defaultLots = [
    {id:1,number:"A-1",location:"Zone 1, Level 1",price:50,status:"booked"},
    {id:2,number:"A-2",location:"Zone 1, Level 1",price:50,status:"available"},
    {id:3,number:"A-3",location:"Zone 1, Level 1",price:50,status:"available"},
    {id:4,number:"A-4",location:"Zone 1, Level 1",price:50,status:"available"},
    {id:5,number:"A-5",location:"Zone 1, Level 1",price:50,status:"available"},
    {id:6,number:"A-6",location:"Zone 1, Level 1",price:50,status:"booked"},
    {id:7,number:"A-7",location:"Zone 1, Level 1",price:50,status:"available"},
    {id:8,number:"A-8",location:"Zone 1, Level 1",price:50,status:"available"},
    {id:9,number:"A-9",location:"Zone 1, Level 1",price:50,status:"available"},
    {id:10,number:"A-10",location:"Zone 1, Level 1",price:50,status:"available"},
    {id:11,number:"A-11",location:"Zone 1, Level 2",price:50,status:"booked"},
    {id:12,number:"A-12",location:"Zone 1, Level 2",price:50,status:"booked"},
    {id:13,number:"A-13",location:"Zone 1, Level 2",price:50,status:"available"},
    {id:14,number:"A-14",location:"Zone 1, Level 2",price:50,status:"booked"},
    {id:15,number:"A-15",location:"Zone 1, Level 2",price:50,status:"available"}
];

const defaultBookings = [
    {
        id:"BK-1001",
        lotNumber:"A-1",
        customerName:"Rahul Sharma",
        customerEmail:"rahul@example.com",
        date:"10 Sep 2026",
        amount:50,
        paymentMethod:"upi",
        status:"active"
    },
    {
        id:"BK-1002",
        lotNumber:"A-6",
        customerName:"Priya Verma",
        customerEmail:"priya@example.com",
        date:"10 Sep 2026",
        amount:50,
        paymentMethod:"upi",
        status:"active"
    },
    {
        id:"BK-1003",
        lotNumber:"A-11",
        customerName:"Amit Kumar",
        customerEmail:"amit@example.com",
        date:"09 Sep 2026",
        amount:50,
        paymentMethod:"card",
        status:"completed"
    },
    {
        id:"BK-1004",
        lotNumber:"A-12",
        customerName:"Neha Singh",
        customerEmail:"neha@example.com",
        date:"09 Sep 2026",
        amount:50,
        paymentMethod:"upi",
        status:"completed"
    },
    {
        id:"BK-1005",
        lotNumber:"A-14",
        customerName:"Vikas Gupta",
        customerEmail:"vikas@example.com",
        date:"08 Sep 2026",
        amount:50,
        paymentMethod:"upi",
        status:"cancelled"
    }
];

const defaultCustomers = [
    {
        id:1,
        name:"Rahul Sharma",
        email:"rahul@example.com",
        phone:"+91 98765 43210",
        joinedDate:"02 Sep 2026",
        status:"verified"
    },
    {
        id:2,
        name:"Priya Verma",
        email:"priya@example.com",
        phone:"+91 98765 11223",
        joinedDate:"03 Sep 2026",
        status:"verified"
    },
    {
        id:3,
        name:"Amit Kumar",
        email:"amit@example.com",
        phone:"+91 98111 22334",
        joinedDate:"04 Sep 2026",
        status:"verified"
    },
    {
        id:4,
        name:"Neha Singh",
        email:"neha@example.com",
        phone:"+91 98999 55667",
        joinedDate:"05 Sep 2026",
        status:"suspended"
    },
    {
        id:5,
        name:"Vikas Gupta",
        email:"vikas@example.com",
        phone:"+91 97654 33221",
        joinedDate:"06 Sep 2026",
        status:"verified"
    }
];

/* =========================================================
   STATE
========================================================= */

let lots = load(STORAGE.lots,defaultLots);
let bookings = load(STORAGE.bookings,defaultBookings);
let customers = load(STORAGE.customers,defaultCustomers);
let session = load(STORAGE.session,null);

let screen = session
    ? (session.role === "admin" ? "admin" : "customer")
    : "login";

let loginMode = "customer";
let selectedSlot = null;
let selectedPayment = "upi";
let currentBooking = null;
let adminTab = "overview";

/* =========================================================
   STORAGE
========================================================= */

function load(key,fallback){

    try{

        const value = localStorage.getItem(key);

        return value
            ? JSON.parse(value)
            : fallback;

    }catch(error){

        console.error(error);

        return fallback;
    }
}

function save(key,value){
    localStorage.setItem(key,JSON.stringify(value));
}

/* =========================================================
   HELPERS
========================================================= */

function escapeHTML(value){

    return String(value ?? "")
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");
}

function formatMoney(amount){
    return "₹" + Number(amount).toFixed(2);
}

function dateNow(){

    const d = new Date();

    return d.toLocaleDateString("en-IN",{
        day:"2-digit",
        month:"short",
        year:"numeric"
    });
}

function bookingID(){

    return "B-" + Date.now();
}

function showToast(message){

    const toast = document.getElementById("toast");

    if(!toast)return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(window.toastTimer);

    window.toastTimer = setTimeout(()=>{
        toast.classList.remove("show");
    },2500);
}

/* =========================================================
   MAIN RENDER
========================================================= */

function render(){

    const app = document.getElementById("app");

    let html = "";

    if(screen === "login"){
        html = loginPage();
    }

    else if(screen === "customer"){
        html = header() + customerPage();
    }

    else if(screen === "payment"){
        html = header() + paymentPage();
    }

    else if(screen === "ticket"){
        html = header() + ticketPage();
    }

    else if(screen === "admin"){
        html = header() + adminPage();
    }

    app.innerHTML = html;

    attachEvents();

    if(screen === "admin" && adminTab === "overview"){
        setTimeout(drawRevenueChart,50);
    }

    if(screen === "ticket"){
        setTimeout(generateQR,100);
    }
}

/* =========================================================
   HEADER
========================================================= */

function header(){

    return `
        <header class="topbar">

            <div class="topbar-inner">

                <div class="brand">

                    <div class="brand-mark">
                        🚗
                    </div>

                    <div>

                        <div class="brand-name">
                            SMART PARK
                        </div>

                        <span class="brand-sub">
                            FUTURISTIC AUTONOMOUS PARKING
                        </span>

                    </div>

                </div>

                <div class="top-actions">

                    <button class="outline-btn">
                        ♙ &nbsp;${escapeHTML(session?.name || "Admin")}
                    </button>

                    <button
                        class="outline-btn danger-text"
                        id="logoutBtn">

                        ⇥ &nbsp;Logout

                    </button>

                </div>

            </div>

        </header>
    `;
}

/* =========================================================
   LOGIN
========================================================= */

function loginPage(){

    return `
        <main class="login-page">

            <section class="login-card card">

                <div class="login-icon">
                    🚗
                </div>

                <h1>
                    Welcome to Smart Park
                </h1>

                <p>
                    Futuristic Autonomous Parking System
                </p>

                <div class="mode-switch">

                    <button
                        id="customerMode"
                        class="${loginMode === "customer" ? "active" : ""}">
                        Customer
                    </button>

                    <button
                        id="adminMode"
                        class="${loginMode === "admin" ? "active" : ""}">
                        Admin
                    </button>

                </div>

                ${
                    loginMode === "customer"
                    ? customerLogin()
                    : adminLogin()
                }

            </section>

        </main>
    `;
}

function customerLogin(){

    return `
        <form id="customerLoginForm">

            <div class="form-group">

                <label>
                    Full Name
                </label>

                <input
                    class="input"
                    id="customerName"
                    placeholder="Rahul Sharma"
                    required>

            </div>

            <div class="form-group">

                <label>
                    Email Address
                </label>

                <input
                    class="input"
                    id="customerEmail"
                    type="email"
                    placeholder="rahul@example.com"
                    required>

            </div>

            <div class="form-group">

                <label>
                    Phone Number
                </label>

                <input
                    class="input"
                    id="customerPhone"
                    placeholder="9876543210"
                    required>

            </div>

            <button class="primary-btn full">
                Continue to Parking
            </button>

        </form>
    `;
}

function adminLogin(){

    return `
        <form id="adminLoginForm">

            <div class="form-group">

                <label>
                    Admin ID
                </label>

                <input
                    class="input"
                    id="adminId"
                    placeholder="admin"
                    required>

            </div>

            <div class="form-group">

                <label>
                    Password
                </label>

                <input
                    class="input"
                    id="adminPassword"
                    type="password"
                    placeholder="admin"
                    required>

            </div>

            <button class="primary-btn full">
                Login as Admin
            </button>

            <p style="font-size:11px;margin-top:15px;">
                Demo: admin / admin
            </p>

        </form>
    `;
}

/* =========================================================
   CUSTOMER LOGIN
========================================================= */

function customerLoginHandler(e){

    e.preventDefault();

    const name =
        document.getElementById("customerName").value.trim();

    const email =
        document.getElementById("customerEmail").value.trim();

    const phone =
        document.getElementById("customerPhone").value.trim();

    let customer =
        customers.find(c =>
            c.email.toLowerCase() === email.toLowerCase()
        );

    if(!customer){

        customer = {
            id: Date.now(),
            name,
            email,
            phone,
            joinedDate:dateNow(),
            status:"verified"
        };

        customers.push(customer);

    }else{

        customer.name = name;
        customer.phone = phone;
    }

    save(STORAGE.customers,customers);

    session = {
        role:"customer",
        name,
        email,
        phone,
        customerId:customer.id
    };

    save(STORAGE.session,session);

    screen = "customer";

    render();
}

/* =========================================================
   ADMIN LOGIN
========================================================= */

function adminLoginHandler(e){

    e.preventDefault();

    const id =
        document.getElementById("adminId").value.trim();

    const password =
        document.getElementById("adminPassword").value;

    if(id !== "admin" || password !== "admin"){

        showToast("Invalid admin credentials");

        return;
    }

    session = {
        role:"admin",
        name:"Administrator"
    };

    save(STORAGE.session,session);

    screen = "admin";

    render();
}

/* =========================================================
   LOGOUT
========================================================= */

function logout(){

    localStorage.removeItem(STORAGE.session);

    session = null;
    selectedSlot = null;
    currentBooking = null;

    screen = "login";

    render();
}

/* =========================================================
   CUSTOMER PAGE
========================================================= */

function customerPage(){

    return `
        <main class="customer-main">

            <div class="customer-head">

                <div>

                    <h1>
                        Select a Parking Slot
                    </h1>

                    <p>
                        Click on any available green spot below
                        to book your parking.
                    </p>

                </div>

                <div class="status-key">

                    <div class="status-item">
                        <span class="status-dot available"></span>
                        Available
                    </div>

                    <div class="status-item">
                        <span class="status-dot booked"></span>
                        Booked
                    </div>

                    <div class="status-item">
                        <span class="status-dot selected"></span>
                        Selected
                    </div>

                </div>

            </div>

            <section class="slot-panel">

                <div class="slot-grid">

                    ${lots.map(lot => {

                        const available =
                            lot.status === "available";

                        const selected =
                            selectedSlot === lot.number;

                        return `
                            <button
                                class="slot
                                    ${available ? "available" : ""}
                                    ${selected ? "selected" : ""}"
                                data-slot="${lot.number}"
                                ${available ? "" : "disabled"}>

                                <span class="car-icon">
                                    🚗
                                </span>

                                <span class="slot-name">
                                    ${lot.number}
                                </span>

                                ${
                                    available
                                    ? `
                                        <span class="price-pill">
                                            ₹${lot.price}
                                        </span>
                                      `
                                    : ""
                                }

                            </button>
                        `;

                    }).join("")}

                </div>

            </section>

        </main>

        ${
            selectedSlot
            ? bookingBar()
            : ""
        }
    `;
}

/* =========================================================
   SLOT SELECTION
========================================================= */

function selectSlot(number){

    const lot =
        lots.find(x => x.number === number);

    if(!lot){

        showToast("Parking slot not found");

        return;
    }

    if(lot.status !== "available"){

        showToast("This slot is already booked");

        return;
    }

    selectedSlot = number;

    render();
}

/* =========================================================
   BOOKING BAR
========================================================= */

function bookingBar(){

    const lot =
        lots.find(x => x.number === selectedSlot);

    if(!lot)return "";

    return `
        <div class="fixed-booking-bar">

            <div class="fixed-booking-bar-inner">

                <div class="booking-info">

                    <div class="booking-info-icon">
                        ⌖
                    </div>

                    <div>

                        <div class="booking-label">
                            Selected Slot
                        </div>

                        <div class="booking-slot">

                            ${lot.number}

                            <span>
                                - ₹${lot.price}
                            </span>

                        </div>

                    </div>

                </div>

                <div class="booking-actions">

                    <button
                        class="secondary-btn"
                        id="cancelSlotBtn">

                        Cancel

                    </button>

                    <button
                        class="primary-btn payment-btn"
                        id="proceedPaymentBtn">

                        Proceed to Secure Payment

                    </button>

                </div>

            </div>

        </div>
    `;
}

/* =========================================================
   PAYMENT PAGE
========================================================= */

function paymentPage(){

    const lot =
        lots.find(x => x.number === selectedSlot);

    if(!lot){

        screen = "customer";

        return customerPage();
    }

    return `
        <main class="checkout-page">

            <section class="checkout-card">

                <div class="checkout-title-row">

                    <div class="checkout-icon">
                        ▣
                    </div>

                    <h1>
                        Secure Checkout
                    </h1>

                </div>

                <div class="checkout-summary">

                    <div class="summary-row">

                        <span>
                            Parking Spot:
                        </span>

                        <strong>
                            ${lot.number}
                        </strong>

                    </div>

                    <div class="summary-divider"></div>

                    <div class="summary-row amount">

                        <span>
                            Total Amount:
                        </span>

                        <strong>
                            ${formatMoney(lot.price)}
                        </strong>

                    </div>

                </div>

                <label class="checkout-label">
                    Choose Payment Method
                </label>

                <div class="payment-methods">

                    <button
                        class="payment-method
                        ${selectedPayment === "upi" ? "active" : ""}"
                        data-payment="upi">

                        ⚡ UPI

                    </button>

                    <button
                        class="payment-method
                        ${selectedPayment === "card" ? "active" : ""}"
                        data-payment="card">

                        ▣ Card

                    </button>

                    <button
                        class="payment-method
                        ${selectedPayment === "netbanking" ? "active" : ""}"
                        data-payment="netbanking">

                        🏛 NetBank

                    </button>

                </div>

                <div class="payment-fields">

                    ${paymentFields()}

                </div>

                <div class="checkout-actions">

                    <button
                        class="checkout-back"
                        id="backPaymentBtn">

                        Back

                    </button>

                    <button
                        class="primary-btn"
                        id="payBtn">

                        Pay ₹${lot.price}.00

                    </button>

                </div>

                <div class="demo-payment-note">
                    Demo payment system — no real money is charged.
                </div>

            </section>

        </main>
    `;
}

/* =========================================================
   PAYMENT FIELDS
========================================================= */

function paymentFields(){

    if(selectedPayment === "upi"){

        return `
            <div class="form-group">

                <label>
                    UPI ID / VPA
                </label>

                <input
                    class="payment-input"
                    id="paymentInput"
                    value="${escapeHTML(
                        (session?.name || "rahul")
                        .toLowerCase()
                        .replace(/\s+/g,"")
                    )}@oksbi"
                    placeholder="rahul@oksbi">

                <div class="upi-chips">

                    <button data-upi="googlepay">
                        Google Pay
                    </button>

                    <button data-upi="phonepe">
                        PhonePe
                    </button>

                    <button data-upi="paytm">
                        Paytm
                    </button>

                </div>

            </div>
        `;
    }

    if(selectedPayment === "card"){

        return `
            <div class="form-group">

                <label>
                    Card Number
                </label>

                <input
                    class="payment-input"
                    id="paymentInput"
                    maxlength="19"
                    placeholder="1234 5678 9012 3456">

            </div>

            <div class="payment-mini-row">

                <input
                    class="payment-input"
                    placeholder="MM / YY">

                <input
                    class="payment-input"
                    placeholder="CVV"
                    type="password">

            </div>
        `;
    }

    return `
        <div class="form-group">

            <label>
                Select Bank
            </label>

            <select
                class="payment-input"
                id="paymentInput">

                <option value="">
                    Select your bank
                </option>

                <option>
                    State Bank of India
                </option>

                <option>
                    HDFC Bank
                </option>

                <option>
                    ICICI Bank
                </option>

                <option>
                    Axis Bank
                </option>

                <option>
                    Punjab National Bank
                </option>

            </select>

        </div>
    `;
}

/* =========================================================
   PAYMENT METHOD
========================================================= */

function changePaymentMethod(method){

    selectedPayment = method;

    render();
}

/* =========================================================
   UPI QUICK BUTTON
========================================================= */

function setUPI(type){

    const input =
        document.getElementById("paymentInput");

    if(!input)return;

    if(type === "googlepay")
        input.value = "rahul@okicici";

    if(type === "phonepe")
        input.value = "rahul@ybl";

    if(type === "paytm")
        input.value = "rahul@paytm";
}

/* =========================================================
   PAYMENT
========================================================= */

function makePayment(){

    const lot =
        lots.find(x => x.number === selectedSlot);

    if(!lot){

        showToast("Please select a parking slot");

        screen = "customer";

        render();

        return;
    }

    if(lot.status !== "available"){

        showToast("This slot is already booked");

        selectedSlot = null;
        screen = "customer";

        render();

        return;
    }

    /* Create booking */

    const booking = {

        id: bookingID(),

        lotNumber:lot.number,

        customerName:session.name,

        customerEmail:session.email,

        customerPhone:session.phone,

        date:dateNow(),

        amount:lot.price,

        paymentMethod:selectedPayment,

        status:"active"
    };

    bookings.push(booking);

    /* Change slot */

    lot.status = "booked";

    save(STORAGE.bookings,bookings);
    save(STORAGE.lots,lots);

    currentBooking = booking;

    selectedSlot = null;

    screen = "ticket";

    render();
}

/* =========================================================
   TICKET PAGE
========================================================= */

function ticketPage(){

    if(!currentBooking){

        screen = "customer";

        return customerPage();
    }

    const b = currentBooking;

    return `
        <main class="ticket-page">

            <section class="ticket-card">

                <div class="ticket-success-head">

                    <div class="success-check">
                        ✓
                    </div>

                    <h1>
                        BOOKED
                    </h1>

                    <p>
                        Digital QR Ticket Generated &amp; Emailed
                    </p>

                </div>

                <div class="ticket-body">

                    <div class="ticket-top-meta">

                        <div>

                            <span class="ticket-label">
                                Spot Number
                            </span>

                            <strong>
                                ${b.lotNumber}
                            </strong>

                        </div>

                        <div class="ticket-amount">

                            <span class="ticket-label">
                                Amount Paid
                            </span>

                            <strong>
                                ${formatMoney(b.amount)}
                            </strong>

                        </div>

                    </div>

                    <div class="customer-ticket-box">

                        <span class="ticket-label">
                            Customer Name
                        </span>

                        <strong>
                            ${escapeHTML(b.customerName)}
                        </strong>

                    </div>

                    <div class="ticket-details-row">

                        <div>

                            <span class="ticket-label">
                                Booking Date
                            </span>

                            <strong>
                                ${escapeHTML(b.date)}
                            </strong>

                        </div>

                        <div class="ticket-booking-id">

                            <span class="ticket-label">
                                Booking ID
                            </span>

                            <strong>
                                ${escapeHTML(b.id)}
                            </strong>

                        </div>

                    </div>

                    <div class="ticket-qr-area">

                        <div
                            class="ticket-qr"
                            id="qrcode">
                        </div>

                        <p>
                            Scan this QR code at the automated
                            parking gate.
                        </p>

                        <strong>
                            Pass successfully sent to
                            ${escapeHTML(b.customerEmail)}
                        </strong>

                    </div>

                </div>

            </section>

            <button
                class="book-another-btn"
                id="anotherSpotBtn">

                Book Another Spot

            </button>

        </main>
    `;
}

/* =========================================================
   QR GENERATION
========================================================= */

function generateQR(){

    const qr =
        document.getElementById("qrcode");

    if(!qr || !currentBooking)return;

    qr.innerHTML = "";

    const data = JSON.stringify({

        bookingId:currentBooking.id,

        parkingSlot:currentBooking.lotNumber,

        customer:currentBooking.customerName,

        email:currentBooking.customerEmail,

        amount:currentBooking.amount,

        date:currentBooking.date

    });

    if(typeof QRCode !== "undefined"){

        new QRCode(qr,{

            text:data,

            width:128,

            height:128,

            colorDark:"#172033",

            colorLight:"#ffffff",

            correctLevel:QRCode.CorrectLevel.H

        });

    }else{

        qr.innerHTML = `
            <div style="
                text-align:center;
                font-size:11px;
                color:#777;">
                QR library unavailable
            </div>
        `;
    }
}

/* =========================================================
   BOOK ANOTHER
========================================================= */

function bookAnother(){

    currentBooking = null;
    selectedSlot = null;
    screen = "customer";

    render();
}

/* =========================================================
   ADMIN PAGE
========================================================= */

function adminPage(){

    return `
        <main class="admin-main">

            <div class="page-head">

                <div>

                    <h1 class="page-title">
                        Admin Dashboard
                    </h1>

                    <p class="page-subtitle">
                        Manage your Smart Park system
                    </p>

                </div>

            </div>

            <div class="admin-tabs">

                <button
                    class="admin-tab
                    ${adminTab === "overview" ? "active" : ""}"
                    data-admin-tab="overview">

                    Overview

                </button>

                <button
                    class="admin-tab
                    ${adminTab === "lots" ? "active" : ""}"
                    data-admin-tab="lots">

                    Manage Lots

                </button>

                <button
                    class="admin-tab
                    ${adminTab === "bookings" ? "active" : ""}"
                    data-admin-tab="bookings">

                    Bookings

                </button>

                <button
                    class="admin-tab
                    ${adminTab === "customers" ? "active" : ""}"
                    data-admin-tab="customers">

                    Customers

                </button>

            </div>

            ${

                adminTab === "overview"
                ? adminOverview()

                : adminTab === "lots"
                ? adminLots()

                : adminTab === "bookings"
                ? adminBookings()

                : adminCustomers()

            }

        </main>
    `;
}

/* =========================================================
   ADMIN OVERVIEW
========================================================= */

function adminOverview(){

    const total = lots.length;

    const available =
        lots.filter(x => x.status === "available").length;

    const booked =
        lots.filter(x => x.status === "booked").length;

    const revenue =
        bookings.reduce(
            (sum,b) => sum + Number(b.amount || 0),
            0
        );

    return `
        <div class="stats-grid">

            <div class="stat card">

                <div class="stat-label">
                    Total Slots
                </div>

                <div class="stat-value">
                    ${total}
                </div>

            </div>

            <div class="stat card">

                <div class="stat-label">
                    Available
                </div>

                <div class="stat-value"
                     style="color:#08a873">

                    ${available}

                </div>

            </div>

            <div class="stat card">

                <div class="stat-label">
                    Booked
                </div>

                <div class="stat-value"
                     style="color:#315edc">

                    ${booked}

                </div>

            </div>

            <div class="stat card">

                <div class="stat-label">
                    Revenue
                </div>

                <div class="stat-value">

                    ₹${revenue}

                </div>

            </div>

        </div>

        <div class="admin-grid">

            <section class="admin-panel card">

                <h3>
                    Revenue Overview
                </h3>

                <div class="chart-wrap">

                    <canvas id="revenueChart">
                    </canvas>

                </div>

            </section>

            <section class="admin-panel card">

                <h3>
                    Recent Bookings
                </h3>

                ${
                    bookings.length
                    ? bookings
                        .slice()
                        .reverse()
                        .slice(0,5)
                        .map(b => `

                            <div style="
                                padding:13px 0;
                                border-bottom:1px solid #edf1f3;
                                display:flex;
                                justify-content:space-between;">

                                <div>

                                    <strong>
                                        ${escapeHTML(b.lotNumber)}
                                    </strong>

                                    <div style="
                                        font-size:11px;
                                        color:#8993a3;">

                                        ${escapeHTML(b.customerName)}

                                    </div>

                                </div>

                                <strong style="color:#00966f">
                                    ₹${b.amount}
                                </strong>

                            </div>

                        `).join("")

                    : `
                        <p style="color:#8993a3">
                            No bookings yet.
                        </p>
                    `
                }

            </section>

        </div>
    `;
}

/* =========================================================
   ADMIN LOTS
========================================================= */

function adminLots(){

    return `
        <section class="admin-panel card">

            <h3>
                Manage Parking Lots
            </h3>

            <div class="lot-admin-grid">

                ${lots.map(lot => `

                    <div class="lot-admin-card">

                        <strong>
                            ${lot.number}
                        </strong>

                        <div style="
                            margin-top:8px;
                            font-size:11px;
                            color:#7b8798;">

                            ${lot.location}

                        </div>

                        <div style="
                            margin-top:8px;
                            font-weight:800;
                            color:#079dbd;">

                            ₹${lot.price}

                        </div>

                        <div style="margin-top:8px;">

                            ${
                                lot.status === "available"

                                ? `
                                    <span class="badge green">
                                        AVAILABLE
                                    </span>
                                  `

                                : `
                                    <span class="badge gray">
                                        BOOKED
                                    </span>
                                  `
                            }

                        </div>

                        <div class="lot-admin-actions">

                            <button
                                class="small-btn"
                                data-toggle-lot="${lot.number}">

                                ${
                                    lot.status === "available"
                                    ? "Mark Booked"
                                    : "Mark Available"
                                }

                            </button>

                        </div>

                    </div>

                `).join("")}

            </div>

        </section>
    `;
}

/* =========================================================
   TOGGLE LOT
========================================================= */

function toggleLot(number){

    const lot =
        lots.find(x => x.number === number);

    if(!lot)return;

    lot.status =
        lot.status === "available"
        ? "booked"
        : "available";

    save(STORAGE.lots,lots);

    render();

    showToast(number + " status updated");
}

/* =========================================================
   ADMIN BOOKINGS
========================================================= */

function adminBookings(){

    return `
        <section class="admin-panel card">

            <h3>
                All Bookings
            </h3>

            <input
                class="admin-search"
                id="bookingSearch"
                placeholder="Search booking, slot or customer...">

            <div id="bookingTable">

                ${bookingTable(bookings)}

            </div>

        </section>
    `;
}

function bookingTable(data){

    if(!data.length){

        return `
            <p style="color:#8993a3">
                No bookings found.
            </p>
        `;
    }

    return `
        <div class="table-wrap">

            <table>

                <thead>

                    <tr>
                        <th>Booking ID</th>
                        <th>Slot</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Payment</th>
                        <th>Amount</th>
                        <th>Status</th>
                    </tr>

                </thead>

                <tbody>

                    ${data.slice().reverse().map(b => `

                        <tr>

                            <td>
                                ${escapeHTML(b.id)}
                            </td>

                            <td>
                                <strong>
                                    ${escapeHTML(b.lotNumber)}
                                </strong>
                            </td>

                            <td>
                                ${escapeHTML(b.customerName)}
                            </td>

                            <td>
                                ${escapeHTML(b.date)}
                            </td>

                            <td>
                                ${escapeHTML(
                                    String(
                                        b.paymentMethod || "UPI"
                                    ).toUpperCase()
                                )}
                            </td>

                            <td>
                                ₹${b.amount}
                            </td>

                            <td>
                                <span class="badge green">
                                    ${escapeHTML(b.status)}
                                </span>
                            </td>

                        </tr>

                    `).join("")}

                </tbody>

            </table>

        </div>
    `;
}

/* =========================================================
   ADMIN CUSTOMERS
========================================================= */

function adminCustomers(){

    return `
        <section class="admin-panel card">

            <h3>
                Registered Customers
            </h3>

            <input
                class="admin-search"
                id="customerSearch"
                placeholder="Search customer, email or phone...">

            <div id="customerTable">

                ${customerTable(customers)}

            </div>

        </section>
    `;
}

function customerTable(data){

    if(!data.length){

        return `
            <p style="color:#8993a3">
                No customers found.
            </p>
        `;
    }

    return `
        <div class="table-wrap">

            <table>

                <thead>

                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Joined</th>
                        <th>Status</th>
                    </tr>

                </thead>

                <tbody>

                    ${data.map(c => `

                        <tr>

                            <td>
                                ${escapeHTML(c.id)}
                            </td>

                            <td>
                                <strong>
                                    ${escapeHTML(c.name)}
                                </strong>
                            </td>

                            <td>
                                ${escapeHTML(c.email)}
                            </td>

                            <td>
                                ${escapeHTML(c.phone)}
                            </td>

                            <td>
                                ${escapeHTML(c.joinedDate)}
                            </td>

                            <td>

                                <span class="badge blue">
                                    ${escapeHTML(c.status)}
                                </span>

                            </td>

                        </tr>

                    `).join("")}

                </tbody>

            </table>

        </div>
    `;
}

/* =========================================================
   SEARCH BOOKINGS
========================================================= */

function searchBookings(value){

    const query =
        value.toLowerCase().trim();

    const result =
        bookings.filter(b =>

            String(b.id).toLowerCase().includes(query) ||

            String(b.lotNumber).toLowerCase().includes(query) ||

            String(b.customerName).toLowerCase().includes(query)

        );

    const table =
        document.getElementById("bookingTable");

    if(table){

        table.innerHTML =
            bookingTable(result);
    }
}

/* =========================================================
   SEARCH CUSTOMERS
========================================================= */

function searchCustomers(value){

    const query =
        value.toLowerCase().trim();

    const result =
        customers.filter(c =>

            String(c.name).toLowerCase().includes(query) ||

            String(c.email).toLowerCase().includes(query) ||

            String(c.phone).toLowerCase().includes(query)

        );

    const table =
        document.getElementById("customerTable");

    if(table){

        table.innerHTML =
            customerTable(result);
    }
}

/* =========================================================
   REVENUE CHART
========================================================= */

function drawRevenueChart(){

    const canvas =
        document.getElementById("revenueChart");

    if(!canvas)return;

    const rect =
        canvas.getBoundingClientRect();

    const width =
        Math.max(rect.width,300);

    const height = 270;

    const dpr =
        window.devicePixelRatio || 1;

    canvas.width =
        width * dpr;

    canvas.height =
        height * dpr;

    const ctx =
        canvas.getContext("2d");

    ctx.setTransform(
        dpr,0,0,dpr,0,0
    );

    ctx.clearRect(
        0,0,width,height
    );

    const values = [];

    for(let i=6;i>=0;i--){

        const date =
            new Date();

        date.setDate(
            date.getDate() - i
        );

        const label =
            date.toLocaleDateString(
                "en-IN",
                {weekday:"short"}
            );

        const dateString =
            date.toLocaleDateString(
                "en-IN",
                {
                    day:"2-digit",
                    month:"short",
                    year:"numeric"
                }
            );

        const total =
            bookings
                .filter(b => b.date === dateString)
                .reduce(
                    (sum,b) =>
                        sum + Number(b.amount || 0),
                    0
                );

        values.push({
            label,
            value:total
        });
    }

    const max =
        Math.max(
            ...values.map(x => x.value),
            100
        );

    const left = 42;
    const bottom = 225;
    const top = 25;
    const chartHeight = bottom-top;

    ctx.strokeStyle="#e6edf1";
    ctx.lineWidth=1;

    for(let i=0;i<5;i++){

        const y =
            bottom -
            i * chartHeight / 4;

        ctx.beginPath();

        ctx.moveTo(
            left,
            y
        );

        ctx.lineTo(
            width-15,
            y
        );

        ctx.stroke();

        ctx.fillStyle="#8793a4";
        ctx.font="10px Inter";

        ctx.fillText(
            "₹"+Math.round(max*i/4),
            4,
            y+4
        );
    }

    const availableWidth =
        width-left-30;

    const barWidth =
        Math.min(
            35,
            availableWidth / 10
        );

    values.forEach((item,index)=>{

        const x =
            left +
            20 +
            index *
            (
                availableWidth /
                7
            );

        const barHeight =
            item.value === 0
            ? 4
            : Math.max(
                7,
                item.value/max *
                chartHeight
            );

        const y =
            bottom-barHeight;

        const gradient =
            ctx.createLinearGradient(
                0,y,
                0,bottom
            );

        gradient.addColorStop(
            0,
            "#0ca7c8"
        );

        gradient.addColorStop(
            1,
            "#3159ee"
        );

        ctx.fillStyle=gradient;

        ctx.beginPath();

        if(ctx.roundRect){

            ctx.roundRect(
                x,
                y,
                barWidth,
                barHeight,
                5
            );

        }else{

            ctx.rect(
                x,
                y,
                barWidth,
                barHeight
            );
        }

        ctx.fill();

        ctx.fillStyle="#778394";
        ctx.font="10px Inter";

        ctx.fillText(
            item.label,
            x,
            bottom+20
        );
    });
}

/* =========================================================
   EVENT HANDLERS
========================================================= */

function attachEvents(){

    /* Logout */

    const logoutBtn =
        document.getElementById("logoutBtn");

    if(logoutBtn){

        logoutBtn.addEventListener(
            "click",
            logout
        );
    }

    /* Login modes */

    const customerMode =
        document.getElementById("customerMode");

    const adminMode =
        document.getElementById("adminMode");

    if(customerMode){

        customerMode.addEventListener(
            "click",
            ()=>{
                loginMode="customer";
                render();
            }
        );
    }

    if(adminMode){

        adminMode.addEventListener(
            "click",
            ()=>{
                loginMode="admin";
                render();
            }
        );
    }

    /* Customer login */

    const customerForm =
        document.getElementById(
            "customerLoginForm"
        );

    if(customerForm){

        customerForm.addEventListener(
            "submit",
            customerLoginHandler
        );
    }

    /* Admin login */

    const adminForm =
        document.getElementById(
            "adminLoginForm"
        );

    if(adminForm){

        adminForm.addEventListener(
            "submit",
            adminLoginHandler
        );
    }

    /* Parking slots */

    document
        .querySelectorAll("[data-slot]")
        .forEach(button=>{

            button.addEventListener(
                "click",
                ()=>{
                    selectSlot(
                        button.dataset.slot
                    );
                }
            );

        });

    /* Cancel */

    const cancelSlotBtn =
        document.getElementById(
            "cancelSlotBtn"
        );

    if(cancelSlotBtn){

        cancelSlotBtn.addEventListener(
            "click",
            ()=>{
                selectedSlot=null;
                render();
            }
        );
    }

    /* Proceed */

    const proceed =
        document.getElementById(
            "proceedPaymentBtn"
        );

    if(proceed){

        proceed.addEventListener(
            "click",
            ()=>{
                if(!selectedSlot){

                    showToast(
                        "Please select a parking slot"
                    );

                    return;
                }

                screen="payment";

                render();
            }
        );
    }

    /* Payment methods */

    document
        .querySelectorAll("[data-payment]")
        .forEach(button=>{

            button.addEventListener(
                "click",
                ()=>{
                    changePaymentMethod(
                        button.dataset.payment
                    );
                }
            );

        });

    /* UPI quick buttons */

    document
        .querySelectorAll("[data-upi]")
        .forEach(button=>{

            button.addEventListener(
                "click",
                ()=>{
                    setUPI(
                        button.dataset.upi
                    );
                }
            );

        });

    /* Back payment */

    const backPayment =
        document.getElementById(
            "backPaymentBtn"
        );

    if(backPayment){

        backPayment.addEventListener(
            "click",
            ()=>{
                screen="customer";
                render();
            }
        );
    }

    /* Pay */

    const payBtn =
        document.getElementById(
            "payBtn"
        );

    if(payBtn){

        payBtn.addEventListener(
            "click",
            makePayment
        );
    }

    /* Another spot */

    const another =
        document.getElementById(
            "anotherSpotBtn"
        );

    if(another){

        another.addEventListener(
            "click",
            bookAnother
        );
    }

    /* Admin tabs */

    document
        .querySelectorAll("[data-admin-tab]")
        .forEach(button=>{

            button.addEventListener(
                "click",
                ()=>{
                    adminTab =
                        button.dataset.adminTab;

                    render();
                }
            );

        });

    /* Admin lot buttons */

    document
        .querySelectorAll("[data-toggle-lot]")
        .forEach(button=>{

            button.addEventListener(
                "click",
                ()=>{
                    toggleLot(
                        button.dataset.toggleLot
                    );
                }
            );

        });

    /* Booking search */

    const bookingSearch =
        document.getElementById(
            "bookingSearch"
        );

    if(bookingSearch){

        bookingSearch.addEventListener(
            "input",
            ()=>{
                searchBookings(
                    bookingSearch.value
                );
            }
        );
    }

    /* Customer search */

    const customerSearch =
        document.getElementById(
            "customerSearch"
        );

    if(customerSearch){

        customerSearch.addEventListener(
            "input",
            ()=>{
                searchCustomers(
                    customerSearch.value
                );
            }
        );
    }
}

/* =========================================================
   WINDOW EVENTS
========================================================= */

window.addEventListener(
    "resize",
    ()=>{
        if(
            screen === "admin" &&
            adminTab === "overview"
        ){
            drawRevenueChart();
        }
    }
);

/* =========================================================
   START APPLICATION
========================================================= */

render();