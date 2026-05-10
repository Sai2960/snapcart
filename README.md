🛒 SnapCart — Online Grocery Delivery Platform

A full-stack grocery delivery platform with real-time order tracking, live chat, and a complete admin + delivery boy management system.

🌐 Live Demo → https://snapcart-voal.vercel.app
Stack: Next.js 15 · TypeScript · MongoDB · Socket.io · NextAuth · Cloudinary · Google Maps · Redux · Vercel

📌 What is SnapCart?
SnapCart is a production-ready grocery delivery web application that connects customers, admins, and delivery personnel in a seamless order fulfillment chain:
Customer places order
        ↓
Admin reviews & verifies the order
        ↓
Order assigned to a Delivery Boy
        ↓
Delivery Boy picks up & heads to customer
        ↓
OTP verified at the door → Order Delivered ✅

✨ Features
👤 Customer

Browse and search grocery items by category
Add items to cart and place orders
Real-time order status tracking with live map
Live chat with delivery boy via Socket.io
Secure login via NextAuth (Google / Credentials)

🛠️ Admin Panel

Add, edit, and manage grocery inventory with Cloudinary image uploads
View and manage all incoming orders
Verify orders and assign them to delivery boys
Edit delivery boy roles and permissions

🚴 Delivery Boy

Personal dashboard with assigned orders
Real-time location sharing
OTP-based delivery confirmation
Live chat with customer during delivery


🧰 Tech Stack
LayerTechnologyFrontendNext.js 15 (App Router), TypeScript, Tailwind CSSBackendNext.js API RoutesDatabaseMongoDB + MongooseAuthNextAuth.jsReal-timeSocket.io (chat + live tracking)MapsGoogle Maps / Geocoding APIMediaCloudinary (grocery images)StateRedux Toolkit (cart + user slices)DeploymentVercel

🗂️ Project Structure
snapcart/
├── src/
│   ├── app/
│   │   ├── admin/              # Admin pages (add-grocery, manage-orders, view-grocery)
│   │   ├── api/                # API routes (auth, user, delivery, chat, geocode, socket)
│   │   ├── login/
│   │   ├── register/
│   │   └── user/               # User dashboard & order pages
│   ├── components/             # Reusable UI components
│   │   ├── AdminDashboardClient.tsx
│   │   ├── DeliveryBoyDashboard.tsx
│   │   ├── CheckoutMap.tsx
│   │   ├── LiveMap.tsx
│   │   ├── DeliveryChat.tsx
│   │   ├── GeoUpdater.tsx
│   │   └── GroceryItemCard.tsx (+ more)
│   ├── models/                 # Mongoose schemas
│   │   ├── user.model.ts
│   │   ├── order.model.ts
│   │   ├── grocery.model.ts
│   │   ├── message.model.ts
│   │   └── deliveryAssignment.model.ts
│   ├── redux/                  # Global state
│   │   ├── cartSlice.ts
│   │   ├── userSlice.ts
│   │   └── store.ts
│   └── lib/                    # Utilities (db.ts, cloudinary.ts, mailer.ts)

🚀 Getting Started
Prerequisites

Node.js 18+
MongoDB Atlas account
Cloudinary account
Google Maps API key

Installation
bash# Clone the repository
git clone https://github.com/Sai2960/snapcart.git
cd snapcart

# Install dependencies
npm install
Environment Variables
Create a .env.local file in the root directory:
envMONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
Run Locally
bashnpm run dev
Open http://localhost:3000 in your browser.

📡 API Routes
RouteDescription/api/authAuthentication (NextAuth)/api/userUser profile management/api/adminAdmin operations/api/check-for-adminRole verification middleware/api/deliveryDelivery assignment & OTP/api/chatChat messages/api/geocodeLocation geocoding/api/meCurrent user session/api/socketSocket.io initialization

🔐 Roles & Access Control
RoleAccessCustomerBrowse, order, and track groceriesAdminManage inventory, verify orders, manage delivery boysDelivery BoyView assigned orders, update location, confirm via OTP

📄 License
This project is open source and available under the MIT License.

Built with Next.js · Deployed on Vercel
