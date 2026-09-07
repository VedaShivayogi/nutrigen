from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from dotenv import load_dotenv

load_dotenv()

model = ChatGoogleGenerativeAI(model="gemini-flash-latest")

def generate_meal_plan(name, age, gender, height, weight, diet_preference, goal, activity_level, allergies):
    prompt = f"""
You are a certified AI nutritionist.

Your task is to create a personalized 7-day meal plan (Sunday to Saturday) for a single person based on the following input:

- Name: {name}
- Age: {age}
- Gender: {gender}
- Height: {height} cm
- Weight: {weight} kg
- Diet Preference: {diet_preference}
- Goal: {goal}
- Activity Level: {activity_level}
- Allergies: {allergies}
- Calories: Calculate the ideal daily calorie intake using this logic: 
   - **Base Calories (BMR estimate)**:
     - Male: `10 × {weight} + 6.25 × {height} - 5 × {age} + 5`
     - Female: `10 × {weight} + 6.25 × {height} - 5 × {age} - 161`
   - **Activity Factor**:
     - Sedentary: ×1.2
     - Lightly Active: ×1.375
     - Moderately Active: ×1.55
     - Very Active: ×1.725
   - **Goal Adjustment**:
     - Weight Loss: subtract 500 kcal
     - Muscle Gain: add 500 kcal
     - Maintenance: no change

Each day must include 4 meals:
- Breakfast
- Lunch
- Dinner
- Snack

Each meal must contain:
- name: Name of the dish (string)
- ingredients: Comma-separated list of ingredients (string)
- portionSize: e.g., 1 bowl, 2 roti, 1 cup (string)
- calories: kcal (number)
- protein: grams (number)
- carbs: grams (number)
- fat: grams (number)

 RULES:
- All meals must be varied across the week — no repetition
- Meals must strictly follow diet preference and avoid allergic ingredients
- Caloric and macronutrient distribution must align with the user’s goal and activity level

 GOAL:
Return the result in pure JSON. No introductions, comments, markdown, or text outside the JSON.

 STRICT JSON STRUCTURE (required):
{{
  "mealPlan": {{
    "Sunday": {{
      "Breakfast": {{
        "name": "",
        "ingredients": "",
        "portionSize": "",
        "calories": 0,
        "protein": 0,
        "carbs": 0,
        "fat": 0
      }},
      "Lunch": {{ ... }},
      "Dinner": {{ ... }},
      "Snack": {{ ... }}
    }},
    "Monday": {{ ... }},
    ...
    "Saturday": {{
      "Breakfast": {{ ... }},
      "Lunch": {{ ... }},
      "Dinner": {{ ... }},
      "Snack": {{ ... }}
    }}
  }}
}}

 DO NOT:
- Include markdown
- Include explanations
- Mention that you are an AI
- Deviate from the format

This JSON will be stored in a Firebase database and shown in a personal meal planning app. Ensure accuracy, clarity, and consistency in formatting.
"""

    try:
        messages = [SystemMessage(content="You are a nutrition assistant."), HumanMessage(content=prompt)]
        result = model.invoke(messages)
        response = result.content.strip()
        if response.startswith("```json"):
            response = response[len("```json"):].strip()
        if response.endswith("```"):
            response = response[:-len("```")].strip()
        return response
    except Exception as e:
        print(f"=== Meal plan generation error: {e}. Generating local fallback meal plan. ===")
        import json
        is_veg = any(x in str(diet_preference).lower() for x in ["veg", "vegan"])
        
        days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        meal_plan = {}
        for day in days:
            meal_plan[day] = {
                "Breakfast": {
                    "name": "Oatmeal with Almonds & Banana" if is_veg else "Scrambled Eggs with Avocado Toast",
                    "ingredients": "Rolled oats, almond milk, banana, almonds, honey" if is_veg else "Eggs, whole wheat bread, avocado, butter, cherry tomatoes",
                    "portionSize": "1 bowl" if is_veg else "2 eggs & 1 toast",
                    "calories": 350,
                    "protein": 12 if is_veg else 18,
                    "carbs": 55 if is_veg else 24,
                    "fat": 10 if is_veg else 16
                },
                "Lunch": {
                    "name": "Quinoa Salad with Chickpeas" if is_veg else "Grilled Chicken breast with Quinoa",
                    "ingredients": "Quinoa, chickpeas, cucumber, olive oil, lemon juice" if is_veg else "Chicken breast, quinoa, olive oil, broccoli",
                    "portionSize": "1 plate",
                    "calories": 450,
                    "protein": 15 if is_veg else 35,
                    "carbs": 60 if is_veg else 45,
                    "fat": 14 if is_veg else 12
                },
                "Snack": {
                    "name": "Mixed Nuts and Apple Slice" if is_veg else "Greek Yogurt with Berries",
                    "ingredients": "Almonds, walnuts, apple" if is_veg else "Greek yogurt, honey, blueberries",
                    "portionSize": "1 handful" if is_veg else "1 cup",
                    "calories": 200,
                    "protein": 6 if is_veg else 15,
                    "carbs": 25 if is_veg else 20,
                    "fat": 12 if is_veg else 4
                },
                "Dinner": {
                    "name": "Brown Rice with Tofu & Veggies" if is_veg else "Baked Salmon with Sweet Potato",
                    "ingredients": "Brown rice, tofu, broccoli, bell peppers, soy sauce" if is_veg else "Salmon fillet, sweet potato, green beans, olive oil",
                    "portionSize": "1 plate",
                    "calories": 500,
                    "protein": 18 if is_veg else 32,
                    "carbs": 65 if is_veg else 40,
                    "fat": 16 if is_veg else 18
                }
            }
        return json.dumps({"mealPlan": meal_plan})