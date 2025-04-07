from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000", "http://localhost:3000", "https://kodoninja.com", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the Hugging Face pipeline with facebook/opt-125m
generator = pipeline("text-generation", model="facebook/opt-125m")

class MessageRequest(BaseModel):
    message: str
    context: str = ""

def generate_response(message: str, context: str) -> str:
    try:
        if context == "blog":
            prompt = f"Write an engaging introduction for a blog post about: {message}. Keep it concise and relevant."
        elif context == "forum":
            prompt = f"Create a discussion starter for a forum post on the topic: {message}. Keep it concise and relevant."
        elif context == "goal":
            prompt = f"Suggest actionable steps to achieve the goal: {message}. Keep it concise and relevant."
        else:
            prompt = f"You are Nimbus.ai, a helpful AI assistant for Kodoninja. A user asked: {message}. Provide a concise and relevant response."

        # Generate response using facebook/opt-125m
        generated = generator(prompt, max_length=100, num_return_sequences=1, truncation=True, temperature=0.7, top_p=0.9)
        return f"Nimbus.ai: {generated[0]['generated_text'].replace(prompt, '').strip()}"
    except Exception as e:
        return f"Nimbus.ai: I encountered an error while generating a response: {str(e)}"

@app.post("/api/nimbus")
async def nimbus_endpoint(request: MessageRequest):
    try:
        response = generate_response(request.message, request.context)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))