import json
import re
import time
import os
import google.generativeai as genai
from groq import Groq
from app.config import settings
from app.utils.logger import logger

# Initialize Gemini
if settings.gemini_api_key:
    genai.configure(api_key=settings.gemini_api_key)
else:
    logger.warning("GEMINI_API_KEY is not set in settings or environment.")

# Initialize Groq
groq_client = None
if settings.groq_api_key:
    try:
        groq_client = Groq(api_key=settings.groq_api_key)
    except Exception as e:
        logger.error(f"Failed to initialize Groq client: {e}")
else:
    logger.warning("GROQ_API_KEY is not set in settings or environment.")


def call_gemini(prompt: str, system_prompt: str = "") -> str:
    """Calls Gemini 1.5 Flash API."""
    if not settings.gemini_api_key:
        raise ValueError("GEMINI_API_KEY is missing.")
    
    # Rate limit sleep (0.2s as per notes)
    time.sleep(0.2)
    
    try:
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            system_instruction=system_prompt if system_prompt else None
        )
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        logger.error(f"Gemini API call failed: {e}")
        raise e


def call_groq(prompt: str, system_prompt: str = "", model_name: str = "llama-3.1-70b-versatile") -> str:
    """Calls Groq API with fallback models."""
    global groq_client
    if not settings.groq_api_key:
        # Check if we can fallback to Gemini
        logger.warning("GROQ_API_KEY is missing, falling back to Gemini.")
        full_prompt = f"System instruction: {system_prompt}\n\nUser request: {prompt}"
        return call_gemini(full_prompt)
        
    if not groq_client:
        groq_client = Groq(api_key=settings.groq_api_key)
        
    # Rate limit sleep (0.5s as per notes)
    time.sleep(0.5)
    
    # Supported Groq models to try in sequence
    models_to_try = [
        model_name,
        "llama-3.3-70b-specdec",
        "llama3-70b-8192",
        "mixtral-8x7b-32768",
        "llama-3.1-8b-instant"
    ]
    
    last_error = None
    for model in models_to_try:
        try:
            chat_completion = groq_client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                model=model,
                response_format={"type": "json_object"}
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            logger.warning(f"Groq call failed for model {model}: {e}. Retrying next model...")
            last_error = e
            time.sleep(1.0)
            
    # If all models fail, raise the last exception
    logger.error(f"All Groq models failed. Last error: {last_error}")
    raise last_error


def parse_json_response(text: str) -> dict:
    """Extracts JSON block from response text and parses it, with robust regex fallbacks."""
    if not text:
        return {}
        
    # Standard cleanup
    text = text.strip()
    
    # Try direct parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
        
    # Try finding json block within markdown code block
    match = re.search(r'```(?:json)?\s*(.*?)\s*```', text, re.DOTALL | re.IGNORECASE)
    if match:
        try:
            return json.loads(match.group(1).strip())
        except json.JSONDecodeError:
            pass
            
    # Try finding absolute brackets { ... }
    match_braces = re.search(r'(\{.*\})', text, re.DOTALL)
    if match_braces:
        try:
            return json.loads(match_braces.group(1).strip())
        except json.JSONDecodeError:
            pass
            
    raise ValueError(f"Could not parse valid JSON from LLM response: {text[:200]}...")


def call_llm_with_json_retry(
    prompt: str,
    system_prompt: str = "",
    use_groq: bool = False,
    retries: int = 3
) -> dict:
    """Invokes LLM and retries up to `retries` times on JSON parse failure."""
    for attempt in range(1, retries + 1):
        try:
            if use_groq:
                raw_response = call_groq(prompt, system_prompt)
            else:
                raw_response = call_gemini(prompt, system_prompt)
                
            parsed = parse_json_response(raw_response)
            return parsed
        except Exception as e:
            logger.warning(f"LLM json retry attempt {attempt}/{retries} failed: {e}")
            if attempt == retries:
                logger.error(f"LLM call permanently failed after {retries} retries.")
                raise e
            time.sleep(1.0)
            
    return {}
