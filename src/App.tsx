import { useState, useEffect, useRef } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { PlayCircle, Loader2 } from 'lucide-react';
import { monteCarloSimulation, blackScholes, SimulationResult } from './math';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [S, setS] = useState(100);
  const [K, setK] = useState(100);
  const [T, setT] = useState(1);
  const [r, setR] = useState(0.05);
  const [sigma, setSigma] = useState(0.2);
  const [numSimulations, setNumSimulations] = useState(10000);
  const [numSteps, setNumSteps] = useState(252);
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [bsCall, setBsCall] = useState<number>(0);
  const [bsPut, setBsPut] = useState<number>(0);

  const runSimulation = () => {
    setIsSimulating(true);
    
    // We use setTimeout to allow UI to render the loading state
    setTimeout(() => {
      const t0 = performance.now();
      const res = monteCarloSimulation(S, K, T, r, sigma, numSimulations, numSteps, 50);
      const bsC = blackScholes('call', S, K, T, r, sigma);
      const bsP = blackScholes('put', S, K, T, r, sigma);
      const t1 = performance.now();
      
      console.log(`Simulation took ${t1 - t0} milliseconds.`);
      setResult(res);
      setBsCall(bsC);
      setBsPut(bsP);
      setIsSimulating(false);
    }, 50);
  };

  // Run initial simulation on load
  useEffect(() => {
    runSimulation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  };

  const calculateError = (mc: number, bs: number) => {
    if (bs === 0) return 0;
    return ((mc - bs) / bs) * 100;
  };

  const chartData = {
    labels: Array.from({ length: numSteps + 1 }, (_, i) => (i * (T / numSteps)).toFixed(2)),
    datasets: result?.samplePaths.map((path, idx) => ({
      label: `Path ${idx + 1}`,
      data: Array.from(path),
      borderColor: `hsla(${(idx * 137.5) % 360}, 70%, 60%, 0.4)`, // Golden ratio distribution for distinct colors
      borderWidth: 1,
      pointRadius: 0,
      fill: false,
      tension: 0.1
    })) || []
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Monte Carlo Sample Paths (Geometric Brownian Motion)',
        color: '#e2e8f0',
        font: { size: 16, family: 'Inter' }
      },
      tooltip: {
        enabled: false
      }
    },
    scales: {
      x: {
        title: { display: true, text: 'Time (Years)', color: '#94a3b8' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8' }
      },
      y: {
        title: { display: true, text: 'Asset Price ($)', color: '#94a3b8' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8' }
      }
    },
    animation: {
      duration: 500
    }
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1>Monte Carlo Simulator</h1>
        <p>Quantitative Option Pricing via Geometric Brownian Motion</p>
      </div>

      <div className="main-grid">
        {/* Controls Panel */}
        <div className="glass-panel">
          <h2 style={{ marginBottom: '1.5rem', color: '#e2e8f0', fontSize: '1.25rem' }}>Parameters</h2>
          
          <div className="form-group">
            <label>Spot Price ($S_0$)</label>
            <input type="number" step="1" className="form-control" value={S} onChange={e => setS(Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label>Strike Price ($K$)</label>
            <input type="number" step="1" className="form-control" value={K} onChange={e => setK(Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label>Time to Maturity ($T$ in years)</label>
            <input type="number" step="0.1" className="form-control" value={T} onChange={e => setT(Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label>Risk-Free Rate ($r$)</label>
            <input type="number" step="0.01" className="form-control" value={r} onChange={e => setR(Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label>Volatility ($\sigma$)</label>
            <input type="number" step="0.01" className="form-control" value={sigma} onChange={e => setSigma(Number(e.target.value))} />
          </div>
          
          <hr style={{ borderColor: 'var(--panel-border)', margin: '1.5rem 0' }} />
          
          <div className="form-group">
            <label>Simulation Paths ($N$)</label>
            <input type="number" step="1000" min="1000" className="form-control" value={numSimulations} onChange={e => setNumSimulations(Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label>Time Steps</label>
            <input type="number" step="10" className="form-control" value={numSteps} onChange={e => setNumSteps(Number(e.target.value))} />
          </div>

          <button className="btn-primary" onClick={runSimulation} disabled={isSimulating}>
            {isSimulating ? <Loader2 className="spinner" size={24} /> : <PlayCircle size={24} />}
            {isSimulating ? 'Simulating Paths...' : 'Run Simulation'}
          </button>
        </div>

        {/* Results and Visualizations */}
        <div className="results-container">
          <div className="results-grid">
            {/* Call Option Results */}
            <div className="result-card">
              <h3>Call Option Price</h3>
              {result ? (
                <>
                  <div className="result-value">{formatPrice(result.callPrice)}</div>
                  <div className="bs-comparison">
                    <div>Black-Scholes: {formatPrice(bsCall)}</div>
                    <div className={`error-val ${calculateError(result.callPrice, bsCall) >= 0 ? 'positive' : 'negative'}`}>
                      Diff: {calculateError(result.callPrice, bsCall).toFixed(3)}%
                    </div>
                  </div>
                </>
              ) : (
                <div className="result-value">---</div>
              )}
            </div>

            {/* Put Option Results */}
            <div className="result-card">
              <h3>Put Option Price</h3>
              {result ? (
                <>
                  <div className="result-value">{formatPrice(result.putPrice)}</div>
                  <div className="bs-comparison">
                    <div>Black-Scholes: {formatPrice(bsPut)}</div>
                    <div className={`error-val ${calculateError(result.putPrice, bsPut) >= 0 ? 'positive' : 'negative'}`}>
                      Diff: {calculateError(result.putPrice, bsPut).toFixed(3)}%
                    </div>
                  </div>
                </>
              ) : (
                <div className="result-value">---</div>
              )}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1rem' }}>
            <div className="chart-container">
              {result && chartData.datasets.length > 0 && (
                <Line data={chartData} options={chartOptions} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
