# 🚖 Taxi Booking App

A modern cross-platform Taxi Booking App built using **React Native (Expo)** and powered by **AWS Lambda**, **API Gateway**, and **DynamoDB**. This app enables users to manage taxi bookings, track earnings, generate invoices, and securely access data using a passcode screen.

---

## 📱 Features

### 🔐 Authentication

* Secure passcode screen to protect access to the app.
* Configurable 4-digit code (e.g., stored in SecureStore or env vars in production).

### 🏠 Home Dashboard

* Displays:

  * Total bookings count
  * Total fare (sum of all bookings)
  * Completed rides count + earnings
  * Scheduled rides count + expected fare
  * Next two upcoming bookings

### 📋 Bookings Management

* Add new bookings with:

  * Customer info
  * Pickup/dropoff
  * Fare
  * Payment method (Cash/Card)
  * Payment status (Paid/Pending)
  * Notes
  * Date, pickup & dropoff times
* View bookings list with:

  * Infinite scroll (pagination)
  * Search capability
  * Select and view booking details
* Edit & update bookings
* Delete bookings with confirmation modal

### 🧾 Invoice Generation

* Generate PDF invoices with booking details
* Share invoice using device-native sharing

### 📆 Date & Time Pickers

* Cross-platform support for DatePicker and TimePicker
* Web: React-Datepicker & React-Time-Picker
* Mobile: @react-native-community/datetimepicker

### 🌐 API Backend

* **API Gateway**: Exposes RESTful endpoints
* **AWS Lambda**: Stateless logic for CRUD
* **DynamoDB**: NoSQL database storing bookings

---

## 🛠️ Tech Stack

### Frontend

* React Native (Expo)
* TypeScript
* Expo Router
* React Native Paper / StyleSheet API
* PDF generation with expo-print
* Sharing with expo-sharing

### Backend (AWS)

* AWS Lambda
* API Gateway (v1 Stage)
* DynamoDB

### Tools & Libraries

* Axios (API requests)
* Animated API (Loading overlays)
* React Native Modal
* React DatePicker & TimePicker (Web)
* Expo Vector Icons (Ionicons)

---

## ⚙️ Setup Instructions

### 📦 Prerequisites

* Node.js (>=18)
* Yarn or npm
* Expo CLI (`npm install -g expo-cli`)
* AWS account with:

  * API Gateway + Lambda setup
  * DynamoDB table named `Bookings`

### 📁 Folder Structure

```bash
.
├── app
│   ├── index.tsx             # Home screen
│   ├── bookings.tsx          # Bookings management
│   └── passcode.tsx          # Passcode entry
├── components
│   ├── ConfirmModal.tsx      # Reusable confirm modal
│   └── ui/TabBarBackground.tsx
├── constants
│   └── Colors.ts
├── styles
│   └── index.css             # Web picker overrides
```

### 🔧 Environment

Update API URL in the following files:

```ts
const API_URL = 'https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/v1/bookings';
```

You may store this in `.env` with expo-constants in production.

### 🚀 Run Locally

```bash
git clone https://github.com/your-username/taxi-booking-app
cd taxi-booking-app
npm install
expo start
```

### 🧪 Test Bookings API

Use Postman or CURL to hit the backend:

```bash
curl https://your-api-url/v1/bookings
```

---

## 🗂️ DynamoDB Schema

**Table Name**: `Bookings`

### Primary Key:

* `bookingId` (string, UUID)

### Attributes:

* `customerName`: string
* `contactNumber`: string
* `pickup`: string
* `dropoff`: string
* `date`: string (YYYY-MM-DD)
* `pickupTime`: string (ISO)
* `dropoffTime`: string (ISO)
* `notes`: string
* `fare`: string (optional)
* `email`: string (optional)
* `paymentMethod`: "cash" | "card"
* `paymentStatus`: "paid" | "pending"

---

## 📈 Future Improvements

* ✅ SecureStore integration for passcode
* ✅ Push notifications
* ✅ User authentication (Cognito or Firebase Auth)
* ✅ Admin dashboard (Web)
* ✅ Driver tracking (Live GPS)
* ✅ Stripe/PayPal integration for online payments

---

## 📄 License

MIT License. You are free to use, modify, and distribute.

---

## 🙌 Acknowledgements

* React Native & Expo team
* AWS Lambda + API Gateway team
* Expo community for great libraries (expo-print, expo-sharing)

---

## 📬 Contact

Built by \Sumit Akoliya.
Feel free to connect: \[[sammy.akoliya@gmail.com](sammy.akoliya@gmail.com)] / \[[LinkedIn/GitHub link](https://www.linkedin.com/in/sumitakoliya/),(https://github.com/sammygojs)]
