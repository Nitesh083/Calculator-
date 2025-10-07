from django.db import models

class Scenario(models.Model):
    # --- User Inputs (9 fields) ---
    scenario_name = models.CharField(max_length=100)
    monthly_invoice_volume = models.IntegerField()
    num_ap_staff = models.IntegerField()
    avg_hours_per_invoice = models.FloatField()
    hourly_wage = models.FloatField()
    error_rate_manual = models.FloatField()
    error_cost = models.FloatField()
    time_horizon_months = models.IntegerField()
    one_time_implementation_cost = models.IntegerField(default=0)
    
    # --- Calculated Results ---
    monthly_savings = models.FloatField()
    payback_months = models.FloatField()
    roi_percentage = models.FloatField()

    # --- Lead Capture (Gated Report) ---
    email = models.EmailField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.scenario_name