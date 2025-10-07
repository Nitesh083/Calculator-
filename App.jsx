// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import './App.css'; // Add basic styling for layout

const INITIAL_INPUTS = {
  scenario_name: 'New Scenario',
  monthly_invoice_volume: 2000,
  num_ap_staff: 3,
  avg_hours_per_invoice: 0.17,
  hourly_wage: 30,
  error_rate_manual: 0.5, // %
  error_cost: 100,
  time_horizon_months: 36,
  one_time_implementation_cost: 50000,
};

function App() {
  const [inputs, setInputs] = useState(INITIAL_INPUTS);
  const [results, setResults] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportEmail, setReportEmail] = useState('');

  // --- API Call Functions ---
  
  const runSimulation = async (currentInputs) => {
    setError(null);
    try {
      // Use /api/ due to Vite proxy
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentInputs),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Simulation failed.');
      }
      
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
      setResults(null);
    }
  };

  const fetchScenarios = async () => {
    try {
      const response = await fetch('/api/scenarios');
      if (response.ok) {
        const data = await response.json();
        setScenarios(data);
      }
    } catch (err) {
      console.error("Failed to load scenarios:", err);
    }
  };

  const loadScenario = async (id) => {
    try {
      const response = await fetch(`/api/scenarios/${id}`);
      if (response.ok) {
        const data = await response.json();
        // Separate inputs from results to update state
        const loadedInputs = {};
        for (const key in INITIAL_INPUTS) {
            loadedInputs[key] = data[key] || INITIAL_INPUTS[key];
        }
        setInputs(loadedInputs);
        setResults({
            monthly_savings: data.monthly_savings,
            payback_months: data.payback_months,
            roi_percentage: data.roi_percentage,
        });
      }
    } catch (err) {
      setError("Failed to load scenario.");
    }
  };

  const saveScenario = async () => {
    try {
      const payload = { ...inputs, ...results };
      const response = await fetch('/api/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        alert(`Scenario '${inputs.scenario_name}' saved successfully!`);
        fetchScenarios(); // Refresh list
      } else {
        throw new Error('Failed to save scenario.');
      }
    } catch (err) {
      setError(err.message);
    }
  };
  
  const handleReportGate = async (e) => {
      e.preventDefault();
      try {
          const payload = { ...inputs, ...results, email: reportEmail };
          const response = await fetch('/api/report/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          if (response.ok) {
              setIsModalOpen(false);
              alert("Report generated! Check your print dialogue.");
              // Fulfills the downloadable report requirement via browser print
              window.print(); 
          } else {
              throw new Error('Failed to capture lead.');
          }
      } catch (err) {
          setError(err.message);
      }
  };

  // --- UI Handlers ---
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number' ? parseFloat(value) : value;
    
    // Update state
    setInputs(prev => ({
      ...prev,
      [name]: newValue, 
    }));
    
    // Live simulation: run calculation on every change after a short delay
    // This is optional but good UX for "live results"
    // runSimulation({ ...inputs, [name]: newValue }); 
  };
  
  // Initial load and scenario list fetch
  useEffect(() => {
    runSimulation(INITIAL_INPUTS);
    fetchScenarios();
  }, []); 

  // --- Rendering Functions (Simplified for brevity) ---
  const renderInput = (name, label, type = 'number') => (
      <div key={name} className="form-group">
          <label htmlFor={name}>{label}</label>
          <input
              type={type}
              id={name}
              name={name}
              value={inputs[name]}
              onChange={handleChange}
              // Add required/placeholder attributes for better UX
              required
          />
      </div>
  );

  return (
    <div className="container">
      <h1>Invoicing ROI Simulator 💰</h1>
      {error && <p className="error-message">Error: {error}</p>}

      <div className="main-layout">
        
        {/* Input Panel (Form) */}
        <div className="panel input-panel">
          <h2>1. Business Inputs</h2>
          <form onSubmit={(e) => { e.preventDefault(); runSimulation(inputs); }}>
            {renderInput('scenario_name', 'Scenario Name', 'text')}
            {renderInput('monthly_invoice_volume', 'Monthly Invoice Volume')}
            {renderInput('num_ap_staff', 'AP Staff Managing Invoicing')}
            {renderInput('avg_hours_per_invoice', 'Avg Manual Hours/Invoice')}
            {renderInput('hourly_wage', 'Avg Hourly Wage ($)')}
            {renderInput('error_rate_manual', 'Manual Error Rate (%)')}
            {renderInput('error_cost', 'Cost to Fix Each Error ($)')}
            {renderInput('time_horizon_months', 'Projection Period (Months)')}
            {renderInput('one_time_implementation_cost', 'One-time Implementation Cost ($)')}
            
            <button type="submit" className="button-primary">Run Simulation</button>
            <button type="button" onClick={saveScenario} className="button-secondary">Save Scenario</button>
          </form>
        </div>

        {/* Results & Report Panel */}
        <div className="panel results-panel">
          <h2>2. Estimated Results</h2>
          {results ? (
            <div className="metrics-grid">
              <div className="metric-card">
                <h3>Monthly Savings</h3>
                <p className="value">${results.monthly_savings.toLocaleString()}</p>
              </div>
              <div className="metric-card">
                <h3>Payback Period</h3>
                <p className="value">{results.payback_months} Months</p>
              </div>
              <div className="metric-card">
                <h3>Total ROI ({inputs.time_horizon_months} mos)</h3>
                <p className="value">{results.roi_percentage}%</p>
              </div>
            </div>
          ) : (
            <p className="placeholder-text">Enter valid inputs to calculate savings.</p>
          )}

          <button onClick={() => setIsModalOpen(true)} className="button-report">
            Download Gated Report 
          </button>
        </div>

        {/* Scenario Management Panel */}
        <div className="panel scenario-manager-panel">
          <h2>3. Saved Scenarios</h2>
          <ul>
            {scenarios.length > 0 ? scenarios.map(s => (
              <li key={s.id} onClick={() => loadScenario(s.id)}>
                {s.scenario_name} - ROI: {s.roi_percentage}%
              </li>
            )) : <li>No scenarios saved.</li>}
          </ul>
        </div>
      </div>
      
      {/* Modal for Gated Report */}
      {isModalOpen && (
          <div className="modal-backdrop">
              <div className="modal-content">
                  <h3>Get Your Custom Report</h3>
                  <p>Enter your email to download the detailed analysis.</p>
                  <form onSubmit={handleReportGate}>
                      <input 
                          type="email" 
                          placeholder="Your Email Address" 
                          value={reportEmail} 
                          onChange={(e) => setReportEmail(e.target.value)} 
                          required 
                      />
                      <button type="submit" className="button-primary">Generate & Download</button>
                      <button type="button" onClick={() => setIsModalOpen(false)} className="button-secondary">Cancel</button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}

export default App;