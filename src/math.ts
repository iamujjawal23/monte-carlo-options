export function standardNormalCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2.0);
  
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  
  return 0.5 * (1.0 + sign * y);
}

export function blackScholes(type: 'call' | 'put', S: number, K: number, T: number, r: number, sigma: number): number {
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  
  if (type === 'call') {
    return S * standardNormalCDF(d1) - K * Math.exp(-r * T) * standardNormalCDF(d2);
  } else {
    return K * Math.exp(-r * T) * standardNormalCDF(-d2) - S * standardNormalCDF(-d1);
  }
}

// Box-Muller transform to generate standard normal random variables
export function generateNormalValues(count: number): Float64Array {
  const result = new Float64Array(count);
  for (let i = 0; i < count; i += 2) {
    const u1 = Math.random();
    const u2 = Math.random();
    const radius = Math.sqrt(-2.0 * Math.log(u1));
    const angle = 2.0 * Math.PI * u2;
    result[i] = radius * Math.cos(angle);
    if (i + 1 < count) {
      result[i + 1] = radius * Math.sin(angle);
    }
  }
  return result;
}

export interface SimulationResult {
  callPrice: number;
  putPrice: number;
  callStdError?: number;
  putStdError?: number;
  samplePaths: Float64Array[]; // A subset of paths for visualization
}

export function monteCarloSimulation(
  S: number,
  K: number,
  T: number,
  r: number,
  sigma: number,
  numSimulations: number,
  numSteps: number,
  numSamplePaths: number = 50
): SimulationResult {
  const dt = T / numSteps;
  const drift = (r - 0.5 * sigma * sigma) * dt;
  const vol = sigma * Math.sqrt(dt);
  const discountFactor = Math.exp(-r * T);

  let callSum = 0;
  let putSum = 0;
  let callSumSq = 0;
  let putSumSq = 0;

  const samplePaths: Float64Array[] = [];

  for (let i = 0; i < numSimulations; i++) {
    let currentS = S;
    const path = new Float64Array(numSteps + 1);
    path[0] = S;

    const normals = generateNormalValues(numSteps);
    for (let j = 0; j < numSteps; j++) {
      currentS = currentS * Math.exp(drift + vol * normals[j]);
      path[j + 1] = currentS;
    }

    if (i < numSamplePaths) {
      samplePaths.push(path);
    }

    const callPayoff = Math.max(currentS - K, 0);
    const putPayoff = Math.max(K - currentS, 0);

    const discountedCall = callPayoff * discountFactor;
    const discountedPut = putPayoff * discountFactor;

    callSum += discountedCall;
    putSum += discountedPut;
    callSumSq += discountedCall * discountedCall;
    putSumSq += discountedPut * discountedPut;
  }

  const callPrice = callSum / numSimulations;
  const putPrice = putSum / numSimulations;
  
  const callVariance = (callSumSq - callSum * callSum / numSimulations) / (numSimulations - 1);
  const putVariance = (putSumSq - putSum * putSum / numSimulations) / (numSimulations - 1);

  return {
    callPrice,
    putPrice,
    callStdError: Math.sqrt(callVariance) / Math.sqrt(numSimulations),
    putStdError: Math.sqrt(putVariance) / Math.sqrt(numSimulations),
    samplePaths
  };
}
