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

# Initialize the Hugging Face pipeline with google/flan-t5-small
generator = pipeline("text2text-generation", model="google/flan-t5-small")

class MessageRequest(BaseModel):
    message: str
    context: str = ""

def generate_response(message: str, context: str) -> str:
    try:
        if context == "blog":
            prompt = f"Write a short introduction for a blog post about {message} in 2-3 sentences."
        elif context == "forum":
            prompt = f"Create a short discussion starter for a forum post on {message} in 2-3 sentences."
        elif context == "goal":
            prompt = f"Suggest three actionable steps to achieve the goal: {message}."
        else:
            prompt = f"Provide a brief overview of {message} in 2-3 sentences."

        # Generate response using google/flan-t5-small
        generated = generator(
            prompt,
            max_length=100,
            num_return_sequences=1,
            truncation=True,
            do_sample=True,
            temperature=0.7,
            top_p=0.9,
            clean_up_tokenization_spaces=True
        )
        # Remove the prompt and clean up the response
        response_text = generated[0]['generated_text'].strip()
        response_text = response_text.replace(prompt, '').strip()
        # Remove any remaining "I am Nimbus.ai..." if the model generates it
        response_text = response_text.replace("I am Nimbus.ai, a helpful AI assistant for Kodoninja.", "").strip()
        # Truncate at the first double newline to avoid irrelevant text
        response_text = response_text.split("\n\n")[0].strip()
        return f"Nimbus.ai: {response_text}"
    except Exception as e:
        return f"Nimbus.ai: I encountered an error while generating a response: {str(e)}"

@app.post("/api/nimbus")
async def nimbus_endpoint(request: MessageRequest):
    try:
        response = generate_response(request.message, request.context)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))