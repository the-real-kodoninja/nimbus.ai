from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000", "http://localhost:3000", "https://kodoninja.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(api_key="your-openai-api-key")

class MessageRequest(BaseModel):
    message: str
    context: str = ""

def generate_response(message: str, context: str) -> str:
    if context == "blog":
        prompt = f"Help me write a blog post. The topic is: {message}. Suggest an engaging introduction."
    elif context == "forum":
        prompt = f"Help me create a forum post. The topic is: {message}. Suggest a discussion starter."
    elif context == "goal":
        prompt = f"Help me set a goal. The goal is: {message}. Suggest actionable steps."
    else:
        prompt = f"You are Nimbus.ai, a helpful AI assistant for Kodoninja. Respond to this message: {message}"

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are Nimbus.ai, a helpful AI assistant."},
                {"role": "user", "content": prompt}
            ]
        )
        return f"Nimbus.ai: {response.choices[0].message.content}"
    except Exception as e:
        return f"Nimbus.ai: I encountered an error while generating a response: {str(e)}"

@app.post("/api/nimbus")
async def nimbus_endpoint(request: MessageRequest):
    try:
        response = generate_response(request.message, request.context)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
