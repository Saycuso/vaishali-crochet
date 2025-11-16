# Vaishali's Crochet — Full-Stack E-commerce Platform

**Live Site:** [**vaishaliscrochet.in**](https://vaishaliscrochet.in/)

This is a complete, production-ready e-commerce platform built from scratch for a real-world client. It is a full-stack, serverless application designed for scalability and performance, featuring a secure payment gateway and a complete admin dashboard for business management.

![Homepage Screenshot](https://res.cloudinary.com/dzzdi2pbt/image/upload/v1763094189/1_x6its1.png)

---

## 🚀 Key Features

* **Full E-commerce Flow:** Complete user journey from browsing products, adding to cart, and checking out.
* **Live Payment Integration:** Fully compliant and secure payments using the **Razorpay API**.
* **Secure User Authentication:** Email/password and Google OAuth login using Firebase Authentication.
* **Complete Admin Dashboard:** A secure, role-based admin panel to manage the entire business.
* **Serverless Backend:** All backend logic is handled by scalable, on-demand Firebase Cloud Functions.
* **Real-time Database:** Firestore (NoSQL) database for instant updates to inventory, orders, and user data.
* **Fully Responsive:** Pixel-perfect, mobile-first design using Tailwind CSS.

---

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | React (Vite), Tailwind CSS, Shadcn/ui |
| **Backend** | Firebase Cloud Functions (Node.js) |
| **Database** | Firestore (NoSQL) |
| **Authentication** | Firebase Authentication |
| **Payments** | Razorpay API |
| **Deployment** | Firebase Hosting (Frontend & Backend) |

---

## 🔒 Admin Dashboard (The "Business Hub")

Since this is a real-world application, a secure admin-only area is essential for business operations. Regular users cannot access these routes.

### 1. Order Management

The admin dashboard provides a real-time view of all incoming orders, allowing the client to track order status, customer details, and payment confirmation.

![Admin Orders Page Screenshot](https://placehold.co/1000x500/FFF7F2/FF6B00?text=Paste+Your+Admin+Orders+Screenshot+Here)

### 2. Product & Stock Management

The admin can perform full CRUD (Create, Read, Update, Delete) operations on all products. This includes updating stock levels for product variations (e.g., different colors) to ensure inventory is always accurate.

![Admin Product Management Screenshot](https://placehold.co/1000x500/FFF7F2/FF6B00?text=Paste+Your+Stock+Management+Screenshot+Here)

---

## 챌 Challenges & Learnings

The most significant challenge was integrating the Razorpay payment gateway, which required a deep understanding of webhooks and secure backend verification. I successfully:
1.  Built a secure Firebase Cloud Function to handle payment capture and order creation.
2.  Passed all of Razorpay's stringent compliance verifications (requiring T&Cs, Privacy Policies, etc.) to obtain live API keys.
3.  Ensured a robust system where orders are only confirmed after a secure, server-to-server signature verification.