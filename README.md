# Manage Expenses 💳

A full-featured, cross-platform personal finance & expense tracking application built with **React Native**, **Expo Router**, and **TypeScript**.

---

## ✨ Features

- **📊 Comprehensive Financial Dashboard**
  - Real-time Net Balance calculation.
  - Income vs. Expense monthly split cards with percentage savings rate badge.
  - Monthly budget utilization progress bar.
  - Top category spending pills.
  - Recent transactions list with one-tap detail views.

- **📑 Searchable & Filterable Transactions**
  - Instant search across titles, notes, and payees.
  - Type toggle: All, Expenses Only, Income Only.
  - Horizontal category filtering pills (Food, Shopping, Housing, Transport, Bills, etc.).
  - Multi-criteria sorting (Newest first, Highest amount, Lowest amount).
  - Summary count and net totals of filtered views.

- **📈 Visual Analytics & Insights**
  - Monthly cashflow visual comparison bar.
  - 4-metric summary grid (Savings Rate, Daily Average, Net Saved, Peak Expense).
  - Categorized spending breakdown with percentage progress bars.
  - Automated smart spending insights based on user transactions.

- **🎯 Category Budget Management**
  - Overall monthly budget limit vs. current spend with dynamic warning indicators.
  - Per-category spending caps with color-coded utilization:
    - 🟢 Safe (< 80%)
    - 🟡 Warning (80% - 99%)
    - 🔴 Exceeded (≥ 100%)
  - Custom budget limits editor for all expense categories.

- **➕ Add & Manage Transactions**
  - Quick amount increment chips (+10, +25, +50, +100, +500).
  - Expense vs. Income type toggling.
  - Visual category grid with custom icons and color tokens.
  - Payment method tagging (Credit Card, Debit Card, UPI, Bank Transfer, Cash).
  - Date and notes management.
  - Transaction detail view with confirmation-prompted deletion.

- **⚙️ Settings & Device Persistence**
  - Currency switcher (USD `$`, EUR `€`, GBP `£`, INR `₹`, JPY `¥`, CAD `C$`, AUD `A$`).
  - Offline-first local storage powered by `@react-native-async-storage/async-storage`.
  - Realistic demo data preloaded out of the box with one-tap restore option.
  - Complete data wipe option.
  - Responsive dark/light theme support.

---

## 🏗️ Architecture & Project Structure

```
manage-expenses/
├── assets/                       # Icons, adaptive icons, and splash screens
├── src/
│   ├── app/                      # Expo Router (file-based routing)
│   │   ├── _layout.tsx           # Root layout with Stack & ThemeProvider
│   │   ├── (tabs)/               # Bottom tab navigator
│   │   │   ├── _layout.tsx       # Bottom tabs navigation config
│   │   │   ├── index.tsx         # Dashboard / Home Screen
│   │   │   ├── transactions.tsx  # Transactions screen with search & filters
│   │   │   ├── analytics.tsx     # Visual analytics & insights screen
│   │   │   └── budgets.tsx       # Category budget utilization screen
│   │   ├── add-modal.tsx         # Modal to add income or expense
│   │   ├── transaction-detail.tsx# Modal to view and delete transaction
│   │   ├── budget-modal.tsx      # Modal to adjust category spending limits
│   │   └── settings-modal.tsx    # Modal to change currency & manage data
│   ├── components/               # Reusable UI components
│   │   ├── BalanceHero.tsx       # Net balance and cashflow cards
│   │   ├── CategoryIcon.tsx      # Lucide icons for categories and payment methods
│   │   ├── ProgressBar.tsx       # Custom rounded progress bar
│   │   └── TransactionCard.tsx   # Polished transaction row item
│   ├── constants/
│   │   └── theme.ts              # Design system colors, spacing, and font tokens
│   ├── context/
│   │   └── ExpenseContext.tsx    # Global state management and AsyncStorage sync
│   ├── data/
│   │   └── demoData.ts           # Initial sample transactions and budgets
│   └── types/
│       └── expense.ts            # TypeScript interfaces and category definitions
├── app.json                      # Expo project configuration
├── package.json                  # Dependencies & run scripts
└── tsconfig.json                 # TypeScript strict compiler config
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd manage-expenses
npm install
```

### 2. Run the App

- **Run in Web Browser**:
  ```bash
  npm run web
  ```

- **Run on Android**:
  ```bash
  npm run android
  ```

- **Run on iOS** *(macOS required)*:
  ```bash
  npm run ios
  ```

- **Start Expo Metro Bundler**:
  ```bash
  npx expo start
  ```
