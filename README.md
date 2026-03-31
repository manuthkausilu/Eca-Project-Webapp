# Webapp

A Next.js frontend for a POS-style management system built for the ECA module. The app manages customers, products, and orders through an API Gateway.

## About

This project is part of the Enterprise Cloud Application (ECA) module in the Higher Diploma in Software Engineering (HDSE) program at IJSE.

## Current Scope

The implemented domain is:

- Customers
- Products
- Orders

The home route redirects to `/dashboard`.

## Tech Stack

| Technology | Details |
|---|---|
| Next.js | 16.1.6 (App Router) |
| React | 19.2.3 |
| TypeScript | 5 |
| Tailwind CSS | 4 |
| shadcn/ui | UI components (Radix primitives) |
| React Hook Form | Form state management |
| Zod | Schema validation |
| Axios | HTTP client |
| Lucide React | Icons |
| Sonner | Toast notifications |
| date-fns | Date formatting |

## Features

| Page | Path | Description |
|---|---|---|
| Dashboard | `/dashboard` | Counts for customers/products/orders, recent orders, quick navigation |
| Customers | `/customers` | Create, view, edit, delete customers, with image upload and avatar preview |
| Products | `/products` | Create, view, edit, delete products |
| Orders | `/orders` | Create, view, edit, delete orders, search and filter by product |

### UI Behavior

- Responsive sidebar + sticky header layout
- Mobile sidebar toggle support
- Form dialogs for create/edit flows
- Confirmation dialog for destructive actions
- Loading skeletons for async screens
- Toast feedback for success/error states

## API Integration

Base URL is read from `NEXT_PUBLIC_API_GATEWAY_URL`.

If the variable is missing, the app defaults to:

`http://localhost:7000`

### Endpoints used

- Customers
	- `GET /api/v1/customers`
	- `GET /api/v1/customers/{nic}`
	- `POST /api/v1/customers` (multipart/form-data)
	- `PUT /api/v1/customers/{nic}` (multipart/form-data)
	- `DELETE /api/v1/customers/{nic}`
	- `GET /api/v1/customers/{nic}/picture`
- Products
	- `GET /api/v1/products`
	- `GET /api/v1/products/{productId}`
	- `POST /api/v1/products`
	- `PUT /api/v1/products/{productId}`
	- `DELETE /api/v1/products/{productId}`
- Orders
	- `GET /api/v1/orders`
	- `GET /api/v1/orders/{id}`
	- `GET /api/v1/orders?productId={productId}`
	- `POST /api/v1/orders`
	- `PUT /api/v1/orders/{id}`
	- `DELETE /api/v1/orders/{id}`

## Validation Rules

- Customer NIC: `^\d{9}[vV]$`
- Customer name: letters and spaces only
- Product ID: uppercase letters only (`A-Z`)
- Order fields: customer, product, and date are required

## Project Structure

```text
webapp/
|-- app/
|   |-- layout.tsx
|   |-- page.tsx
|   |-- dashboard/page.tsx
|   |-- customers/page.tsx
|   |-- products/page.tsx
|   `-- orders/page.tsx
|-- components/
|   |-- layout/
|   |-- customers/
|   |-- products/
|   |-- orders/
|   `-- ui/
|-- lib/
|   `-- api.ts
|-- types/
|   `-- index.ts
|-- public/
`-- README.md
```

## Environment Variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:7000
```

## Getting Started

### Prerequisites

- Node.js 20+ recommended
- API Gateway running and reachable
- Backend services for customers, products, and orders available behind the gateway

### Install

```bash
npm install
```

### Run (Development)

```bash
npm run dev
```

Open `http://localhost:3000`.

### Build and Run (Production)

```bash
npm run build
npm run start
```

### Lint

```bash
npm run lint
```

## Notes

- Remote customer images are configured for `http://localhost:7000/api/v1/customers/**` in Next.js image settings.
- The layout metadata currently uses the title `Campus Portal | ECA Capstone`.

## Need Help?

Use your course communication channel (for example, your class Slack workspace) for project support.
