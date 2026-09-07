from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
import traceback

load_dotenv()

model = ChatGoogleGenerativeAI(model="gemini-flash-latest")

def get_ai_response(chat_history, user_info=None):
    system_prompt = """
You are Nutrition assistant, a helpful, evidence-based and friendly AI nutrition assistant. Your goal is to help users make informed and healthy dietary choices based on their individual needs, preferences, and goals.

Use language that is clear, supportive, and encouraging. Always consider the user's profile before making suggestions.

When asked for a meal plan, tailor it according to nutritional balance (macros and micros), cultural preferences if known, and practicality (e.g., common household foods, easy preparation).

If the user asks for food suggestions, recipes, or alternatives, provide specific and accessible options.

If asked for facts, definitions, or explanations, rely on scientifically accurate information from credible nutrition sources.

Never make medical diagnoses or override professional medical advice. When in doubt or if a health issue is involved, recommend seeing a certified nutritionist or healthcare provider.

If you are asked about anything other than health or nutrition, please gently reply back saying that you are a health assistant and please ask me about health related stuff
"""

    if user_info:
        health_context = f"""
User Health Profile:
- Age: {user_info.get('age', 'Not specified')}
- Gender: {user_info.get('gender', 'Not specified')}
- Height: {user_info.get('height', 'Not specified')} cm
- Weight: {user_info.get('weight', 'Not specified')} kg
- Diet Preference: {user_info.get('dietPreference', 'Not specified')}
- Goal: {user_info.get('goal', 'Not specified')}
- Activity Level: {user_info.get('activityLevel', 'Not specified')}
- Allergies: {user_info.get('allergies', 'None')}

When providing nutrition advice, always consider these details to give personalized recommendations.
"""
        system_prompt = health_context + system_prompt

    messages = [SystemMessage(content=system_prompt)]
    
    for message in chat_history:
        if message['role'] == 'user':
            messages.append(HumanMessage(content=message['content']))
        elif message['role'] == 'assistant':
            messages.append(AIMessage(content=message['content']))

    try:
        result = model.invoke(messages)
        return result.content
    except Exception as e:
        print(f"=== AI chat error ===\n{traceback.format_exc()}")
        
        # Friendly local offline mock chatbot fallback
        last_message_lower = ""
        if chat_history:
            last_message_lower = chat_history[-1].get('content', '').lower()
            
        if "workout" in last_message_lower or "exercise" in last_message_lower or "gym" in last_message_lower:
            return "For pre-workout energy, try light carbs with a bit of protein 30-60 minutes before: like a banana with peanut butter, oatmeal with berries, or toast with a boiled egg. Stay hydrated!"
        elif "hi" in last_message_lower or "hello" in last_message_lower or "hey" in last_message_lower:
            return "Hello! I am your AI Nutrition Coach. How can I help you with your healthy eating goals today?"
        elif "diet" in last_message_lower or "weight" in last_message_lower:
            return "To achieve your goals, focus on nutrient-dense whole foods, lean proteins, healthy fats, and complex carbohydrates. Tell me more about what you'd like to adjust!"
        elif "roti" in last_message_lower or "bread" in last_message_lower:
            return "Roti or whole wheat flatbread is a great source of complex carbohydrates and fiber. Try pairing it with lentils or vegetables for a balanced meal."
        elif "meal" in last_message_lower or "plan" in last_message_lower:
            return "I can suggest meal plans! Try focusing on oatmeal or eggs for breakfast, a fresh salad or chicken/tofu wrap for lunch, and grilled salmon or dal with brown rice and mixed vegetables for dinner."
        else:
            return "Hello! I'm your AI Nutrition Assistant. I can help with pre-workout meals, diet recommendations, and custom food plans. What would you like to know?"