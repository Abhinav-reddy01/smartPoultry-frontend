# Smart Poultry Management - Frontend

Modern React + Vite frontend for the Smart Poultry Farm Management system.

## Tech Stack
- **Framework**: React 19 + Vite
- **Routing**: React Router 7
- **Data Visualization**: Chart.js + react-chartjs-2
- **Icons**: Lucide Icons
- **Deployment**: Vercel

## Quick Start (Local)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173).

---

## Deployment on Vercel

1. Push this repository to GitHub.
2. In [Vercel](https://vercel.com), click **Add New...** -> **Project**.
3. Import your repository: `Abhinav-reddy01/smartPoultry-frontend`.
4. Framework Preset: **Vite** (auto-detected).
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. In **Environment Variables**, add:
   - `VITE_API_URL`: Your deployed Render backend URL, for example:
     ```
     https://smartpoultry-backend.onrender.com/api
     ```
6. Click **Deploy**.

> **Note**: A [`vercel.json`](vercel.json) rewrite rule is already included to ensure client-side routing (`/stock`, `/sales`, `/customers`, etc.) functions properly without 404 errors on page refresh.
