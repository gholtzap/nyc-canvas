# NYC Neighborhood Explorer

A full-stack web application for tracking your exploration of New York City neighborhoods. Built with Next.js, TypeScript, Prisma, and SQLite.

## Features

- **User Authentication**: Secure registration and login with JWT-based sessions
- **Neighborhood Tracking**: Track 173 NYC neighborhoods across all five boroughs
- **Exploration Status**: Mark neighborhoods as explored/unexplored
- **Photo Upload**: Upload and manage multiple photos for each neighborhood
- **Notes**: Write and save personal notes about each neighborhood
- **Progress Dashboard**: View your exploration progress with statistics
- **Filtering**: Filter neighborhoods by borough and exploration status
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT with httpOnly cookies
- **Image Storage**: Local file system

## Prerequisites

- Node.js 18+
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

The `.env` file has already been created with default values:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-change-in-production"
```

**Important**: For production deployment, change the `JWT_SECRET` to a secure random string.

### 3. Set Up the Database

Run the Prisma migration to create the database schema:

```bash
npx prisma migrate dev
```

### 4. Seed the Database

Populate the database with NYC neighborhood data:

```bash
npm run seed
```

This will add 173 neighborhoods across all five boroughs.

### 5. Start the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Database Schema

### Models

- **User**: Stores user accounts with email and hashed password
- **Neighborhood**: Contains all NYC neighborhoods (173 total)
- **UserNeighborhood**: Junction table tracking user's exploration status, notes, and exploration date
- **Photo**: Stores photo metadata and file paths for each neighborhood

### Relationships

- Users have many UserNeighborhoods (many-to-many with Neighborhood)
- Neighborhoods have many UserNeighborhoods
- UserNeighborhoods have many Photos

## Usage

### 1. Create an Account

- Visit the app and click "Get Started" or "Register"
- Enter your email, password, and optionally your name
- You'll be automatically logged in and redirected to the neighborhoods page

### 2. View Neighborhoods

- See all 173 NYC neighborhoods organized by borough
- Filter by borough (Manhattan, Brooklyn, Queens, Bronx, Staten Island)
- Filter by exploration status (All, Explored, Not Explored)
- View your progress statistics at the top

### 3. Mark Neighborhoods as Explored

- Click "Mark Explored" on any neighborhood card to mark it as explored
- Click "✓ Explored" to un-mark it
- Exploration date is automatically recorded

### 4. Add Photos and Notes

- Click on any neighborhood name to view details
- Upload photos using the "Upload Photo" button
- Add personal notes in the text area and click "Save Notes"
- Delete photos by hovering over them and clicking the × button

### 5. Track Your Progress

- View your exploration statistics on the neighborhoods page
- See completion percentage and total neighborhoods explored

## Project Structure

```
nyc-canvas/
├── app/
│   ├── api/
│   │   ├── auth/          # Authentication endpoints
│   │   └── neighborhoods/ # Neighborhood and photo endpoints
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── neighborhoods/     # Neighborhoods list and detail pages
│   ├── layout.tsx         # Root layout with auth provider
│   └── page.tsx           # Landing page
├── components/
│   └── Navbar.tsx         # Navigation component
├── contexts/
│   └── AuthContext.tsx    # Authentication context
├── lib/
│   ├── auth.ts            # JWT and password utilities
│   └── prisma.ts          # Prisma client instance
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data for neighborhoods
└── public/
    └── uploads/           # Uploaded photos storage
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Neighborhoods
- `GET /api/neighborhoods` - Get all neighborhoods with user's exploration status
- `GET /api/neighborhoods/[slug]` - Get single neighborhood details
- `PATCH /api/neighborhoods/[slug]` - Update exploration status or notes

### Photos
- `POST /api/neighborhoods/[slug]/photos` - Upload photo
- `DELETE /api/neighborhoods/[slug]/photos?photoId=X` - Delete photo

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm build

# Start production server
npm start

# Run database migrations
npx prisma migrate dev

# Seed database
npm run seed

# Open Prisma Studio (database GUI)
npx prisma studio

# Lint code
npm run lint
```

## Production Deployment

1. Update the `JWT_SECRET` in your environment variables
2. Set `NODE_ENV=production`
3. Run `npm run build` to create an optimized production build
4. Start the server with `npm start`
5. Consider using a more robust database (PostgreSQL, MySQL) for production

## Security Considerations

- Passwords are hashed using bcrypt before storage
- JWT tokens are stored in httpOnly cookies to prevent XSS attacks
- User data is isolated - users can only access their own exploration data
- File uploads are validated and stored with unique filenames

## Future Enhancements

- Map view showing explored neighborhoods
- Share exploration progress with friends
- Import/export exploration data
- Neighborhood recommendations based on explored areas
- Social features (comments, ratings)
- Mobile app version

## License

MIT

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
