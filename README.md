# Wedding Guest Management System

A modern, elegant wedding guest management system with an Arabic luxury theme. This full-stack application helps couples manage their wedding guests, RSVPs, travel arrangements, accommodations, and more.

## Features

### Admin Portal
- **Dashboard** - Real-time statistics, RSVP progress, and guest insights
- **Guest Management** - Add, edit, delete guests with Excel import/export
- **RSVP Tracking** - Track responses with pending, confirmed, declined status
- **Travel Coordination** - Manage guest travel and airport pickups
- **Hotel Management** - Suggested hotels with booking links
- **Dress Code** - Define dress options with visual examples
- **Food & Dining** - Menu management with dietary tracking
- **Activities** - Plan wedding-related activities and events
- **Media Gallery** - Upload and organize photos/videos

### Guest Portal
- **Unique Invitation Links** - Personalized link for each guest
- **Multi-Section RSVP** - Respond to all wedding aspects
- **Mobile-Responsive** - Beautiful on all devices
- **Arabic Luxury Theme** - Elegant design with gold accents

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Relational database
- **SQLAlchemy 2.0** - Async ORM
- **Pydantic** - Data validation
- **JWT** - Authentication

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Ant Design** - Component library
- **Emotion** - CSS-in-JS styling
- **Framer Motion** - Animations
- **TanStack Query** - Data fetching
- **React Router** - Navigation

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- PostgreSQL 14+
- Docker (optional)

### Quick Start with Docker

```bash
# Clone the repository
git clone <repository-url>
cd wedding-guest-management

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start with Docker Compose
docker-compose up -d

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Manual Setup

#### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create PostgreSQL database
createdb wedding_db

# Copy and configure environment
cp .env.example .env
# Edit .env with your settings

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

## Project Structure

```
wedding-guest-management/
├── backend/
│   ├── app/
│   │   ├── models/          # SQLAlchemy models
│   │   ├── routers/         # API endpoints
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utilities & helpers
│   │   │   ├── exceptions.py    # Custom exceptions
│   │   │   ├── validators.py    # Input validators
│   │   │   ├── security.py      # Auth utilities
│   │   │   └── helpers.py       # Helper functions
│   │   ├── config.py        # Configuration
│   │   ├── database.py      # Database setup
│   │   └── main.py          # FastAPI app
│   ├── uploads/             # Uploaded files
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Common/      # Shared components
│   │   │   ├── Layout/      # Layout components
│   │   │   ├── admin/       # Admin components
│   │   │   ├── guest/       # Guest portal components
│   │   │   ├── auth/        # Auth components
│   │   │   └── animations/  # Animation components
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom hooks
│   │   ├── pages/           # Page components
│   │   ├── routes/          # Route definitions
│   │   ├── services/        # API services
│   │   ├── styles/          # Global styles
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utilities
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
├── docker-compose.yml
└── README.md
```

## Environment Variables

### Backend (.env)
| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | Required |
| SECRET_KEY | JWT signing key (change in production!) | Required |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:5173 |
| ENVIRONMENT | development/production | development |
| DEBUG | Enable debug mode | true |
| UPLOAD_DIR | Upload directory path | ./uploads |
| MAX_UPLOAD_SIZE | Max file upload size (bytes) | 10485760 |

### Frontend (.env)
| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | http://localhost:8000 |
| VITE_APP_NAME | Application name | Wedding Guest Management |
| VITE_ENVIRONMENT | Environment | development |

## API Documentation

Access interactive API docs when backend is running:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - Register new admin
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user

#### Admin - Guests
- `GET /api/admin/guests` - List guests (paginated, filterable)
- `POST /api/admin/guests` - Create guest
- `PATCH /api/admin/guests/{id}` - Update guest
- `DELETE /api/admin/guests/{id}` - Delete guest
- `POST /api/admin/guests/import` - Import from Excel
- `GET /api/admin/guests/export` - Export to Excel

#### Guest Portal
- `GET /api/guest/{token}` - Get guest portal data
- `POST /api/guest/{token}/rsvp` - Submit RSVP
- `POST /api/guest/{token}/travel` - Submit travel info
- `POST /api/guest/{token}/hotel` - Submit hotel preference

## Theme Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Gold | `#C9A961` | Primary, accents, CTAs |
| Deep Teal | `#1A3A3A` | Secondary, headers |
| Maroon | `#8B1538` | Accent highlights |
| Cream | `#FDF8F3` | Background |
| Dark Text | `#2C2C2C` | Body text |

## Deployment

### Production Build

#### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

#### Frontend
```bash
cd frontend
npm run build
# Serve dist folder with nginx
```

### Docker Production
```bash
docker-compose --profile production up -d
```

### Database Migrations

```bash
# Using Alembic (if set up)
alembic upgrade head

# Or manual table creation via API startup
```

## Security Considerations

- Change `SECRET_KEY` in production (use a 64+ character random string)
- Use HTTPS in production
- Configure CORS properly for your domain
- Keep dependencies updated
- Never commit `.env` files
- Use strong database passwords
- Consider rate limiting for public endpoints

## Error Handling

The application provides consistent error responses:

```json
{
  "detail": "Human-readable error message",
  "error_code": "ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00Z",
  "errors": {
    "field_name": "Field-specific error"
  }
}
```

Common error codes:
- `VALIDATION_ERROR` - Input validation failed
- `NOT_FOUND` - Resource not found
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Permission denied
- `TOKEN_EXPIRED` - JWT token expired

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details.

## Support

For issues and feature requests, please use the GitHub issue tracker.
