# Webapp

A modern frontend application for the ECA Campus Management System. It provides a full UI for managing students, academic programs, and enrollments through the API Gateway.

## About

This project is part of the Enterprise Cloud Application (ECA) module in the Higher Diploma in Software Engineering (HDSE) program at the Institute of Software Engineering (IJSE). It is intended exclusively for students enrolled in this program.

## Tech Stack

| Technology | Details |
|---|---|
| Next.js | 16.1.6 (App Router) |
| React | 19.2.3 |
| TypeScript | 5 |
| Tailwind CSS | 4 |
| ShadCN UI | Component library (Radix UI primitives) |
| React Hook Form | Form state management |
| Zod | Schema validation |
| Axios | HTTP client |
| Lucide React | Icon set |
| Sonner | Toast notifications |
| date-fns | Date formatting |

## Features

| Page | Path | Description |
|---|---|---|
| Dashboard | `/dashboard` | Stats overview, recent enrollments, quick actions |
| Customers | `/customers` | Create, view, edit, delete customers with avatar display |
| Products | `/products` | Create, view, edit, delete products (card & table views) |
| Orders | `/orders` | Create, view, edit, delete orders with product filtering |

## Project Structure

```
webapp/
├── app/
│   ├── layout.tsx            # Root layout (Sidebar + Header + Toaster)
│   ├── page.tsx              # Redirects to /dashboard
│   ├── dashboard/page.tsx    # Dashboard overview
│   ├── customers/page.tsx     # Customer management
│   ├── products/page.tsx      # Product management
│   └── orders/page.tsx        # Order management
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx       # Fixed navigation sidebar
│   │   └── header.tsx        # Sticky top header
│   ├── customers/
│   │   └── customer-form.tsx  # Customer create/edit form
│   ├── products/
│   │   └── product-form.tsx   # Product create/edit form
│   └── orders/
│       └── order-form.tsx     # Order create/edit form
├── lib/
│   └── api.ts                # Axios API client (customerApi, productApi, orderApi)
├── types/
│   └── index.ts              # Shared TypeScript types
└── .env.local                # Environment variables
```

## Environment Variables

Create a `.env.local` file in the `webapp/` directory:

```env
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:7000
```

## Getting Started

Follow the lecture guidelines, refer to the lecture video for more information and how to get started correctly.

> **Prerequisites:** All backend services (Config-Server, Service-Registry, Api-Gateway, Student-Service, Program-Service, Enrollment-Service) must be running before starting the webapp.

**Full startup order:**
1. Config-Server (`9000`)
2. Service-Registry (`9001`)
3. Api-Gateway (`7000`)
4. Student-Service (`8000`)
5. Program-Service (`8001`)
6. Enrollment-Service (`8002`)
7. **Webapp** (`3000`)

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The application will be available at: `http://localhost:3000`

## Need Help?

If you encounter any issues, feel free to reach out and start a discussion via the Slack workspace.
