# 🏦 Apex Global Bank — Full Stack Microservices Banking Platform

A production-grade, enterprise-ready **Full Stack Banking Management System** built with **Spring Boot 3 Microservices**, **Spring Cloud**, **JWT Authentication**, **MySQL**, **Resilience4j**, and a responsive **Angular 19** frontend.

> **Permanent Live Demo (Frontend):** [https://sushmag24.github.io/banking-system/](https://sushmag24.github.io/banking-system/)  
> **GitHub Repository:** [https://github.com/sushmag24/banking-system](https://github.com/sushmag24/banking-system)

---

## 📸 Screenshots

| Login Page | Dashboard |
|:---:|:---:|
| ![Login](https://img.shields.io/badge/Login-Angular_UI-blue?style=for-the-badge) | ![Dashboard](https://img.shields.io/badge/Dashboard-KPI_Cards-green?style=for-the-badge) |

| Fund Transfer | Transaction History |
|:---:|:---:|
| ![Transfer](https://img.shields.io/badge/Fund_Transfer-Real_Time-orange?style=for-the-badge) | ![Transactions](https://img.shields.io/badge/Transactions-Filterable-purple?style=for-the-badge) |

---

## 🏛️ Architecture Overview

```
                                  +-----------------------+
                                  |   Angular Frontend    |
                                  |   (SPA - Port 4200)   |
                                  +-----------+-----------+
                                              |
                                              v  (HTTP/REST + JWT)
                                  +-----------+-----------+
                                  |      API Gateway      |
                                  |     (Port 8080)       |
                                  +-----------+-----------+
                                              |
       +--------------------+-----------------+--------------------+--------------------+
       |                    |                 |                    |                    |
       v                    v                 v                    v                    v
+--------------+    +--------------+   +--------------+    +--------------+    +--------------+
| User Service |    |Account Svc   |   |Fund Transfer |    | Transaction  |    |  Sequence    |
|  (Port 8082) |    | (Port 8081)  |   |  (Port 8085) |    |  (Port 8084) |    |  (Port 8083) |
+------+-------+    +------+-------+   +------+-------+    +------+-------+    +------+-------+
       |                   |                  |                    |                   |
       +-------------------+------------------+--------------------+-------------------+
                                              |
                           +------------------+------------------+
                           |                                     |
                           v                                     v
                  +-----------------+                   +-----------------+
                  | Eureka Registry |                   |     MySQL DB    |
                  |  (Port 8761)    |                   |  (5 schemas)    |
                  +-----------------+                   +-----------------+
```

---

## 🚀 Key Features

### 👥 User Management & Authentication (`user-service`)
- Customer registration & login with credential verification
- JWT token-based stateless authentication
- Role-based access control (`CUSTOMER` & `ADMIN`)
- Customer profile management with identification tracking

### 💳 Bank Account Operations (`account-service`)
- Create bank accounts with auto-generated unique account numbers (`ACC0000xxx`)
- Multiple account types: `SAVINGS`, `CURRENT`, `FIXED_DEPOSIT`
- Real-time balance inquiry and account status tracking
- Self-service deposit and withdrawal operations

### 🤝 Beneficiary Management (`fund-transfer-service`)
- Add, view, search, and delete registered payees
- Strict ownership validation — prevents cross-customer access
- Destination account validation & self-transfer prevention

### 💸 Instant Fund Transfer (`fund-transfer-service`)
- Atomic money transfers between bank accounts
- Real-time balance validation with sufficient-funds check
- Double-entry bookkeeping: debit on sender, credit on recipient
- Unique transaction reference IDs (`TXN-xxxxxxxx`)
- Circuit breaker & retry resilience (`Resilience4j`)

### 📜 Transaction History & Analytics (`transaction-service`)
- Filterable statement by date range, transaction type, and status
- Transaction types: `DEPOSIT`, `WITHDRAWAL`, `INTERNAL_TRANSFER`
- Dashboard summary: Total Credited, Total Debited, Total Transactions
- CSV export and printable transfer receipts

### 📊 Interactive Dashboard (`frontend`)
- Current balance hero card with copy-to-clipboard account number
- KPI cards: Total Credited, Total Debited, Total Transactions
- Quick Action launcher for all banking operations
- Recent transactions feed with color-coded credit/debit indicators

---

## 🛠️ Technology Stack

| Layer | Technologies |
|:---|:---|
| **Backend** | Java 21, Spring Boot 3.5.x, Spring Web, Spring Data JPA |
| **Cloud & Microservices** | Spring Cloud Netflix Eureka, Spring Cloud Gateway, OpenFeign |
| **Resilience** | Resilience4j (Circuit Breaker, Rate Limiter, Retry) |
| **Security** | Spring Security 6, JWT, Keycloak (optional) |
| **Database** | MySQL 8.x, Hibernate ORM |
| **Frontend** | Angular 19, TypeScript, RxJS, Bootstrap 5 |
| **Build & Tooling** | Apache Maven 3.9+, Node.js 20+, Angular CLI |
| **Deployment** | Vercel (Frontend), Railway/Render (Backend), Aiven (MySQL) |

---

## 🔌 Microservices & Port Mappings

| Service | Port | Description |
|:---|:---:|:---|
| **service-registry** | `8761` | Eureka Service Discovery Registry |
| **api-gateway** | `8080` | Edge Gateway with CORS & Route Management |
| **account-service** | `8081` | Accounts, Balances & Status Management |
| **user-service** | `8082` | Authentication, Users & Profiles |
| **sequence-generator** | `8083` | Distributed Sequence Number Generator |
| **transaction-service** | `8084` | Transaction Ledger & Filter Engine |
| **fund-transfer-service** | `8085` | Fund Transfers & Beneficiary Management |
| **frontend** | `4200` | Angular Single Page Application |

---

## 💾 Database Setup

Create the microservice databases in MySQL:

```sql
CREATE DATABASE IF NOT EXISTS user_service;
CREATE DATABASE IF NOT EXISTS account_service;
CREATE DATABASE IF NOT EXISTS fund_transfer_service;
CREATE DATABASE IF NOT EXISTS transaction_service;
CREATE DATABASE IF NOT EXISTS sequence_generator;
```

---

## 🏁 Local Setup & Run Instructions

### Prerequisites
- Java 21 (or 17+)
- Maven 3.9+
- Node.js 20+ & npm
- MySQL 8.x running locally

### 1. Clone the Repository
```bash
git clone https://github.com/sushmag24/banking-system.git
cd banking-system
```

### 2. Configure Environment Variables
Set your MySQL password (and optionally other config):
```bash
export MYSQL_PASSWORD=YourMySQLPassword
export MYSQL_HOST=localhost
export MYSQL_PORT=3306
export MYSQL_USER=root
```

### 3. Build All Services
```bash
# Build each service (from project root)
cd service-registry && mvn clean package -DskipTests && cd ..
cd sequence-generator && mvn clean package -DskipTests && cd ..
cd user-service && mvn clean package -DskipTests && cd ..
cd account-service && mvn clean package -DskipTests && cd ..
cd transaction-service && mvn clean package -DskipTests && cd ..
cd fund-transfer-service && mvn clean package -DskipTests && cd ..
cd api-gateway && mvn clean package -DskipTests && cd ..
```

### 4. Start Services (in order)
```bash
# Terminal 1 - Eureka Registry
java -jar service-registry/target/service-registry-0.0.1-SNAPSHOT.jar

# Terminal 2 - Sequence Generator
java -jar sequence-generator/target/sequence-generator-0.0.1-SNAPSHOT.jar

# Terminal 3 - User Service
java -jar user-service/target/user-service-0.0.1-SNAPSHOT.jar

# Terminal 4 - Account Service
java -jar account-service/target/account-service-0.0.1-SNAPSHOT.jar

# Terminal 5 - Transaction Service
java -jar transaction-service/target/transaction-service-0.0.1-SNAPSHOT.jar

# Terminal 6 - Fund Transfer Service
java -jar fund-transfer-service/target/fund-transfer-service-0.0.1-SNAPSHOT.jar

# Terminal 7 - API Gateway
java -jar api-gateway/target/api-gateway-0.0.1-SNAPSHOT.jar
```

### 5. Start Angular Frontend
```bash
cd frontend
npm install
npm start
```

### 6. Access the Application
- **Frontend:** http://localhost:4200
- **Eureka Dashboard:** http://localhost:8761
- **API Gateway:** http://localhost:8080

---

## 🧪 End-to-End Verification Flow

1. **Register** — Create a new customer account
2. **Login** — Authenticate and receive JWT token
3. **Dashboard** — View balance, KPIs, and recent transactions
4. **Create Account** — Open a new bank account with initial deposit
5. **Deposit** — Fund your account
6. **Withdraw** — Withdraw funds
7. **Add Beneficiary** — Register a payee
8. **Fund Transfer** — Transfer money to the beneficiary
9. **Transaction History** — View filterable statement and analytics
10. **Profile** — View your customer profile
11. **Logout** — Clear the JWT session

---

## 🌐 Deployment

### Frontend
- **Platform:** Vercel
- **URL:** [https://apex-global-bank.vercel.app](https://apex-global-bank.vercel.app)

### Backend
- **Platform:** Railway / Render
- **API Gateway URL:** Configured in frontend `api.config.ts`

### Database
- **Platform:** Aiven MySQL (Free Tier) or Railway MySQL
- **Schemas:** 5 separate databases for each microservice

### Environment Variables (Production)

| Variable | Description |
|:---|:---|
| `MYSQL_HOST` | Database host (e.g., `mysql-xxxxx.aiven.io`) |
| `MYSQL_PORT` | Database port (default: `3306`) |
| `MYSQL_USER` | Database username |
| `MYSQL_PASSWORD` | Database password |
| `MYSQL_DB_NAME` | Database name (per service) |
| `KEYCLOAK_URL` | Keycloak server URL (optional) |
| `KEYCLOAK_CLIENT_SECRET` | Keycloak client secret (optional) |

---

## 📖 API Documentation

When services are running, Swagger UI is available at:

| Service | Swagger URL |
|:---|:---|
| User Service | http://localhost:8082/swagger-ui/index.html |
| Account Service | http://localhost:8081/swagger-ui/index.html |
| Fund Transfer Service | http://localhost:8085/swagger-ui/index.html |
| Transaction Service | http://localhost:8084/swagger-ui/index.html |
| Sequence Generator | http://localhost:8083/swagger-ui/index.html |

---

## 🎯 Architecture Decisions (Interview Ready)

1. **Microservices Decomposition** — Domain-driven design separating User Identity, Account Lifecycle, Financial Transfers, and Transaction Ledger into autonomous services.
2. **Resilience & Fault Tolerance** — OpenFeign clients decorated with Resilience4j Circuit Breakers and Retries to isolate downstream failures.
3. **Service Discovery** — Eureka-based dynamic service registry enabling load-balanced inter-service communication via Spring Cloud Gateway.
4. **Stateless JWT Security** — Bearer tokens for fast stateless authentication across all microservices.
5. **Modern SPA Frontend** — Angular 19 with standalone components, reactive routing, HTTP interceptors, and route guards.

---

## 📄 License

This project is for educational and portfolio demonstration purposes.

---

**Built with ❤️ by [Sushma Gowda](https://github.com/sushmag24)**