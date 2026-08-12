# Monte Carlo Options Pricing Simulator

A lightweight, interactive web application that estimates European option prices using Monte Carlo simulations of Geometric Brownian Motion (GBM). Built with React + Vite and visualized using Chart.js.

Live demo: https://iamujjawal23.github.io/monte-carlo-options/

---

## Features
- Simulate many price paths using GBM and visualize sample paths.
- Estimate call and put option prices with standard error estimates.
- Compare Monte Carlo results with the Black–Scholes analytical formula.
- Browser-first UI with adjustable parameters (spot, strike, volatility, steps, simulations).
- Deploys to GitHub Pages via `gh-pages`.

---

## Quick start (local)
Requirements: Node.js 18+ and npm

1. Clone:
   ```bash
   git clone https://github.com/iamujjawal23/monte-carlo-options.git
   cd monte-carlo-options
   ```

2. Install:
   ```bash
   npm install
   ```

3. Run development server:
   ```bash
   npm run dev
   ```
   Then open http://localhost:5173

4. Build for production:
   ```bash
   npm run build
   ```

5. Deploy to GitHub Pages:
   ```bash
   npm run deploy
   ```
   (deployment uses `gh-pages -d dist`, see `package.json`)

---

## Scripts
- `npm run dev` — start Vite dev server
- `npm run build` — build production bundle
- `npm run preview` — preview production build locally
- `npm run lint` — run ESLint
- `npm run deploy` — build and publish `dist` to GitHub Pages

---

## How it works (implementation notes)
- Simulation logic lives in `src/math.ts`.
  - `monteCarloSimulation(...)` performs the path simulation and returns:
    - `callPrice`, `putPrice`, `callStdError`, `putStdError`, and a `samplePaths` array for visualization.
  - Black–Scholes pricing uses `blackScholes(...)` for comparison.
  - Normal variates are generated with a Box–Muller transform in `generateNormalValues(...)`.
- UI & visualization live in `src/App.tsx` and use Chart.js (`react-chartjs-2`) to render sample paths and results.

---

## Important usage & performance notes
- Default parameters in the UI are aggressive for a browser:
  - `numSimulations` default = 10,000
  - `numSteps` default = 252
  - Rendering many sample paths or very large `numSimulations` can freeze or severely slow the page on low-end devices.
- Recommendations:
  - For interactive use, try smaller values first (e.g., 1,000 sims, 100 steps).
  - Use fewer sample paths to render (the app already limits plotting to a subset by default).
  - Consider running heavy simulations in a Web Worker or server-side to avoid blocking the main thread.
  - Consider using an optimized random number generator or GPU/off-thread implementations for large-scale simulations.

---

## Known edge cases and safeguards
- Black–Scholes denominator:
  - If `sigma === 0` or `T === 0` the current formula divides by zero; handle these inputs explicitly (e.g., return intrinsic price or guard inputs).
- RNG corner case:
  - Box–Muller should guard against `u1 === 0` (Math.random() may return 0). Implement a small epsilon or loop until `u1 > 0`.
- Small sample size:
  - Variance calculation divides by `numSimulations - 1`; ensure `numSimulations >= 2` before computing variance/std error.

---

## Suggestions for improvement
- Move heavy computations off the main thread (Web Worker) to keep UI responsive.
- Add input validation and UI bounds checks (min/max values for `numSimulations`, `numSteps`, sigma, T, etc.).
- Add unit tests for numeric routines (`standardNormalCDF`, `blackScholes`, and `monteCarloSimulation`) to ensure stability.
- Add a `--seed` option or deterministic RNG for reproducible results (use a PRNG instead of Math.random).
- Add GitHub Actions to run linting and tests on PRs.

---

## Contributing
Contributions are welcome — open issues or PRs. If you send a PR, please:
- Run `npm run lint` and fix warnings.
- Keep changes small and include tests for numeric functions when possible.

---

## License
This project currently has no license file. If you want others to reuse or contribute easily, add a license (MIT is a common choice for demo projects).

---

## Contact
Created by Ujjawal — https://github.com/iamujjawal23
