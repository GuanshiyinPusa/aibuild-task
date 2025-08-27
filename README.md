# Analytics Dashboard - Technical Documentation

**Live Application**: [https://aibuild-task-git-main-guanshiyinpusas-projects.vercel.app](https://aibuild-task.vercel.app/)

**Repository Branches**:
- `backup-tailwind-version`: Initial prototype
- `sqlite-version-undeployable-on-vercel`: Local development version
- `main`: Production deployment currently running on vercel

**Local Deployment**:
```bash
npm run dev
```
## Understanding of the Requirements

### Core Functionality Analysis

The project required building a web-based analytics system with four main components:

1. **Data Visualization Dashboard**: Interactive line charts displaying procurement history, sales history, and inventory trends for multiple products across consecutive days, with product comparison capabilities(Pretty Straightforward).

2. **User Authentication System**: Basic login functionality using username/password authentication with custom database implementation (I didn't use commercial services like Auth0, can't afford them anyway).

3. **Excel Data Import**: File upload system with API endpoint to parse Excel files containing procurement and sales data, storing the processed information in a database using an ORM(Prisma).

4. **Database Integration**: Persistent data storage using an ORM library to maintain user accounts and product data between sessions.

### Technical Requirements Interpretation

- **Framework**: Next.js with React for full-stack development
- **Database**: PostgreSQL with Prisma ORM for data persistence
- **Authentication**: Custom JWT-based session management
- **File Processing**: XLSX library for Excel file parsing
- **UI Framework**: Material-UI for professional interface design
- **Deployment**: Vercel-compatible serverless architecture

## System Architecture

### Overall Structure

```
Frontend (Next.js + React + Material-UI)
    ↕
API Routes (Next.js serverless functions)
    ↕
Database Layer (Prisma ORM)
    ↕
PostgreSQL Database (Neon/Vercel)
```

### Data Flow

1. **User Authentication Flow**:
   - User submits credentials via login form
   - API validates against database and creates JWT session
   - Session cookie enables access to protected routes

2. **Excel Upload Flow**:
   - User uploads Excel file via drag-and-drop interface
   - File processed by XLSX library on server
   - Data parsed and validated according to expected format
   - Products and daily data stored in database with user association

3. **Data Visualization Flow**:
   - Dashboard fetches user's products via API
   - Data transformed for chart consumption
   - Interactive charts rendered with Recharts library
   - Real-time product comparison and filtering

### Database Schema

```sql
Users
├── id (primary key)
├── username (unique)
├── password (hashed)
└── timestamps

Products
├── id (primary key)
├── productId
├── productName
├── openingInventory
├── userId (foreign key)
└── timestamps

DailyData
├── id (primary key)
├── day (1, 2, or 3)
├── procurementQty
├── procurementPrice
├── salesQty
├── salesPrice
├── productId (foreign key)
└── timestamps
```

### Frontend Architecture

- **Pages**: Homepage, Login, Dashboard, Upload
- **Components**: ProductChart, ThemeProvider, Authentication hooks
- **State Management**: React hooks with API integration
- **Routing**: Next.js App Router with protected routes

### Backend Architecture

- **API Endpoints**:
  - `/api/auth/login` - User authentication
  - `/api/auth/register` - Account creation
  - `/api/auth/logout` - Session termination
  - `/api/auth/me` - Session validation
  - `/api/upload` - Excel file processing
  - `/api/products` - Product data retrieval

## Development Stages

### Stage 1: Tailwind Version (backup-tailwind-version)
- Basic functionality with Tailwind CSS styling
- In-memory data storage for proof of concept (AKA: No database yet)
- Local session management
- File upload simulation

### Stage 2: SQLite Version (sqlite-version-undeployable-on-vercel)
- Database integration with SQLite and Prisma ORM
- Persistent data storage locally
- Password hashing with bcrypt
- Real Excel file processing
- Complete authentication system
- Unable to deploy on vercel due to sqlite

### Stage 3: Production Version (main)
- PostgreSQL database with Neon integration
- Vercel deployment compatibility
- Material-UI professional interface
- Serverless architecture optimization
- Production-ready security measures

## Technical Decisions and Rationale

### Database Choice Evolution

- **SQLite**: Initially chosen for simplicity and zero-configuration setup
- **PostgreSQL**: Switched for production deployment on Vercel, as serverless environments cannot persist SQLite files

### UI Framework Selection

- At first, **Tailwind CSS**
- Then, **Material-UI**

### Authentication Strategy

- **Custom Implementation**: Built JWT-based authentication 
- **Session Management**: In-memory session storage 

### File Processing Approach

- **Client-side Upload**: Drag-and-drop interface for better user experience
- **Server-side Processing**: XLSX parsing on backend for security and performance
- **Error Handling**: Graceful handling of malformed files and data validation

## Assumptions and Limitations

### Assumptions

1. **Excel Format Consistency**: Input files follow the specified column structure (Product ID, Name, Opening Inventory, followed by 3 days of procurement and sales data)

2. **Data Volume**: System designed for moderate data volumes typical of small to medium business operations

3. **User Base**: Multi-tenant system where each user manages their own product data independently

4. **Browser Compatibility**: Modern browser support with JavaScript enabled

### Current Limitations

1. **Session Storage**: In-memory session management resets on server restart 

2. **File Size**: No explicit file size limits implemented beyond browser/server defaults

3. **Data Validation**: Basic validation on Excel data format, could be enhanced with more comprehensive error reporting

4. **Concurrent Users**: No explicit rate limiting or concurrent access controls

5. **Data Export**: Currently read-only after upload, no data export functionality implemented

### Scalability Considerations

- Database queries not optimized for large datasets
- No caching mechanism for frequently accessed data
- Client-side state management may need optimization for larger product catalogs

## Deployment Configuration

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Token signing secret
- `NEXTAUTH_SECRET`: Additional authentication secret

---
