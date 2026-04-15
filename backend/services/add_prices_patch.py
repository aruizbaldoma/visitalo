import re

# Leer el archivo
with open('itinerary_service.py', 'r') as f:
    content = f.read()

# Añadir precios y IDs a actividades que no los tienen
patterns = [
    # Afternoon activities
    (r'("time": "14:00",\s+"title": "Almuerzo",.*?"duration": "1\.5h")', r'\1,\n                        "price": 28.00,\n                        "activityId": "act_lunch",\n                        "provider": "GetYourGuide"'),
    (r'("time": "16:00",\s+"title": "Museo o atracción principal",.*?"duration": "2h")', r'\1,\n                        "price": 18.00,\n                        "activityId": "act_museum",\n                        "provider": "Civitatis"'),
    (r'("time": "18:30",\s+"title": "Paseo al atardecer",.*?"duration": "1\.5h")', r'\1,\n                        "price": 12.00,\n                        "activityId": "act_sunset",\n                        "provider": "Viator"'),
    # Night activities  
    (r'("time": "20:00",\s+"title": "Cena local",.*?"duration": "2h")\s+\}', r'\1,\n                        "price": 35.00,\n                        "activityId": "act_dinner",\n                        "provider": "GetYourGuide"\n                    }'),
    (r'("time": "20:00",\s+"title": "Cena de despedida",.*?"duration": "2h")\s+\}', r'\1,\n                        "price": 42.00,\n                        "activityId": "act_farewell",\n                        "provider": "Civitatis"\n                    }'),
    (r'("time": "22:30",\s+"title": "Vida nocturna",.*?"duration": "2h")\s+\}', r'\1,\n                        "price": 20.00,\n                        "activityId": "act_nightlife",\n                        "provider": "Viator"\n                    }'),
]

for pattern, replacement in patterns:
    content = re.sub(pattern, replacement, content, flags=re.DOTALL)

# Guardar
with open('itinerary_service.py', 'w') as f:
    f.write(content)

print("✅ Precios añadidos")
