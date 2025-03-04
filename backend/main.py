from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from mistralai import Mistral
from langdetect import detect, DetectorFactory

# ✅ Initialize FastAPI App
app = FastAPI()

# ✅ CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React App URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Request Model
class ChatRequest(BaseModel):
    message: str

# ✅ Mistral API Key & Client Setup
MISTRAL_API_KEY = "lYzMYEYlCYqDlNOsc0dNp6LJ29bpxKwO"  # Replace with your actual Mistral API key
client = Mistral(api_key=MISTRAL_API_KEY)
CUSTOMER_SUPPORT_NUMBER = "+910123456789"

# ✅ Predefined Responses for Common Questions
def get_response(message: str) -> str:
    message = message.lower()

    if any(keyword in message for keyword in ["customer support", "contact number", "phone number"]):
        return f"Need help? Call us at {CUSTOMER_SUPPORT_NUMBER}. We're happy to assist!"

    predefined_responses = {
        "start a delivery": "To start a delivery, log into the app, check your assigned deliveries, and tap 'Start Delivery'.",
        "problem during delivery": "If you face an issue during delivery, go to 'Help' in the app or call support at +910123456789.",
        "update payment": "To update your payment, go to 'Wallet & Balance' → 'Add Money' → Enter the amount → Proceed to online payment. Cash is not accepted.",
        "working hours": "Deliveries are allowed from 8 AM to 8 PM. Contact support for exceptions.",
        "view earnings": "Tap on 'Earnings' in the app to see your total earnings and pending payments.",
        "miss a delivery": "Report a missed delivery immediately in the app under 'Issues' or call support.",
        "security deposit": "A one-time deposit is required for rental plans. It will be refunded automatically after plan expiration or cancellation.",
        "asset details": "Tap 'Asset Details' in the app to see your assigned vehicles or equipment.",
        "rental waitlist": "Check 'Rental Waitlist' to track rental plans you have purchased but are awaiting assignment.",
        "maintenance logs": "To request maintenance, go to 'Maintenance Logs' → Tap '+' → Select issue (Breakdown, Accident, or Maintenance) → Submit.",
        "operation schedule": "See your upcoming and completed operations in 'Operation Schedule'. Mark tasks as 'Completed' when done.",
        "escalations": "For serious issues, go to 'Escalations' in the app, describe your issue, and submit. Support will review it.",
        "work orders": "Check all your assigned work under 'Work Orders'.",
        "location code": "Find your location code in 'Settings' → 'Account Settings' → 'Location Code'.",
        "app language": "Change your app language in 'Settings' → 'Account Settings' → 'Language Selection'.",
    }

    for key, response in predefined_responses.items():
        if key in message:
            return response

    return None  # No predefined response found

# ✅ Chat API Endpoint
@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        # First, check predefined responses
        language = detect(request.message)
        
        predefined_response = get_response(request.message)
        if predefined_response:
            return {"response": predefined_response}
        if language in ['hi', 'kn']:  # Hindi or Kannada
            system_message = "आप गुद्ज़ बॉट हैं, जो गुद्ज़ के ड्राइवर ऐप के लिए ग्राहक सहायता सहायक हैं।" if language == 'hi' else "ನೀವು ಗುದ್ಜ್ ಬಾಟ್ ಆಗಿದ್ದೀರಿ, ಇದು ಗುದ್ಜ್ ನ ಡ್ರೈವರ್ ಆಪ್ ಗೆ ಗ್ರಾಹಕ ಬೆಂಬಲ ಸಹಾಯಕರಾಗಿದೆ।"
        else:
            system_message = "You are Gudz Bot, a customer support assistant for Gudz's driver app."

        # AI-Based Response Fallback
        response = client.chat.complete(
            model="mistral-large-latest",
            messages=[
                {"role": "system", "content": "You are Gudz Bot, a professional but friendly assistant for Gudz's driver app. Always be calm, helpful, and clear, even if the user is frustrated."},
                {"role": "user", "content": request.message},
            ]
        )

        ai_response = response.choices[0].message.content.strip()

        # Escalation Handling
        if "escalate" in ai_response.lower() or "not able to help" in ai_response.lower():
            return {"response": f"I understand this might be frustrating. Let me escalate this for you. Please call our support at {CUSTOMER_SUPPORT_NUMBER} for immediate assistance! For any other queries, feel free to ask."}

        return {"response": ai_response}

    except Exception as e:
        return {"response": f"Sorry, I encountered an error. Please try again later. (Error: {str(e)})"}








