# AI-Powered RFP Management System

## Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx          # Fixed navigation sidebar
│   │   └── MainLayout.tsx       # Main layout wrapper with sidebar
│   └── ui/
│       ├── Button.tsx            # Reusable button component with variants
│       └── Card.tsx              # Card primitive with sub-components
├── pages/
│   ├── RFPCreator.tsx           # Natural language RFP creation
│   ├── VendorDirectory.tsx      # Vendor management and master data
│   ├── ActiveRFPs.tsx           # RFP tracking and email monitoring
│   └── EvaluationDashboard.tsx  # AI-assisted vendor comparison
├── lib/
│   └── utils.ts                 # Utility functions (cn for className merging)
├── App.tsx                      # Main app with routing setup
└── main.tsx                     # Application entry point
```

## Design Philosophy

- **Shadcn-like aesthetic**: Clean lines, generous white space, subtle borders
- **Professional monochrome palette**: Slate/Zinc color scheme
- **Custom components**: No external UI libraries, built from scratch
- **TypeScript**: Full type safety throughout the application
- **Modular architecture**: Reusable components and clear separation of concerns

## Key Features

### 1. **Navigation**
- Fixed sidebar with logo area
- Four main sections with descriptive icons (Lucide React)
- Active route highlighting
- Responsive design with helpful descriptions

### 2. **UI Components**
- **Button**: Multiple variants (default, outline, ghost, link) and sizes
- **Card**: Flexible card component with header, content, footer sub-components
- **className utilities**: `cn()` function using clsx + tailwind-merge

### 3. **Pages**
- **RFP Creator**: Natural language input for RFP generation
- **Vendor Directory**: Vendor management with search and statistics
- **Active RFPs**: RFP tracking with status indicators
- **Evaluation Dashboard**: AI-powered proposal comparison

## Tech Stack

- **React 19** with TypeScript
- **React Router v7** for SPA routing
- **Tailwind CSS v4** for styling
- **Lucide React** for iconography
- **Vite** for build tooling

## Running the Application

```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run lint   # Run ESLint
```

## Development Notes

- All components use TypeScript with proper type definitions
- Tailwind classes are merged using the `cn()` utility
- Layout maintains max-width of 7xl with responsive padding
- No full page reloads - pure SPA navigation
- Clean, optimized code ready for feature implementation
