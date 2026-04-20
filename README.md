# FEUDA - Premium Accessories

FEUDA is a production-grade e-commerce application designed for premium mobile accessories. It features a sophisticated full-stack architecture, a high-performance frontend, and a robust administrative backend.

## 🚀 System Architecture

The application follows a modern full-stack decoupled architecture:

### Frontend
- **Framework:** React 19 with TypeScript.
- **Routing:** React Router 7 (HashRouter) for stable navigation in sandboxed environments.
- **State Management:** Custom `AppProvider` context for global state (auth, cart, products, etc.).
- **Styling:** Tailwind CSS with a focus on luxury minimal aesthetics.
- **Optimization:** Dynamic code-splitting with `React.lazy` and `Suspense` for faster initial loads.

### Backend
- **Server:** Node.js with Express 5.
- **Database:** MySQL (MariaDB) with `mysql2` connection pooling.
- **Persistence:** Relational schema covering Products, Categories, Users, Orders, and CMS Content.
- **File System:** Local asset management for product images and uploads.
- **Security:** Environment-variable-driven configuration and server-side validation.

---

## 🎨 Design Philosophy

FEUDA's visual identity is built on the **"Clean Luxury"** aesthetic, combining high-end minimalism with technical precision.

- **Typography:** Uses *Inter* for maximum legibility and custom display fonts for high-impact headings.
- **Color Palette:** A sophisticated mix of Slate-900 (neutral black), Emerald-600 (success/buy), and various shades of subtle grays to create depth.
- **Interaction:** Micro-animations (via Framer Motion/CSS transitions) provide tactical feedback on every user action—from adding to cart to navigating the admin dashboard.

---

## 🛠 Features

### User Experience
- **Categorized Browsing:** Seamless navigation through specialized accessory collections.
- **Tabbed Showcases:** Interactive product grids that allow users to switch categories without page reloads.
- **Order Tracking:** Comprehensive dashboard for users to view order status and history.
- **Responsive Branding:** A custom-crafted Navbar and Footer that adapts to any screen size.

### Administrative Power
- **Live Analytics:** Real-time business insights and revenue growth visualization.
- **Inventory Management:** Quick-update stock system with real-time feedback.
- **CMS Control:** Full control over static pages (Privacy Policy, FAQ, etc.) via a custom editor.
- **User Auditing:** Comprehensive list of registered customers and their roles.

---

## ⚡ Dynamic Capabilities

The system is designed to be highly dynamic and extensible:

1. **Database Fallback (Sync Mode):** The app intelligently detects if the primary database is unreachable and falls back to a "Sync Mode" using deterministic seed data, ensuring zero-downtime development.
2. **Real-time Validations:** Form fields use defensive state initialization to prevent React state warnings and provide a smoother editing experience.
3. **AI Integration (Gemini):** *Available for implementation.* The system is ready for Gemini-powered product description generation and smart cross-selling suggestions.
4. **Interactive Overlays:** Uses a global Toast and Modal system to handle asynchronous feedback without disrupting the user flow.

---

## 📦 Setup & Installation

1. **Environment Variables:**
   Configure your `.env` with the following:
   ```env
   DB_HOST=your_host
   DB_USER=your_user
   DB_PASSWORD=your_password
   DB_NAME=your_db
   GEMINI_API_KEY=your_key
   ```

2. **Database Initialization:**
   The server automatically initializes the schema on startup. Ensure your MySQL server is running and accessible.

3. **Running the App:**
   - Development: `npm run dev`
   - Production: `npm run build && npm start`

---

*FEUDA - Luxury Redefined for the Modern Professional.*
