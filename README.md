# Multi-Tenant CRM

## Understanding Multi-Tenancy

**Multi-tenancy** is a software architecture principle where a single instance of an application serves multiple customers, known as **tenants**. Each tenant’s data is isolated and remains invisible to others, but the underlying infrastructure and codebase are shared. This approach is widely used in cloud computing and Software as a Service (SaaS) platforms.

## How Multi-Tenancy Works

In a multi-tenant system, tenants may be individual users, organizations, or departments. The application is designed to logically separate each tenant’s data, often using unique identifiers or database schemas. Despite sharing resources, each tenant experiences the application as if it were dedicated to them.

## Benefits

- **Cost Efficiency:** Shared infrastructure reduces operational costs for both providers and customers.
- **Scalability:** Providers can easily onboard new tenants without deploying separate instances.
- **Simplified Maintenance:** Updates and bug fixes are applied centrally, benefiting all tenants simultaneously.

## Challenges

- **Data Security:** Ensuring strict data isolation is critical to prevent unauthorized access.
- **Customization:** Balancing shared code with tenant-specific requirements can be complex.
- **Performance:** Resource contention among tenants must be managed to maintain consistent performance.

## Use Cases

Multi-tenancy is common in SaaS products like CRM systems, email platforms, and collaboration tools. It enables providers to serve many customers efficiently while maintaining security and privacy.

---

## Approaches to Multi-Tenancy

There are several **approaches to implementing multi-tenancy**, each with its own trade-offs in terms of isolation, complexity, and resource usage. Here are the most common approaches:

---

## 1. Shared Database, Shared Schema (This basic application uses this approach)

- **Description:**  
  All tenants share the same database and the same set of tables. Tenant data is distinguished by a tenant identifier column in each table.

- **Pros:**  
  - Easiest to manage and scale.
  - Cost-effective (minimal resource usage).
  - Simple to onboard new tenants.

- **Cons:**  
  - Lowest level of data isolation.
  - More complex queries (must always filter by tenant ID).
  - Harder to customize for individual tenants.

---

## 2. Shared Database, Separate Schemas

- **Description:**  
  All tenants share the same database, but each tenant has its own schema (set of tables).

- **Pros:**  
  - Better data isolation than shared schema.
  - Easier to customize per tenant.
  - Still efficient in terms of resource usage.

- **Cons:**  
  - More complex to manage (especially as the number of tenants grows).
  - Schema updates must be applied to all schemas.

---

## 3. Separate Databases

- **Description:**  
  Each tenant has its own database instance.

- **Pros:**  
  - Strongest data isolation.
  - Easy to backup, restore, or migrate individual tenants.
  - Customization is straightforward.

- **Cons:**  
  - Higher resource usage and operational overhead.
  - More expensive to scale.
  - More complex to manage many databases.

---

## 4. Hybrid Approaches

- **Description:**  
  Some systems use a combination of the above, such as grouping tenants by region or size, and assigning each group to a separate database or schema.

- **Pros:**  
  - Balances isolation, cost, and manageability.
  - Can optimize for specific business or technical needs.

- **Cons:**  
  - Increased architectural complexity.
  - Requires careful planning and automation.

---

## Summary Table

| Approach                        | Isolation Level | Customization | Complexity | Cost      |
|----------------------------------|----------------|---------------|------------|-----------|
| Shared DB, Shared Schema         | Low            | Low           | Low        | Low       |
| Shared DB, Separate Schemas      | Medium         | Medium        | Medium     | Medium    |
| Separate Databases               | High           | High          | High       | High      |
| Hybrid                           | Variable       | Variable      | High       | Variable  |

---

**Choosing the right approach** depends on your application's requirements for security, scalability, customization, and cost. Many SaaS providers start with a shared schema and evolve to more isolated models as they grow.

---

**In summary**, multi-tenancy is a foundational concept in modern cloud applications, enabling efficient, scalable, and cost-effective service delivery to multiple customers from a single platform.

---

A full-stack multi-tenant CRM application built with **NestJS** (backend), **React + Vite** (frontend), **Prisma ORM**, and **PostgreSQL**. The project is containerized using Docker Compose for easy local development.

---

## Project Structure

```
.
├── docker-compose.yml
├── client/      # React + Vite frontend
└── server/      # NestJS backend (Prisma, PostgreSQL)
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Docker](https://www.docker.com/)
- [npm](https://www.npmjs.com/)

---

## Getting Started

### 1. Clone the Repository

```sh
git clone <https://github.com/cagridai/mpc-multi-tenancy-crm>
cd multi-tenant
```

### 2. Environment Variables

- Copy and adjust environment files as needed:
  - `server/.env`
  - `client/.env`

**Important:**  
In `server/.env`, set your database URL like:

```
DATABASE_URL=postgresql://cagri:123123@db:5432/multitenant_db
```

This ensures the backend connects to the Dockerized database.

### 3. Start All Services

```sh
docker-compose up --build
```

- The **API** will be available at [http://localhost:3001](http://localhost:3001)
- The **Frontend** will be available at [http://localhost:5173](http://localhost:5173)
- The **PostgreSQL** database runs inside Docker

---

## Development

- **Frontend:**  
  Edit files in `client/src/`. Hot reload is enabled with Vite.
- **Backend:**  
  Edit files in `server/src/`. The server restarts automatically in development mode.

### Useful Commands

#### Backend

```sh
# Run backend locally (outside Docker)
cd server
npm install
npm run start:dev
```

#### Frontend

```sh
# Run frontend locally (outside Docker)
cd client
npm install
npm run dev
```

#### Database Migrations

```sh
cd server
npx prisma migrate dev
```

---

**Note:**  

- Make sure Docker is running before starting the stack.
- For troubleshooting database connection issues, ensure your `.env` uses `db` as the host (not `localhost`).
