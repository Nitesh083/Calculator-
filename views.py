# backend/core/views.py
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
from .models import Scenario 
from .utils.roi_calculator import calculate_roi 

def load_json(request):
    try:
        return json.loads(request.body)
    except:
        return {}

# --- 1. POST /simulate ---
@csrf_exempt
def simulate(request):
    if request.method == 'POST':
        inputs = load_json(request)
        try:
            results = calculate_roi(inputs)
            return JsonResponse(results)
        except ValueError as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Only POST method allowed'}, status=405)


# --- 2. POST, GET, GET(id) /scenarios ---
@csrf_exempt
def scenarios(request, scenario_id=None):
    if request.method == 'GET' and scenario_id is None:
        scenarios_list = list(Scenario.objects.all().values('id', 'scenario_name', 'monthly_savings', 'roi_percentage', 'created_at'))
        return JsonResponse(scenarios_list, safe=False)

    elif request.method == 'POST':
        inputs = load_json(request)
        try:
            results = calculate_roi(inputs)
            scenario_data = {**inputs, **results}
            Scenario.objects.create(**scenario_data)
            return JsonResponse({'message': 'Scenario saved'}, status=201)
        except Exception as e:
            return JsonResponse({'error': f'Failed to save scenario: {e}'}, status=400)

    elif request.method == 'GET' and scenario_id is not None:
        try:
            scenario = Scenario.objects.get(id=scenario_id)
            data = {f.name: getattr(scenario, f.name) for f in Scenario._meta.fields}
            return JsonResponse(data)
        except Scenario.DoesNotExist:
            return JsonResponse({'error': 'Scenario not found'}, status=404)
        
    return JsonResponse({'error': 'Method not allowed'}, status=405)


# --- 3. POST /report/generate (Lead Capture) ---
@csrf_exempt
def generate_report(request):
    if request.method == 'POST':
        inputs = load_json(request)
        email = inputs.get('email')
        
        if not email:
             return JsonResponse({'error': 'Email is required for lead capture'}, status=400)

        try:
            results = calculate_roi(inputs)
            
            scenario_data = {**inputs, **results, 'email': email}
            Scenario.objects.create(**scenario_data)

            return JsonResponse({'message': 'Lead captured. Report ready.'}, status=200)

        except Exception as e:
            return JsonResponse({'error': 'Report failed'}, status=400)
    return JsonResponse({'error': 'Only POST method allowed'}, status=405)