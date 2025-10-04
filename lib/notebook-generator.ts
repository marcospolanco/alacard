import { Recipe, ModelCard, PromptCardPack, TopicCard, DifficultyCard, UIComponentCard } from '@/types'

// Hugging Face API integration
class HuggingFaceAPI {
  private static baseURL = 'https://huggingface.co/api'

  static async getModelInfo(modelId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/models/${modelId}`)
      if (!response.ok) throw new Error('Model not found')
      return await response.json()
    } catch (error) {
      console.error('Error fetching model info:', error)
      return null
    }
  }

  static async getREADME(modelId: string, sha?: string): Promise<string | null> {
    try {
      const url = sha
        ? `https://huggingface.co/${modelId}/raw/${sha}/README.md`
        : `https://huggingface.co/${modelId}/raw/main/README.md`

      const response = await fetch(url)
      if (!response.ok) throw new Error('README not found')
      return await response.text()
    } catch (error) {
      console.error('Error fetching README:', error)
      return null
    }
  }
}

// Code extraction and processing utilities
class CodeProcessor {
  static extractPythonBlocks(markdown: string): string[] {
    const codeBlockRegex = /```python\n([\s\S]*?)\n```/gi
    const blocks = []
    let match

    while ((match = codeBlockRegex.exec(markdown)) !== null) {
      blocks.push(match[1].trim())
    }

    // If no python blocks found, try generic code blocks
    if (blocks.length === 0) {
      const genericCodeRegex = /```\n?([\s\S]*?)\n```/gi
      while ((match = genericCodeRegex.exec(markdown)) !== null) {
        const code = match[1].trim()
        // Only include if it looks like Python
        if (code.includes('import') || code.includes('from ') || code.includes('def ') || code.includes('print(')) {
          blocks.push(code)
        }
      }
    }

    return blocks
  }

  static customizeForDifficulty(code: string, difficulty: DifficultyCard): string {
    const { level, commentDensity, explanationDepth } = difficulty

    let customizedCode = code

    if (level === 'beginner') {
      // Add extensive comments and explanations
      customizedCode = this.addBeginnerComments(customizedCode)
    } else if (level === 'advanced') {
      // Minimize comments, add production patterns
      customizedCode = this.addAdvancedPatterns(customizedCode)
    }

    return customizedCode
  }

  private static addBeginnerComments(code: string): string {
    // Add detailed comments explaining each line
    const lines = code.split('\n')
    const commentedLines = lines.map(line => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        // Add explanatory comment before complex lines
        if (trimmed.includes('from ') || trimmed.includes('import ')) {
          return `# Import necessary libraries\n${line}`
        } else if (trimmed.includes('AutoTokenizer') || trimmed.includes('AutoModel')) {
          return `# Load the tokenizer and model from Hugging Face\n${line}`
        } else if (trimmed.includes('from_pretrained')) {
          return `# Download and cache the pre-trained model\n${line}`
        }
      }
      return line
    })
    return commentedLines.join('\n')
  }

  private static addAdvancedPatterns(code: string): string {
    // Add error handling, logging, and production-ready patterns
    let enhancedCode = code

    // Add error handling wrapper
    if (!enhancedCode.includes('try:')) {
      enhancedCode = `try:\n    ${enhancedCode.split('\n').map(line => `    ${line}`).join('\n')}\nexcept Exception as e:\n    print(f"Error: {e}")\n    raise`
    }

    return enhancedCode
  }

  static reframeForTopic(code: string, topic: TopicCard, prompt: string): string {
    const topicExamples = {
      'sourdough': [
        'sourdough bread recipe',
        'baking instructions',
        'fermentation process',
        'bread making tips'
      ],
      'healthcare': [
        'medical diagnosis',
        'patient data analysis',
        'healthcare recommendations',
        'medical terminology'
      ],
      'gamedev': [
        'game development',
        'character creation',
        'story generation',
        'game mechanics'
      ],
      'finance': [
        'financial analysis',
        'investment advice',
        'market trends',
        'budget planning'
      ],
      'education': [
        'learning concepts',
        'educational content',
        'study techniques',
        'knowledge assessment'
      ]
    }

    const examples = topicExamples[topic.id as keyof typeof topicExamples] || ['general example']
    const example = examples[Math.floor(Math.random() * examples.length)]

    // Replace generic placeholders with topic-specific examples
    let reframedCode = code
    reframedCode = reframedCode.replace(/"Hello, world!"/g, `"Tell me about ${example}"`)
    reframedCode = reframedCode.replace(/"Your prompt here"/g, `"Analyze this ${example}"`)
    reframedCode = reframedCode.replace(/"Sample text"/g, `"${example}"`)

    // Add topic context in comments
    reframedCode = `# Context: ${topic.description}\n${reframedCode}`

    return reframedCode
  }
}

// UI Component generators
class UIComponentGenerator {
  static generateCode(component: UIComponentCard, modelId: string, prompts: string[]): string {
    switch (component.type) {
      case 'chat_interface':
        return this.generateChatInterface(modelId, prompts)
      case 'api_endpoint':
        return this.generateAPIEndpoint(modelId)
      case 'gradio_demo':
        return this.generateGradioDemo(modelId, prompts)
      case 'streamlit_app':
        return this.generateStreamlitApp(modelId, prompts)
      default:
        return this.generateBasicInterface(modelId)
    }
  }

  private static generateChatInterface(modelId: string, prompts: string[]): string {
    return `import gradio as gr
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

class ChatInterface:
    def __init__(self, model_id: str):
        self.model_id = model_id
        self.tokenizer = AutoTokenizer.from_pretrained(model_id)
        self.model = AutoModelForCausalLM.from_pretrained(model_id)
        if torch.cuda.is_available():
            self.model = self.model.cuda()

    def generate_response(self, message, history):
        """Generate a response based on the conversation history"""
        # Format conversation history
        conversation = ""
        for user_msg, bot_msg in history:
            conversation += f"User: {user_msg}\\nAssistant: {bot_msg}\\n"
        conversation += f"User: {message}\\nAssistant: "

        # Tokenize and generate
        inputs = self.tokenizer.encode(conversation, return_tensors="pt")
        if torch.cuda.is_available():
            inputs = inputs.cuda()

        outputs = self.model.generate(
            inputs,
            max_length=inputs.shape[1] + 100,
            temperature=0.7,
            do_sample=True,
            pad_token_id=self.tokenizer.eos_token_id
        )

        response = self.tokenizer.decode(outputs[0][inputs.shape[1]:], skip_special_tokens=True)
        return response

# Initialize the chat interface
chat = ChatInterface("${modelId}")

# Create Gradio interface
with gr.Blocks() as demo:
    gr.Markdown("# ${modelId.split('/').pop()} Chat Interface")

    chatbot = gr.Chatbot(height=400)
    msg = gr.Textbox(label="Your message", placeholder="${prompts[0] || "Type your message here..."}")
    clear = gr.Button("Clear")

    def respond(message, chat_history):
        bot_message = chat.generate_response(message, chat_history)
        chat_history.append((message, bot_message))
        return "", chat_history

    msg.submit(respond, [msg, chatbot], [msg, chatbot])
    clear.click(lambda: None, None, chatbot, queue=False)

if __name__ == "__main__":
    demo.launch()`
  }

  private static generateAPIEndpoint(modelId: string): string {
    return `from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
from typing import List

app = FastAPI(title="${modelId.split('/').pop()} API")

class GenerationRequest(BaseModel):
    prompt: str
    max_length: int = 100
    temperature: float = 0.7
    do_sample: bool = True

class GenerationResponse(BaseModel):
    generated_text: str
    model: str = "${modelId}"

# Load model and tokenizer
tokenizer = AutoTokenizer.from_pretrained("${modelId}")
model = AutoModelForCausalLM.from_pretrained("${modelId}")

if torch.cuda.is_available():
    model = model.cuda()

@app.post("/generate", response_model=GenerationResponse)
async def generate_text(request: GenerationRequest):
    """Generate text using the ${modelId} model"""
    try:
        # Tokenize input
        inputs = tokenizer.encode(request.prompt, return_tensors="pt")
        if torch.cuda.is_available():
            inputs = inputs.cuda()

        # Generate text
        with torch.no_grad():
            outputs = model.generate(
                inputs,
                max_length=inputs.shape[1] + request.max_length,
                temperature=request.temperature,
                do_sample=request.do_sample,
                pad_token_id=tokenizer.eos_token_id
            )

        # Decode response
        generated_text = tokenizer.decode(outputs[0][inputs.shape[1]:], skip_special_tokens=True)

        return GenerationResponse(generated_text=request.prompt + generated_text)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "${modelId.split('/').pop()} API", "model_id": "${modelId}"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)`
  }

  private static generateGradioDemo(modelId: string, prompts: string[]): string {
    return `import gradio as gr
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

def generate_text(prompt, length=100, temperature=0.7):
    """Generate text based on the prompt"""
    try:
        inputs = tokenizer.encode(prompt, return_tensors="pt")
        if torch.cuda.is_available():
            inputs = inputs.cuda()

        outputs = model.generate(
            inputs,
            max_length=inputs.shape[1] + length,
            temperature=temperature,
            do_sample=True,
            pad_token_id=tokenizer.eos_token_id
        )

        generated = tokenizer.decode(outputs[0][inputs.shape[1]:], skip_special_tokens=True)
        return prompt + generated
    except Exception as e:
        return f"Error: {str(e)}"

# Load model
tokenizer = AutoTokenizer.from_pretrained("${modelId}")
model = AutoModelForCausalLM.from_pretrained("${modelId}")

if torch.cuda.is_available():
    model = model.cuda()

# Create Gradio interface
demo = gr.Interface(
    fn=generate_text,
    inputs=[
        gr.Textbox(label="Prompt", value="${prompts[0] || "Once upon a time"}", lines=3),
        gr.Slider(minimum=10, maximum=500, value=100, label="Max Length"),
        gr.Slider(minimum=0.1, maximum=2.0, value=0.7, label="Temperature")
    ],
    outputs=gr.Textbox(label="Generated Text", lines=10),
    title="${modelId.split('/').pop()} Demo",
    description="Interactive demo of the ${modelId} model",
    examples=[
        ["${prompts[0] || "The future of AI is"}", 150, 0.8],
        ["${prompts[1] || "In a world where"}", 200, 0.9],
        ["${prompts[2] || "The most important lesson"}", 100, 0.6]
    ]
)

if __name__ == "__main__":
    demo.launch()`
  }

  private static generateStreamlitApp(modelId: string, prompts: string[]): string {
    return `import streamlit as st
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

st.set_page_config(
    page_title="${modelId.split('/').pop()} Dashboard",
    page_icon="🤖",
    layout="wide"
)

st.title("${modelId.split('/').pop()} Interactive Dashboard")
st.markdown(f"Powered by `{modelId}`")

@st.cache_resource
def load_model():
    """Load and cache the model"""
    tokenizer = AutoTokenizer.from_pretrained("${modelId}")
    model = AutoModelForCausalLM.from_pretrained("${modelId}")

    if torch.cuda.is_available():
        model = model.cuda()

    return tokenizer, model

# Load model
tokenizer, model = load_model()

def generate_text(prompt, max_length=100, temperature=0.7):
    """Generate text based on prompt"""
    inputs = tokenizer.encode(prompt, return_tensors="pt")
    if torch.cuda.is_available():
        inputs = inputs.cuda()

    with torch.no_grad():
        outputs = model.generate(
            inputs,
            max_length=inputs.shape[1] + max_length,
            temperature=temperature,
            do_sample=True,
            pad_token_id=tokenizer.eos_token_id
        )

    generated = tokenizer.decode(outputs[0][inputs.shape[1]:], skip_special_tokens=True)
    return prompt + generated

# Sidebar for controls
st.sidebar.header("Generation Controls")

prompt = st.sidebar.text_area(
    "Enter your prompt:",
    value="${prompts[0] || "The future of artificial intelligence is"}",
    height=100
)

max_length = st.sidebar.slider("Max Length", 10, 500, 100)
temperature = st.sidebar.slider("Temperature", 0.1, 2.0, 0.7)

# Main content area
col1, col2 = st.columns([1, 1])

with col1:
    st.subheader("Input")
    st.text(prompt)

    if st.sidebar.button("Generate", type="primary"):
        with st.spinner("Generating text..."):
            generated_text = generate_text(prompt, max_length, temperature)

        with col2:
            st.subheader("Output")
            st.write(generated_text)

            # Download button
            st.download_button(
                label="Download Text",
                data=generated_text,
                file_name="generated_text.txt",
                mime="text/plain"
            )

# Model information
st.sidebar.markdown("---")
st.sidebar.subheader("Model Information")
st.sidebar.write(f"**Model:** {modelId}")
st.sidebar.write(f"**Device:** {'CUDA' if torch.cuda.is_available() else 'CPU'}")`
  }

  private static generateBasicInterface(modelId: string): string {
    return `from transformers import AutoTokenizer, AutoModelForCausalLM

# Load model and tokenizer
tokenizer = AutoTokenizer.from_pretrained("${modelId}")
model = AutoModelForCausalLM.from_pretrained("${modelId}")

def generate_text(prompt, max_length=100):
    """Basic text generation function"""
    inputs = tokenizer.encode(prompt, return_tensors="pt")
    outputs = model.generate(
        inputs,
        max_length=inputs.shape[1] + max_length,
        temperature=0.7,
        do_sample=True,
        pad_token_id=tokenizer.eos_token_id
    )

    generated = tokenizer.decode(outputs[0][inputs.shape[1]:], skip_special_tokens=True)
    return prompt + generated

# Example usage
if __name__ == "__main__":
    prompt = "The future of AI is"
    result = generate_text(prompt)
    print(result)`
  }
}

// Main notebook generation function
export async function generateNotebookFromRecipe(recipe: Recipe, hfModelId: string): Promise<any> {
  try {
    // Fetch model information and README
    const modelInfo = await HuggingFaceAPI.getModelInfo(hfModelId)
    const readmeContent = await HuggingFaceAPI.getREADME(hfModelId, modelInfo?.sha)

    // Extract code from README
    let readmeCodeExamples: string[] = []
    if (readmeContent) {
      readmeCodeExamples = CodeProcessor.extractPythonBlocks(readmeContent)
    }

    // Generate notebook cells
    const cells = []

    // Cell 1: Title and Recipe Summary
    cells.push({
      cell_type: 'markdown',
      metadata: {},
      source: [
        `# Alacard | ${recipe.modelCard.name} - ${recipe.topicCard.name} (${recipe.difficultyCard.level})\n\n`,
        `## 📋 Recipe Summary\n\n`,
        `- **🤖 Model**: ${recipe.modelCard.name} (${recipe.modelCard.pipeline_tag})\n`,
        `- **🎯 Topic**: ${recipe.topicCard.icon} ${recipe.topicCard.name}\n`,
        `- **📚 Difficulty**: ${recipe.difficultyCard.name}\n`,
        `- **🖥️ UI Component**: ${recipe.uiComponentCard.name}\n`,
        `- **💬 Prompts**: ${recipe.promptCards.name}\n\n`,
        `> ${recipe.topicCard.description}\n\n`,
        `---\n\n`,
        `*Generated by Alacard - AI Manuals for AI Models*`
      ]
    })

    // Cell 2: Environment Setup
    const requirements = getRequirementsForUI(recipe.uiComponentCard)
    cells.push({
      cell_type: 'code',
      execution_count: null,
      metadata: {},
      outputs: [],
      source: [
        '# Environment Setup\n',
        requirements,
        'import torch\n',
        'from transformers import *\n',
        'import warnings\n',
        'warnings.filterwarnings("ignore")\n\n',
        '# Check if GPU is available\n',
        'device = "cuda" if torch.cuda.is_available() else "cpu"\n',
        'print(f"Using device: {device}")\n'
      ]
    })

    // Cell 3: Model Loading (Hello World)
    const modelLoadingCode = generateModelLoadingCode(recipe.modelCard, recipe.difficultyCard)
    cells.push({
      cell_type: 'code',
      execution_count: null,
      metadata: {},
      outputs: [],
      source: modelLoadingCode
    })

    // Cell 4: Model Information
    cells.push({
      cell_type: 'markdown',
      metadata: {},
      source: [
        `## 🤖 Model Information\n\n`,
        `**Model ID**: \`${hfModelId}\`\n\n`,
        `**Pipeline Tag**: ${recipe.modelCard.pipeline_tag}\n\n`,
        `**Downloads**: ${recipe.modelCard.downloads.toLocaleString()}\n\n`,
        `**License**: ${recipe.modelCard.license || 'Unknown'}\n\n`,
        `**Tags**: ${recipe.modelCard.tags.join(', ')}\n\n`,
        `---\n\n`,
        `## 💡 Usage Notes\n\n`,
        `This model is optimized for **${recipe.topicCard.name.toLowerCase()}** use cases. `
      ]
    })

    // Cell 5: README Examples (if available)
    if (readmeCodeExamples.length > 0) {
      const readmeExample = CodeProcessor.customizeForDifficulty(
        readmeCodeExamples[0],
        recipe.difficultyCard
      )
      const topicExample = CodeProcessor.reframeForTopic(
        readmeExample,
        recipe.topicCard,
        recipe.promptCards.prompts[0]
      )

      cells.push({
        cell_type: 'code',
        execution_count: null,
        metadata: {},
        outputs: [],
        source: [
          '# README Example (Customized for this recipe)\n',
          topicExample
        ]
      })
    }

    // Cell 6: Custom Examples
    const customExample = generateCustomExample(recipe)
    cells.push({
      cell_type: 'code',
      execution_count: null,
      metadata: {},
      outputs: [],
      source: customExample
    })

    // Cell 7: UI Component Implementation
    const uiCode = UIComponentGenerator.generateCode(
      recipe.uiComponentCard,
      hfModelId,
      recipe.promptCards.prompts
    )
    cells.push({
      cell_type: 'code',
      execution_count: null,
      metadata: {},
      outputs: [],
      source: [
        '# UI Component Implementation\n',
        uiCode
      ]
    })

    // Cell 8: Next Steps
    cells.push({
      cell_type: 'markdown',
      metadata: {},
      source: [
        `## 🚀 Next Steps\n\n`,
        `### Try These Prompts:\n\n`,
        recipe.promptCards.prompts.map((prompt, i) => `${i + 1}. "${prompt}"`).join('\n'),
        `\n\n`,
        `### Remix This Recipe\n\n`,
        `1. Visit [this notebook's share page](./) to remix\n`,
        `2. Change the topic, difficulty, or UI component\n`,
        `3. Generate a new customized notebook\n\n`,
        `### Learn More\n\n`,
        `- [Model Documentation](https://huggingface.co/${hfModelId})\n`,
        `- [Hugging Face Transformers Docs](https://huggingface.co/docs/transformers/)\n`,
        `- [Alacard Community](./trending)\n\n`,
        `---\n\n`,
        `*Happy learning! 🎉*`
      ]
    })

    // Return complete notebook
    return {
      cells: cells,
      metadata: {
        kernelspec: {
          display_name: 'Python 3',
          language: 'python',
          name: 'python3'
        },
        language_info: {
          name: 'python',
          version: '3.8.5'
        },
        authors: [{
          name: 'Alacard',
          email: 'hello@alacard.ai'
        }],
        title: `${recipe.modelCard.name} - ${recipe.topicCard.name}`,
        recipe: recipe,
        generated_at: new Date().toISOString()
      },
      nbformat: 4,
      nbformat_minor: 5
    }

  } catch (error) {
    console.error('Error generating notebook:', error)
    // Return a basic notebook as fallback
    return generateFallbackNotebook(recipe, hfModelId)
  }
}

// Helper functions
function getRequirementsForUI(uiComponent: UIComponentCard): string {
  const baseRequirements = '!pip install transformers torch\n'

  switch (uiComponent.type) {
    case 'gradio_demo':
      return baseRequirements + '!pip install gradio\n'
    case 'streamlit_app':
      return baseRequirements + '!pip install streamlit\n'
    case 'api_endpoint':
      return baseRequirements + '!pip install fastapi uvicorn\n'
    default:
      return baseRequirements
  }
}

function generateModelLoadingCode(modelCard: ModelCard, difficulty: DifficultyCard): string {
  let code = `# Load ${modelCard.name}\n`
  code += `model_id = "${modelCard.modelId}"\n\n`

  if (modelCard.pipeline_tag.includes('text-generation') || modelCard.pipeline_tag === 'conversational') {
    code += `# Load tokenizer and model for text generation\n`
    code += `tokenizer = AutoTokenizer.from_pretrained(model_id)\n`
    code += `model = AutoModelForCausalLM.from_pretrained(model_id)\n`
  } else if (modelCard.pipeline_tag === 'classification') {
    code += `# Load pipeline for classification\n`
    code += `classifier = pipeline("text-classification", model=model_id)\n`
  } else if (modelCard.pipeline_tag === 'summarization') {
    code += `# Load pipeline for summarization\n`
    code += `summarizer = pipeline("summarization", model=model_id)\n`
  } else {
    code += `# Load tokenizer and model\n`
    code += `tokenizer = AutoTokenizer.from_pretrained(model_id)\n`
    code += `model = AutoModelForSequenceClassification.from_pretrained(model_id)\n`
  }

  code += `\n# Move to GPU if available\n`
  code += `if torch.cuda.is_available():\n`
  code += `    if 'model' in locals():\n`
  code += `        model = model.to(device)\n`
  code += `    print("✅ Model loaded on GPU")\n`
  code += `else:\n`
  code += `    print("ℹ️ Using CPU (consider using a GPU for better performance)")\n`

  return CodeProcessor.customizeForDifficulty(code, difficulty)
}

function generateCustomExample(recipe: Recipe): string {
  const prompt = recipe.promptCards.prompts[0]
  let code = `# Custom Example: ${recipe.topicCard.name}\n`

  if (recipe.modelCard.pipeline_tag.includes('text-generation')) {
    code += `\n# Generate text based on ${recipe.topicCard.name.toLowerCase()}\n`
    code += `prompt = "${CodeProcessor.reframeForTopic(prompt, recipe.topicCard, prompt)}"\n\n`

    code += `# Tokenize input\n`
    code += `inputs = tokenizer.encode(prompt, return_tensors="pt").to(device)\n\n`

    code += `# Generate response\n`
    code += `with torch.no_grad():\n`
    code += `    outputs = model.generate(\n`
    code += `        inputs,\n`
    code += `        max_length=inputs.shape[1] + 100,\n`
    code += `        temperature=0.7,\n`
    code += `        do_sample=True,\n`
    code += `        pad_token_id=tokenizer.eos_token_id\n`
    code += `    )\n\n`

    code += `# Decode and print result\n`
    code += `generated_text = tokenizer.decode(outputs[0][inputs.shape[1]:], skip_special_tokens=True)\n`
    code += `print(f"Prompt: {prompt}")\n`
    code += `print(f"Generated: {generated_text}")\n`
  }

  return CodeProcessor.customizeForDifficulty(code, recipe.difficultyCard)
}

function generateFallbackNotebook(recipe: Recipe, hfModelId: string): any {
  return {
    cells: [
      {
        cell_type: 'markdown',
        metadata: {},
        source: [
          `# ${recipe.modelCard.name} - ${recipe.topicCard.name}\n\n`,
          `Generated by Alacard with recipe: ${recipe.modelCard.name} + ${recipe.topicCard.name}`
        ]
      },
      {
        cell_type: 'code',
        execution_count: null,
        metadata: {},
        outputs: [],
        source: [
          `# Basic notebook for ${hfModelId}\n`,
          `print("Hello from ${recipe.modelCard.name}!")\n`
        ]
      }
    ],
    metadata: {
      kernelspec: { display_name: 'Python 3', language: 'python', name: 'python3' }
    },
    nbformat: 4,
    nbformat_minor: 5
  }
}