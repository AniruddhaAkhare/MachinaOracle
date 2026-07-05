# """Gemini AI service using LangChain"""
# import os
# import logging
# import json
# from typing import Dict, Any

# # 🔥 FORCE PATCH BEFORE ANYTHING TOUCHES LANGCHAIN


# # 🚨 IMPORTANT: import AFTER patch
# from langchain_google_genai import ChatGoogleGenerativeAI
# from langchain_core.prompts import ChatPromptTemplate
# from langchain_core.output_parsers import JsonOutputParser, StrOutputParser

# logger = logging.getLogger(__name__)

# # Cache the model instance
# _llm = None


# def get_llm(temperature: float = 0.3):
#     """Initializes the LangChain Gemini model."""
#     global _llm
#     if _llm is None:
#         # ⚠️ Use env variable (recommended)
#         api_key = os.getenv("GEMINI_API_KEY")

#         _llm = ChatGoogleGenerativeAI(
#             # model="gemini-2.5-flash",
#             model="gemini-3.1-flash-lite-preview",
#             google_api_key=api_key,
#             temperature=temperature,
#             max_output_tokens=8192,
#         )
#     return _llm


# def generate_response(prompt: str, temperature: float = 0.3) -> str:
#     """Generates a plain text response using LangChain."""
#     try:
#         llm = get_llm(temperature)

#         chain = ChatPromptTemplate.from_template("{input}") | llm | StrOutputParser()

#         return chain.invoke({"input": prompt})

#     except Exception as e:
#         logger.error(f"Gemini error: {e}")
#         return f"Error generating response: {str(e)}"


# def generate_json_response(prompt: str, temperature: float = 0.2) -> Dict[str, Any]:
#     """Generates a structured JSON response using LangChain's JsonOutputParser."""
#     try:
#         llm = get_llm(temperature)
#         parser = JsonOutputParser()

#         prompt_template = ChatPromptTemplate.from_template(
#             "{input}\n\n{format_instructions}"
#         )

#         chain = prompt_template | llm | parser

#         return chain.invoke({
#             "input": prompt,
#             "format_instructions": parser.get_format_instructions()
#         })

#     except Exception as e:
#         logger.error(f"JSON parse error in LangChain: {e}")
#         return {"error": "Failed to parse AI response", "details": str(e)}

# """LLM service using Hugging Face Inference API"""
# import os
# import logging
# from typing import Dict, Any

# from langchain_huggingface import ChatHuggingFace, HuggingFaceEndpoint
# from langchain_core.prompts import ChatPromptTemplate
# from langchain_core.output_parsers import JsonOutputParser, StrOutputParser

# logger = logging.getLogger(__name__)

# # Cache models dynamically based on model_name and temperature
# _llm_cache = {}

# # Mistral-7B-Instruct is a great, fast model available on the free HF API
# def get_llm(model_name: str = " ", temperature: float = 0.1):
#     """Initializes and caches the LangChain model via Hugging Face API."""
#     cache_key = f"{model_name}_{temperature}"
    
#     if cache_key not in _llm_cache:
#         # Load the API key from your .env file
#         api_key = os.getenv("HUGGINGFACEHUB_API_TOKEN")
        
#         if not api_key:
#             logger.error("HUGGINGFACEHUB_API_TOKEN is missing from .env!")

#         # Ensure temperature isn't exactly 0 (HF API throws an error for temp=0)
#         safe_temp = max(temperature, 0.01)

#         # 1. Connect to the Serverless Inference API
#         llm_endpoint = HuggingFaceEndpoint(
#             repo_id=model_name,
#             task="text-generation",
#             max_new_tokens=1024,
#             temperature=safe_temp,
#             huggingfacehub_api_token=api_key,
#         )
        
#         # 2. Wrap it so it understands Chat messages (like your other agents expect)
#         _llm_cache[cache_key] = ChatHuggingFace(llm=llm_endpoint)
#         logger.info(f"Initialized new Hugging Face API instance: {cache_key}")
        
#     return _llm_cache[cache_key]


# def generate_response(prompt: str, model: str = "Qwen/Qwen2.5-72B-Instruct", temperature: float = 0.3) -> str:
#     """Generates a plain text response using Hugging Face."""
#     try:
#         llm = get_llm(model_name=model, temperature=temperature)
#         chain = ChatPromptTemplate.from_template("{input}") | llm | StrOutputParser()
#         return chain.invoke({"input": prompt})
    
#     except Exception as e:
#         logger.error(f"LLM error: {e}")
#         return f"Error generating response: {str(e)}"


# def generate_json_response(prompt: str, model: str = "Qwen/Qwen2.5-72B-Instruct", temperature: float = 0.1) -> Dict[str, Any]:
#     """Generates a structured JSON response using Hugging Face."""
#     try:
#         llm = get_llm(model_name=model, temperature=temperature)
#         parser = JsonOutputParser()

#         # We strengthen the prompt here because smaller HF models sometimes struggle with JSON formatting
#         prompt_template = ChatPromptTemplate.from_template(
#             "{input}\n\n"
#             "CRITICAL INSTRUCTION: You MUST output ONLY valid JSON. "
#             "Do not wrap it in markdown code blocks. Do not add conversational text.\n\n"
#             "{format_instructions}"
#         )

#         chain = prompt_template | llm | parser

#         return chain.invoke({
#             "input": prompt,
#             "format_instructions": parser.get_format_instructions()
#         })

#     except Exception as e:
#         logger.error(f"JSON parse error in LangChain (Hugging Face): {e}")
#         return {"error": "Failed to parse AI response", "details": str(e)}

"""Universal LLM Service (Tri-Model Architecture)"""
import os
import logging
from typing import Dict, Any
import re
import json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_huggingface import ChatHuggingFace, HuggingFaceEndpoint
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser, StrOutputParser

logger = logging.getLogger(__name__)
_llm_cache = {}

def get_llm(provider: str = "gemini", model_name: str = "gemini-3.1-flash-lite-preview", temperature: float = 0.1):
    cache_key = f"{provider}_{model_name}_{temperature}"
    
    if cache_key not in _llm_cache:
        if provider == "gemini":
            _llm_cache[cache_key] = ChatGoogleGenerativeAI(
                model=model_name,
                google_api_key=os.getenv("GEMINI_API_KEY"),
                temperature=temperature,
            )
        elif provider == "huggingface":
            # Used for both Qwen and DeepSeek hosted on HF
            endpoint = HuggingFaceEndpoint(
                repo_id=model_name,
                task="text-generation",
                max_new_tokens=2048,
                temperature=max(temperature, 0.01),
                huggingfacehub_api_token=os.getenv("HUGGINGFACEHUB_API_TOKEN"),
            )
            _llm_cache[cache_key] = ChatHuggingFace(llm=endpoint)
        else:
            raise ValueError(f"Unknown provider: {provider}")
            
    return _llm_cache[cache_key]


def generate_response(prompt: str, provider: str = "gemini", model: str = "gemini-2.5-flash", temperature: float = 0.3) -> str:
    """Generates a plain text response (Used by ChatAgent)."""
    try:
        llm = get_llm(provider, model, temperature)
        chain = ChatPromptTemplate.from_template("{input}") | llm | StrOutputParser()
        return chain.invoke({"input": prompt})
    except Exception as e:
        logger.error(f"LLM error: {e}")
        return f"Error generating response: {str(e)}"




def _extract_json(text: str) -> str:
    """
    Robustly extract JSON from messy LLM output.
    Handles DeepSeek <think> blocks, markdown fences, and surrounding text.
    """
    # 1. Strip <think>...</think> blocks (including unclosed ones)
    text = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL)
    text = re.sub(r'<think>.*$', '', text, flags=re.DOTALL)  # unclosed <think>

    # 2. Strip markdown fences (```json ... ``` or ``` ... ```)
    text = re.sub(r'```(?:json)?\s*', '', text)
    text = text.replace('```', '')

    text = text.strip()

    # 3. Try to find the first valid JSON object or array using brace matching
    for start_char, end_char in [('{', '}'), ('[', ']')]:
        start_idx = text.find(start_char)
        if start_idx == -1:
            continue

        depth = 0
        in_string = False
        escape_next = False

        for i, ch in enumerate(text[start_idx:], start=start_idx):
            if escape_next:
                escape_next = False
                continue
            if ch == '\\' and in_string:
                escape_next = True
                continue
            if ch == '"' and not escape_next:
                in_string = not in_string
            if not in_string:
                if ch == start_char:
                    depth += 1
                elif ch == end_char:
                    depth -= 1
                    if depth == 0:
                        return text[start_idx:i + 1]

    return text  # fallback: return as-is and let the parser fail with a clean error

def generate_json_response(
    prompt: str,
    provider: str = "huggingface",
    model: str = "deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B",
    temperature: float = 0.1
) -> Dict[str, Any]:
    raw_output = None
    try:
        # Step 1: Test LLM init
        logger.debug(f"[JSON] Initializing LLM: provider={provider}, model={model}")
        llm = get_llm(provider, model, temperature)
        logger.debug(f"[JSON] LLM initialized: {type(llm)}")

        # Step 2: Test raw LLM response BEFORE any chain
        logger.debug("[JSON] Testing raw LLM call...")
        try:
            test_response = llm.invoke("Say hello")
            logger.debug(f"[JSON] Raw LLM test response type: {type(test_response)}")
            logger.debug(f"[JSON] Raw LLM test response: {repr(test_response)}")
        except Exception as llm_err:
            logger.error(f"[JSON] LLM.invoke() itself failed: {type(llm_err).__name__}: {llm_err}")
            raise

        parser = JsonOutputParser()
        system_rules = ""
        if provider == "huggingface":
            system_rules = "CRITICAL: Output ONLY valid JSON. Do NOT wrap it in markdown blocks.\n\n"

        prompt_template = ChatPromptTemplate.from_template(
            f"{{input}}\n\n{system_rules}{{format_instructions}}"
        )

        # Step 3: Test the full chain
        logger.debug("[JSON] Invoking full chain...")
        text_chain = prompt_template | llm | StrOutputParser()
        raw_output = text_chain.invoke({
            "input": prompt,
            "format_instructions": parser.get_format_instructions()
        })

        logger.debug(f"[JSON] raw_output type: {type(raw_output)}")
        logger.debug(f"[JSON] raw_output value: {repr(raw_output[:500] if raw_output else raw_output)}")

        if not raw_output:
            raise ValueError(f"Chain returned empty/None output. LLM type: {type(llm)}")

        cleaned_output = _extract_json(raw_output)
        logger.debug(f"[JSON] cleaned_output: {repr(cleaned_output[:300])}")

        try:
            return json.loads(cleaned_output)
        except json.JSONDecodeError as je:
            logger.warning(f"[JSON] json.loads failed ({je}), trying LangChain parser...")
            return parser.parse(cleaned_output)

    except Exception as e:
        # Log the FULL exception with traceback, not just str(e)
        logger.error(f"[JSON] Failed. raw_output={repr(raw_output)}", exc_info=True)
        return {
            "error": "Failed to parse AI response",
            "details": f"{type(e).__name__}: {str(e)}",
            "raw_output_that_failed": raw_output or "Model returned nothing"
        }