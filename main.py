from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline
from diffusers import StableDiffusionPipeline
import torch
import base64
from io import BytesIO
from PIL import Image

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
image_pipeline = None

# Supported models
SUPPORTED_MODELS = {
    "aviyon1.2": {"task": "text2text-generation", "name": "google/flan-t5-large"},
    "distilgpt2": {"task": "text-generation", "name": "distilgpt2"},
    "facebook/opt-125m": {"task": "text-generation", "name": "facebook/opt-125m"},
    "google/flan-t5-small": {"task": "text2text-generation", "name": "google/flan-t5-small"},
    "google/flan-t5-base": {"task": "text2text-generation", "name": "google/flan-t5-base"},
}

# Default model
DEFAULT_MODEL = "aviyon1.2"

def get_model_pipeline(model_name: str):
    if model_name not in SUPPORTED_MODELS:
        raise ValueError(f"Unsupported model: {model_name}. Supported models are: {list(SUPPORTED_MODELS.keys())}")
    
    if model_name not in model_pipelines:
        model_info = SUPPORTED_MODELS[model_name]
        model_pipelines[model_name] = pipeline(model_info["task"], model=model_info["name"])
    
    return model_pipelines[model_name]

def get_image_pipeline():
    global image_pipeline
    if image_pipeline is None:
        image_pipeline = StableDiffusionPipeline.from_pretrained("stabilityai/stable-diffusion-2-1", torch_dtype=torch.float16)
        image_pipeline = image_pipeline.to("cuda" if torch.cuda.is_available() else "cpu")
    return image_pipeline

class FileData(BaseModel):
    name: str
    type: str
    content: str

class MessageRequest(BaseModel):
    message: str
    context: str = ""
    model: str = DEFAULT_MODEL
    files: list[FileData] = []

def generate_response(message: str, context: str, model: str, files: list[FileData]) -> str:
    try:
        is_image_request = any(keyword in message.lower() for keyword in ["create a photo", "generate an image", "make a picture", "realistic photo", "how would an app look like", "visualize an app"])
        if is_image_request:
            image_pipe = get_image_pipeline()
            image = image_pipe(message).images[0]
            buffered = BytesIO()
            image.save(buffered, format="PNG")
            img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
            data_url = f"data:image/png;base64,{img_str}"
            return f"Here's the generated image:\n\n![Generated Image]({data_url})"

        generator = get_model_pipeline(model)
        is_code_question = any(keyword in message.lower() for keyword in ["code", "program", "script", "python", "javascript", "java", "c++", "repository", "github", "gitlab"])
        file_summary = ""
        if files:
            file_summary = "**Uploaded Files Summary**:\n"
            for file in files:
                if file.type.startswith('image/'):
                    file_summary += f"- {file.name}: This is an image file.\n"
                else:
                    file_summary += f"- {file.name}: {file.content[:100]}...\n"

        cross_thread_context = ""
        if "**Cross-Thread Context**:" in message:
            cross_thread_context = message.split("**Cross-Thread Context**:", 1)[1].strip()
            message = message.split("**Cross-Thread Context**:", 1)[0].strip()

        if model == "aviyon1.2":
            if is_code_question:
                prompt = (
                    f"You are a highly advanced and conversational AI coding assistant named [AI_NAME]. "
                    f"Respond in a friendly, engaging tone as if you're chatting with a friend. "
                    f"Use the following cross-thread context to inform your response:\n{cross_thread_context}\n\n"
                    f"Provide a detailed explanation of {message}, including a step-by-step breakdown, best practices, and a complete code example with comments. "
                    f"Use Markdown formatting with bold headings, bullet points, and code blocks. "
                    f"If applicable, include file names and folder paths in the code block description.\n\n{file_summary}"
                )
            else:
                prompt = (
                    f"You are a highly advanced and conversational AI assistant named [AI_NAME]. "
                    f"Respond in a friendly, engaging tone as if you're chatting with a friend. "
                    f"Use the following cross-thread context to inform your response:\n{cross_thread_context}\n\n"
                    f"Provide a comprehensive and insightful response to {message}, including detailed explanations, examples, and actionable advice. "
                    f"Use Markdown formatting with bold headings, bullet points, and numbered lists. "
                    f"Make the response engaging and informative, suitable for both beginners and experts.\n\n{file_summary}"
                )
        else:
            if context == "blog":
                prompt = f"Write a short introduction for a blog post about {message} in 2-3 sentences."
            elif context == "forum":
                prompt = f"Create a short discussion starter for a forum post on {message} in 2-3 sentences."
            elif context == "goal":
                prompt = f"Suggest three actionable steps to achieve the goal: {message}."
            else:
                prompt = f"Provide a brief overview of {message} in 2-3 sentences.\n\n{file_summary}"

        generated = generator(
            prompt,
            max_length=500,
            num_return_sequences=1,
            truncation=True,
            do_sample=True,
            temperature=0.7,
            top_p=0.9,
            clean_up_tokenization_spaces=True
        )

        response_text = generated[0]['generated_text'].strip()
        response_text = response_text.replace(prompt, '').strip()
        response_text = response_text.replace("I am [AI_NAME], a helpful AI assistant for Kodoninja.", "").strip()
        response_text = response_text.split("\n\n")[0].strip()

        if model == "aviyon1.2" and is_code_question:
            code_example = "print('Hello, World!')  # Example print statement"
            formatted_response = (
                f"Hey there! Let’s dive into {message.title()}! 🌟\n\n"
                f"{response_text}\n\n"
                f"**Step-by-Step Breakdown** 📝\n"
                f"- **Step 1**: Understand the requirements.\n"
                f"- **Step 2**: Plan your code structure.\n"
                f"- **Step 3**: Write and test the code.\n\n"
                f"**Best Practices** 💡\n"
                f"- Use clear variable names.\n"
                f"- Add comments for clarity.\n"
                f"- Test thoroughly.\n\n"
                f"**Example Code** (File: `/src/main.py`):\n"
                f"```python\n{code_example}\n```"
            )
        elif model == "aviyon1.2":
            formatted_response = (
                f"Hi friend! Let’s chat about {message.title()}! 🚀\n\n"
                f"{response_text}\n\n"
                f"**Key Insights** 🔍\n"
                f"1. **First Insight**: This is a critical point to understand. 🌍\n"
                f"2. **Second Insight**: Another important detail. 💡\n"
                f"3. **Third Insight**: A final takeaway. ✨\n\n"
                f"**Actionable Advice** 📋\n"
                f"- Start with a clear plan.\n"
                f"- Research thoroughly.\n"
                f"- Implement step-by-step."
            )
        else:
            if is_code_question:
                code_example = "print('Hello, World!')"
                formatted_response = (
                    f"Here's an overview of {message}! 🌟\n\n"
                    f"{response_text}\n\n"
                    f"**Example Code**:\n"
                    f"```python\n{code_example}\n```"
                )
            else:
                formatted_response = (
                    f"Let’s talk about {message.title()}! 🚀\n\n"
                    f"{response_text}\n\n"
                    f"- **Key Point 1**: This is an important aspect. 🌍\n"
                    f"- **Key Point 2**: Another key detail to understand. 💡"
                )

        if file_summary:
            formatted_response += f"\n\n{file_summary}"

        return formatted_response
    except Exception as e:
        return f"I encountered an error while generating a response: {str(e)}"

@app.post("/api/nimbus")
async def nimbus_endpoint(request: MessageRequest):
    try:
        response = generate_response(request.message, request.context, request.model, request.files)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))