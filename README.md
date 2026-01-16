# Portfolio Tracker

A personal portfolio tracker built following the Bogleheads investment strategy. Track your assets across multiple brokers, monitor your target allocation, and get rebalancing recommendations.

## Features

- 📊 **Portfolio Overview**: View total portfolio value and asset distribution
- 🏦 **Multi-Broker Support**: Track holdings across different brokers (Fidelity, Interactive Brokers, etc.)
- 🎯 **Target Allocation**: Set target percentages for each asset based on your investment strategy
- 📈 **Rebalancing Recommendations**: Automatic calculations for buy/sell actions to maintain target allocation
- 💰 **Broker Balance Tracking**: View total value, unique assets, and holdings count per broker
- 🔄 **Real-time Pricing**: Fetch current market prices via Yahoo Finance API

## Tech Stack

### Frontend

- **React 19** - UI library with React Compiler enabled
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS v4** - Styling
- **shadcn/ui** - UI components built on Radix UI
- **Recharts** - Data visualization
- **@tanstack/react-query** - Server state management

### Backend

- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Row Level Security (RLS)
  - Authentication
  - Edge Functions

### Architecture

- **Screaming Architecture** - Domain-driven design
- Feature-based folder structure
- Separation of concerns (UI, logic, services)

## Project Structure

```
src/
├── app/              # App entry point, routing, providers
├── features/         # Domain-specific features
│   ├── asset-manager/       # CRUD for assets, brokers, holdings
│   ├── auth/                # Authentication
│   ├── market-data/         # Price fetching services
│   └── portfolio-viewer/    # Portfolio dashboard and calculations
├── shared/           # Shared utilities
│   ├── ui/           # Reusable UI components
│   ├── utils/        # Utility functions
│   ├── infra/        # Infrastructure (Supabase client)
│   └── constants/    # App-wide constants
└── types/            # TypeScript type definitions

supabase/
├── functions/        # Edge Functions
│   └── fetch-prices/ # Yahoo Finance price fetching
└── supabase-schema.sql  # Database schema and seed data
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 9+
- Supabase account

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd porfolio-tracker
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env` file:

   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase**

   Run the schema in Supabase SQL Editor:

   ```bash
   # Copy contents of supabase-schema.sql and execute in Supabase SQL Editor
   ```

5. **Deploy Edge Function** (optional, for real prices)

   ```bash
   supabase functions deploy fetch-prices
   ```

6. **Generate seed data** (optional)

   In Supabase SQL Editor:

   ```sql
   SELECT generate_seed_data();
   ```

### Development

```bash
# Start dev server
pnpm dev

# Type check
pnpm tsc --noEmit

# Lint
pnpm lint

# Build for production
pnpm build
```

## Database Schema

### Tables

- **assets** - Investment assets (stocks, ETFs, etc.)
  - `id`, `user_id`, `symbol`, `name`, `type`, `target_percentage`
- **brokers** - Brokerage accounts
  - `id`, `user_id`, `name`, `icon`
- **holdings** - Actual positions
  - `id`, `user_id`, `broker_id`, `asset_id`, `shares`

All tables have Row Level Security (RLS) enabled with `auth.uid()` policies.

## Key Features Explained

### Portfolio Calculation

The `portfolio-calculator.ts` aggregates holdings by asset across all brokers:

1. Sum total shares per asset
2. Calculate current value (shares × price)
3. Compare current allocation vs target allocation
4. Generate rebalancing recommendations

### Broker Balance Tracking

The `broker-calculator.ts` provides per-broker analytics:

1. Groups holdings by broker
2. Counts unique assets per broker
3. Calculates total value per broker
4. Shows percentage of total portfolio

### Price Fetching

The Edge Function `fetch-prices` fetches real-time prices from Yahoo Finance API:

- Public API, no authentication required
- Parallel requests for multiple symbols
- Error handling with proper error messages
- No mock fallbacks (shows honest errors if API fails)

## Configuration

### Asset Types

Currently supports: `stock`, `etf`

Add new types in `asset-manager.tsx`:

```tsx
<option value="bond">Bond</option>
```

### Rebalancing Threshold

Default: Suggest buy/sell only if difference > 1 share price

Modify in `portfolio-calculator.ts:56-58`

### Currency

Currently USD only. Change in `format.ts:2-5`

## Code Conventions

- **File naming**: `kebab-case` (e.g., `portfolio-manager.tsx`)
- **Component exports**: Default exports only
- **Imports**: Absolute imports with `@/` alias
- **TypeScript**: Strict mode, no `any`
- **State management**:
  - Server state: React Query
  - Local state: `useState`
- **Error handling**: React Error Boundaries

## Contributing

This is a personal project, but feel free to fork and adapt to your needs!

### Commit Convention

Following Conventional Commits:

```
feat(scope): add new feature
fix(scope): fix bug
docs: update documentation
refactor(scope): refactor code
chore: update dependencies
```

## Roadmap

- [ ] Historical price data storage
- [ ] Performance tracking (1D, 1W, 1M, 1Y)
- [ ] Multi-currency support
- [ ] Dividend tracking
- [ ] Tax-loss harvesting suggestions
- [ ] Mobile app (React Native)

## License

MIT

## Acknowledgments

- Built following [Bogleheads investment philosophy](https://www.bogleheads.org/)
- Inspired by the need for a simple, transparent portfolio tracker
- Uses Yahoo Finance for pricing data

---

**Note:** This is an MVP. Always verify calculations and consult with financial advisors for investment decisions.
