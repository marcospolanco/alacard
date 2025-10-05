export const mockModels = [
  {
    id: 'meta-llama-3.1-8b',
    name: 'Llama 3.1 8B',
    vendor: 'meta-llama',
    modelId: 'meta-llama/Llama-3.1-8B-Instruct',
    description: 'Powerful instruction-following model with excellent reasoning capabilities',
    downloads: '2.1M',
    category: 'Text Generation',
    capabilities: ['Chat', 'Code', 'Reasoning']
  },
  {
    id: 'gpt2',
    name: 'GPT-2',
    vendor: 'openai',
    modelId: 'openai-community/gpt2',
    description: 'Classic generative model, perfect for learning and experimentation',
    downloads: '5.8M',
    category: 'Text Generation',
    capabilities: ['Generation', 'Completion']
  },
  {
    id: 'bert-base',
    name: 'BERT Base',
    vendor: 'google',
    modelId: 'google-bert/bert-base-uncased',
    description: 'Foundational encoder model for classification and understanding tasks',
    downloads: '12.3M',
    category: 'Classification',
    capabilities: ['Classification', 'NER', 'QA']
  },
  {
    id: 'stable-code-3b',
    name: 'Stable Code 3B',
    vendor: 'stabilityai',
    modelId: 'stabilityai/stable-code-3b',
    description: 'Specialized coding model with multi-language support',
    downloads: '890K',
    category: 'Code Generation',
    capabilities: ['Code', 'Completion', 'Debug']
  },
  {
    id: 'whisper-small',
    name: 'Whisper Small',
    vendor: 'openai',
    modelId: 'openai/whisper-small',
    description: 'Speech recognition model with multilingual capabilities',
    downloads: '3.2M',
    category: 'Speech',
    capabilities: ['Transcription', 'Translation']
  },
  {
    id: 'distilbert-base',
    name: 'DistilBERT',
    vendor: 'distilbert',
    modelId: 'distilbert/distilbert-base-uncased',
    description: 'Lightweight BERT alternative with 97% performance, 60% size',
    downloads: '4.1M',
    category: 'Classification',
    capabilities: ['Classification', 'Fast Inference']
  }
];

export const mockPrompts = [
  {
    id: 'creative-writing',
    name: 'Creative Writing',
    theme: '✍️',
    description: 'Story generation, poetry, and creative content prompts',
    prompts: [
      'Write a short story about a robot discovering emotions',
      'Generate a poem about the beauty of code',
      'Create a dialogue between two AI systems meeting for the first time'
    ],
    tags: ['Creative', 'Storytelling', 'Poetry']
  },
  {
    id: 'code-assistant',
    name: 'Code Assistant',
    theme: '👨‍💻',
    description: 'Programming help, debugging, and code explanation prompts',
    prompts: [
      'Explain this Python function and suggest improvements',
      'Debug this JavaScript code and fix any issues',
      'Generate unit tests for the given function'
    ],
    tags: ['Programming', 'Debug', 'Testing']
  },
  {
    id: 'data-analysis',
    name: 'Data Analysis',
    theme: '📊',
    description: 'Data exploration, visualization, and insights prompts',
    prompts: [
      'Analyze this dataset and identify key trends',
      'Generate a visualization for this data',
      'Summarize the main insights from these statistics'
    ],
    tags: ['Analytics', 'Visualization', 'Insights']
  },
  {
    id: 'education',
    name: 'Educational',
    theme: '🎓',
    description: 'Learning, tutoring, and explanation prompts',
    prompts: [
      'Explain quantum computing in simple terms',
      'Create a quiz about machine learning concepts',
      'Break down this complex topic into digestible parts'
    ],
    tags: ['Learning', 'Teaching', 'Explanation']
  },
  {
    id: 'business',
    name: 'Business Intelligence',
    theme: '💼',
    description: 'Market analysis, strategy, and business prompts',
    prompts: [
      'Analyze this market trend and its implications',
      'Generate a SWOT analysis for this scenario',
      'Create a business strategy based on these insights'
    ],
    tags: ['Strategy', 'Analysis', 'Planning']
  },
  {
    id: 'research',
    name: 'Research Assistant',
    theme: '🔬',
    description: 'Academic research, summarization, and citation prompts',
    prompts: [
      'Summarize this research paper in key points',
      'Generate research questions for this topic',
      'Compare and contrast these different approaches'
    ],
    tags: ['Research', 'Academic', 'Summary']
  }
];

export const mockTopics = [
  { id: 'healthcare', name: 'Healthcare', emoji: '🏥' },
  { id: 'finance', name: 'Finance', emoji: '💰' },
  { id: 'education', name: 'Education', emoji: '📚' },
  { id: 'technology', name: 'Technology', emoji: '💻' },
  { id: 'environment', name: 'Environment', emoji: '🌱' },
  { id: 'entertainment', name: 'Entertainment', emoji: '🎬' },
  { id: 'sports', name: 'Sports', emoji: '⚽' },
  { id: 'travel', name: 'Travel', emoji: '✈️' },
  { id: 'food', name: 'Food & Cooking', emoji: '🍳' },
  { id: 'science', name: 'Science', emoji: '🔬' },
  { id: 'art', name: 'Art & Design', emoji: '🎨' },
  { id: 'music', name: 'Music', emoji: '🎵' }
];

export const mockDifficulties = [
  {
    id: 'easy',
    level: 'Easy',
    emoji: '🌱',
    description: 'Basic setup and simple examples. Perfect for getting started.',
    features: ['Simple imports', 'Basic usage', 'Clear documentation'],
    estimatedTime: '5-10 min'
  },
  {
    id: 'medium',
    level: 'Medium',
    emoji: '🌿',
    description: 'Intermediate examples with evaluation and customization options.',
    features: ['Custom parameters', 'Evaluation metrics', 'Data preprocessing'],
    estimatedTime: '15-30 min'
  },
  {
    id: 'hard',
    level: 'Hard',
    emoji: '🌳',
    description: 'Advanced techniques, fine-tuning, and production considerations.',
    features: ['Fine-tuning', 'Performance optimization', 'Error handling'],
    estimatedTime: '45-60 min'
  }
];

export const mockComponents = [
  {
    id: 'gradio-chat',
    name: 'Gradio Chat Interface',
    tech: 'Gradio',
    description: 'Interactive chat interface with message history and real-time responses',
    preview: 'gr.ChatInterface(fn=chat_fn)',
    features: ['Chat UI', 'Message History', 'Real-time'],
    useCase: 'Perfect for conversational AI models'
  },
  {
    id: 'streamlit-dashboard',
    name: 'Streamlit Dashboard',
    tech: 'Streamlit',
    description: 'Data visualization dashboard with charts and interactive widgets',
    preview: 'st.plotly_chart(fig)',
    features: ['Charts', 'Widgets', 'Live Updates'],
    useCase: 'Great for data analysis and metrics'
  },
  {
    id: 'gradio-image',
    name: 'Gradio Image Processor',
    tech: 'Gradio',
    description: 'Image upload and processing interface with preview capabilities',
    preview: 'gr.Interface(fn=process, inputs="image")',
    features: ['Image Upload', 'Preview', 'Batch Processing'],
    useCase: 'Ideal for computer vision models'
  },
  {
    id: 'jupyter-widget',
    name: 'Jupyter Interactive Widget',
    tech: 'ipywidgets',
    description: 'Native Jupyter widgets for parameter tuning and exploration',
    preview: '@interact(text=widgets.Text())',
    features: ['Parameter Tuning', 'Live Preview', 'Native Jupyter'],
    useCase: 'Best for research and experimentation'
  },
  {
    id: 'flask-api',
    name: 'Flask API Endpoint',
    tech: 'Flask',
    description: 'RESTful API endpoint for model deployment and integration',
    preview: '@app.route("/predict", methods=["POST"])',
    features: ['REST API', 'JSON Response', 'Deployment Ready'],
    useCase: 'Perfect for production integration'
  },
  {
    id: 'terminal-cli',
    name: 'Command Line Interface',
    tech: 'Click/Typer',
    description: 'Terminal-based interface for batch processing and automation',
    preview: '@click.command()',
    features: ['Batch Processing', 'Automation', 'Scripting'],
    useCase: 'Great for pipeline integration'
  }
];