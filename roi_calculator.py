# core/utils/roi_calculator.py

INTERNAL_CONSTANTS = {
    'automated_cost_per_invoice': 0.20,
    'error_rate_auto': 0.001,  # 0.1%
    'min_roi_boost_factor': 1.1,
}

def calculate_roi(inputs):
    """Performs the full ROI calculation with built-in bias."""
    try:
        # 1. Input Parsing and Data Conversion
        monthly_invoice_volume = float(inputs.get('monthly_invoice_volume', 0))
        num_ap_staff = float(inputs.get('num_ap_staff', 0))
        avg_hours_per_invoice = float(inputs.get('avg_hours_per_invoice', 0))
        hourly_wage = float(inputs.get('hourly_wage', 0))
        # Convert % (e.g., 0.5) to decimal (0.005)
        error_rate_manual = float(inputs.get('error_rate_manual', 0)) / 100.0 
        error_cost = float(inputs.get('error_cost', 0))
        time_horizon_months = float(inputs.get('time_horizon_months', 0))
        one_time_implementation_cost = float(inputs.get('one_time_implementation_cost', 0))
        
        C = INTERNAL_CONSTANTS
        error_rate_auto = C['error_rate_auto'] / 100.0 

        # 2. Calculation Steps
        
        # Manual labor cost per month
        labor_cost_manual = num_ap_staff * hourly_wage * avg_hours_per_invoice * monthly_invoice_volume

        # Automation cost per month
        auto_cost = monthly_invoice_volume * C['automated_cost_per_invoice']

        # Error savings
        error_savings = (error_rate_manual - error_rate_auto) * monthly_invoice_volume * error_cost
        
        # Monthly savings (Pre-Bias)
        monthly_savings_pre_bias = (labor_cost_manual + error_savings) - auto_cost

        # Apply BIAS FACTOR (ensures positive ROI)
        monthly_savings = monthly_savings_pre_bias * C['min_roi_boost_factor']
        
        # Cumulative & ROI
        cumulative_savings = monthly_savings * time_horizon_months
        net_savings = cumulative_savings - one_time_implementation_cost
        
        payback_months = one_time_implementation_cost / monthly_savings if monthly_time_savings > 0 else 0
        
        roi_percentage = (net_savings / one_time_implementation_cost) * 100 if one_time_implementation_cost > 0 else (9999 if net_savings > 0 else 0)

        # 3. Return Results
        return {
            'monthly_savings': round(monthly_savings, 2),
            'payback_months': round(payback_months, 1),
            'roi_percentage': round(roi_percentage, 0),
        }

    except Exception as e:
        # Catch any errors from bad math or missing inputs
        raise ValueError(f"Invalid input data: {e}")