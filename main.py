from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000", "http://localhost:3000", "https://kodoninja.com", "https://*.vercel.app", "https://<codespace-name>-3000.app.github.dev"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dictionary to store model pipelines
model_pipelines = {}

# Supported models
SUPPORTED_MODELS = {
    "distilgpt2": {"task": "text-generation", "name": "distilgpt2"},
    "facebook/opt-125m": {"task": "text-generation", "name": "facebook/opt-125m"},
    "google/flan-t5-small": {"task": "text2text-generation", "name": "google/flan-t5-small"},
    "google/flan-t5-base": {"task": "text2text-generation", "name": "google/flan-t5-base"},
}

# Default model
DEFAULT_MODEL = "google/flan-t5-small"

def get_model_pipeline(model_name: str):
    if model_name not in SUPPORTED_MODELS:
        raise ValueError(f"Unsupported model: {model_name}. Supported models are: {list(SUPPORTED_MODELS.keys())}")
    
    if model_name not in model_pipelines:
        model_info = SUPPORTED_MODELS[model_name]
        model_pipelines[model_name] = pipeline(model_info["task"], model=model_info["name"])
    
    return model_pipelines[model_name]

class MessageRequest(BaseModel):
    message: str
    context: str = ""
    model: str = DEFAULT_MODEL

def generate_response(message: str, context: str, model: str) -> str:
    try:
        generator = get_model_pipeline(model)

        # Check if the message is a code-related question
        is_code_question = any(keyword in message.lower() for keyword in ["code", "program", "script", "python", "javascript", "java", "c++"])

        if context == "blog":
            prompt = f"Write a short introduction for a blog post about {message} in 2-3 sentences."
        elif context == "forum":
            prompt = f"Create a short discussion starter for a forum post on {message} in 2-3 sentences."
        elif context == "goal":
            prompt = f"Suggest three actionable steps to achieve the goal: {message}."
        else:
            prompt = f"Provide a brief overview of {message} in 2-3 sentences."

        # Generate response
        generated = generator(
            prompt,
            max_length=200,  # Increased for longer responses
            num_return_sequences=1,
            truncation=True,
            do_sample=True,
            temperature=0.7,
            top_p=0.9,
            clean_up_tokenization_spaces=True
        )

        # Clean up the raw response
        response_text = generated[0]['generated_text'].strip()
        response_text = response_text.replace(prompt, '').strip()
        response_text = response_text.replace("I am Nimbus.ai, a helpful AI assistant for Kodoninja.", "").strip()
        response_text = response_text.split("\n\n")[0].strip()

        # Format the response with Markdown
        if is_code_question:
            # Example: If it's a code question, include a code block
            code_example = "print('Hello, World!')"
            formatted_response = (
                f"**Here's an overview of {message}** 🌟\n\n"
                f"{response_text}\n\n"
                f"**Example Code**:\n"
                f"```python\n{code_example}\n```"
            )
        else:
            # Format with bold, emojis, and bullets
            formatted_response = (
                f"**{message.title()} Overview** 🚀\n\n"
                f"{response_text}\n\n"
                f"- **Key Point 1**: This is an important aspect. 🌍\n"
                f"- **Key Point 2**: Another key detail to understand. 💡"
            )

        return f"Nimbus.ai: {formatted_response}"
    except Exception as e:
        return f"Nimbus.ai: I encountered an error while generating a response: {str(e)}"

@app.post("/api/nimbus")
async def nimbus_endpoint(request: MessageRequest):
    try:
        response = generate_response(request.message, request.context, request.model)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))