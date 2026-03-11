# Algo Scope — Code Complexity Analyzer

A production-ready web application that lets users paste code and instantly analyze **Time Complexity** and **Space Complexity** with visual explanations and animated graphs. Built for students preparing for DSA interviews.

## Features

- **Monaco Editor** — Full VSCode editing experience with syntax highlighting, dark mode, and multi-language support
- **Static Code Analysis** — AST-based parsing for JavaScript, regex-based patterns for C++, Java, Python, Go, Rust
- **Complexity Detection** — Identifies O(1), O(log n), O(n), O(n log n), O(n^2), O(n^3), O(2^n), O(n!)
- **Visual Graphs** — Animated growth curves, complexity comparisons, and simulation tables via Recharts
- **Case Analysis** — Best, average, and worst case breakdowns
- **Code Breakdown** — Step-by-step explanation of which lines drive complexity
- **Optimization Suggestions** — Actionable tips to improve algorithm efficiency
- **Dark/Light Theme** — Smooth theme switching with system preference support
- **Animated UI** — Framer Motion animations throughout, inspired by Linear/Vercel design language

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript, TailwindCSS |
| Editor | Monaco Editor (@monaco-editor/react) |
| Animations | Framer Motion |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Node.js, Express |
| Parsing | Acorn (JS AST), regex patterns (other languages) |

## Project Structure

```
Algo-Scope/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx          # Root layout with theme provider
│   │   │   ├── page.tsx            # Main page (editor + results)
│   │   │   └── globals.css         # Global styles + CSS variables
│   │   ├── components/
│   │   │   ├── Navbar.tsx          # Top navigation bar
│   │   │   ├── ThemeProvider.tsx   # Dark/light theme context
│   │   │   ├── LanguageSelector.tsx # Language dropdown
│   │   │   ├── CodeEditor.tsx      # Monaco Editor wrapper
│   │   │   ├── ResultPanel.tsx     # Complexity results display
│   │   │   ├── ComplexityGraph.tsx # Charts (growth, comparison, simulation)
│   │   │   └── AnalysisLoader.tsx  # Loading animation
│   │   └── lib/
│   │       └── types.ts           # TypeScript interfaces
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── next.config.js
│
├── backend/
│   ├── src/
│   │   ├── index.js               # Express server entry point
│   │   ├── routes/
│   │   │   └── analyze.js         # POST /api/analyze endpoint
│   │   ├── analyzer/
│   │   │   └── index.js           # Orchestrates parsing + analysis
│   │   ├── ast_parser/
│   │   │   └── index.js           # AST parsing (Acorn for JS, regex for others)
│   │   └── complexity_engine/
│   │       └── index.js           # Complexity determination + graph data
│   └── package.json
│
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Node.js >= 18
- npm

### Installation

```bash
# Clone the repo
git clone <your-repo-url>
cd Algo-Scope

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running Locally

Open **two terminals**:

**Terminal 1 — Backend** (port 3001):
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend** (port 3000):
```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

**Frontend** (`frontend/.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Backend** (`backend/.env`):
```
PORT=3001
FRONTEND_URL=http://localhost:3000
```

## API Reference

### POST `/api/analyze`

Analyzes code and returns complexity metrics.

**Request:**
```json
{
  "language": "javascript",
  "code": "function example(n) { for (let i=0; i<n; i++) { ... } }"
}
```

**Response:**
```json
{
  "time_complexity": "O(n²)",
  "time_label": "Quadratic",
  "space_complexity": "O(1)",
  "space_label": "Constant",
  "loop_depth": 2,
  "recursion": false,
  "explanation": "This algorithm contains two nested loops...",
  "graph_points": [{ "n": 10, "operations": 100 }, ...],
  "comparison_data": [...],
  "simulation_table": [...],
  "suggestions": [{ "title": "Use a Hash Map", "description": "...", "impact": "O(n²) → O(n)" }],
  "step_by_step": [{ "step": 1, "line": 3, "description": "...", "complexity": "O(n)" }],
  "highlight_lines": [3, 4],
  "cases": {
    "best": { "notation": "O(n²)", "description": "All iterations execute" },
    "average": { "notation": "O(n²)", "description": "All iterations execute" },
    "worst": { "notation": "O(n²)", "description": "All iterations execute" }
  }
}
```

**Supported languages:** `cpp`, `java`, `python`, `javascript`, `go`, `rust`

## Deployment

### Frontend — Vercel

```bash
cd frontend
npx vercel
```

Set the environment variable `NEXT_PUBLIC_API_URL` to your deployed backend URL.

### Backend — Railway or Render

1. Push the `backend/` directory to a Git repo
2. Connect to Railway/Render
3. Set `PORT=3001` and `FRONTEND_URL=https://your-frontend.vercel.app`
4. Deploy

## Supported Complexity Patterns

| Pattern | Detection Method | Example |
|---------|-----------------|---------|
| Nested loops | AST depth tracking | `for(for(...))` |
| Binary search | Loop halving patterns | `mid = (low+high)/2` |
| Divide & conquer | Recursion + halving | Merge sort |
| Exponential recursion | Multiple recursive calls | Fibonacci |
| Sorting | API call detection | `.sort()`, `Arrays.sort()` |
| Hash map usage | Data structure detection | `new Map()`, `unordered_map` |

## Limitations

- Analysis is heuristic-based (static analysis, not runtime profiling)
- Complex algorithms with multiple branches may not be fully captured
- Amortized complexity is not currently distinguished from worst-case
- Dynamic programming pattern detection is limited to memoization suggestions
# algo-scope
