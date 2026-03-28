# Monte Carlo Options Pricing Simulator

A premium, interactive web application that calculates European options prices using **Monte Carlo simulations** of **Geometric Brownian Motion (GBM)**.

![Simulation Demo](https://raw.githubusercontent.com/iamujjawal23/monte-carlo-options/main/public/demo.png "Placeholder if we add an image later")

🚀 **Live Deployment:** [https://iamujjawal23.github.io/monte-carlo-options/](https://iamujjawal23.github.io/monte-carlo-options/)

## Features Let’s You
- **Visualize the Random Walks**: The application vividly demonstrates terminal share prices across $10,000+$ trajectories.
- **Adjust Simulation Parameters**: Modify your Spot Price ($S_0$), Strike Price ($K$), Risk-Free Rate ($r$), Volatility ($\sigma$), and Time to Maturity ($T$) effortlessly.
- **Accurate Benchmarking**: The application features a native mathematical algorithm calculating **Black-Scholes theoretical value** directly in the browser to cross-verify the stochastic approximation precisely.

## The Math Behind It
The simulation constructs $n$ individual sample paths of the stock price up to time $T$, using the discrete-time approximation of Geometric Brownian Motion:
$S(t) = S(t-1) \cdot \exp\left(\left(r - \frac{1}{2}\sigma^2\right)dt + \sigma\sqrt{dt} \cdot Z\right)$
where $Z$ is a random variable sampled from a Standard Normal Distribution via the **Box-Muller transform**. Results are averaged and discounted dynamically.

## Installation for Local Development

1. Check out the repository:
```bash
git clone https://github.com/iamujjawal23/monte-carlo-options.git
```
2. Navigate into the folder:
```bash
cd monte-carlo-options
```
3. Install dependencies:
```bash
npm install
```
4. Run the application:
```bash
npm run dev
```

## Deployment Updates
To deploy updates to Github Pages:
```bash
npm run deploy
```

---
*Built intricately with Vite, React, Chart.js, and pure CSS Glassmorphism logic.*
