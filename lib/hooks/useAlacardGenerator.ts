import { useState, useEffect, useCallback, useRef } from 'react';
import { BackendAPI, TaskStatus, ModelInfo } from '../backend-api';

export interface SelectedCards {
  model?: ModelInfo;
  prompt?: any;
  topic?: any;
  difficulty?: any;
  component?: any;
}

export interface GenerationState {
  isGenerating: boolean;
  progress: number;
  currentStep: string;
  taskId: string | null;
  error: string | null;
  validationSummary: any;
}

export const useAlacardGenerator = () => {
  const [selectedCards, setSelectedCards] = useState<SelectedCards>({});
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [showShuffleToast, setShowShuffleToast] = useState(false);
  const [showSharePage, setShowSharePage] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [showRemixScreen, setShowRemixScreen] = useState(false);

  // Generation state
  const [generationState, setGenerationState] = useState<GenerationState>({
    isGenerating: false,
    progress: 0,
    currentStep: '',
    taskId: null,
    error: null,
    validationSummary: null
  });

  const wsRef = useRef<WebSocket | null>(null);

  // Load models on mount
  useEffect(() => {
    loadModels();
  }, []);

  // Clean up WebSocket on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const loadModels = async () => {
    try {
      const modelsData = await BackendAPI.getPopularModels();
      setModels(modelsData);
    } catch (error) {
      console.error('Failed to load models:', error);
      // Use fallback models if API fails
      setModels([
        {
          id: 'gpt2',
          modelId: 'openai-community/gpt2',
          name: 'GPT-2',
          description: 'A transformer-based language model',
          pipeline_tag: 'text-generation',
          downloads: 1000000,
          likes: 5000,
          tags: ['text-generation', 'language-model']
        },
        {
          id: 'distilbert',
          modelId: 'distilbert-base-uncased',
          name: 'DistilBERT Base',
          description: 'A distilled version of BERT',
          pipeline_tag: 'text-classification',
          downloads: 2000000,
          likes: 15000,
          tags: ['text-classification', 'bert', 'lightweight']
        }
      ]);
    }
  };

  const handleCardSelect = useCallback((type: keyof SelectedCards, card: any) => {
    setSelectedCards(prev => ({
      ...prev,
      [type]: prev[type]?.id === card.id ? undefined : card
    }));
  }, []);

  const handleShuffle = useCallback(async () => {
    setIsShuffling(true);
    try {
      // Shuffle models from the loaded models
      if (models.length > 0) {
        const randomModel = models[Math.floor(Math.random() * models.length)];

        // For other cards, we'll use mock data for now (can be extended later)
        const mockPrompts = [
          { id: '1', name: 'Creative Writing', description: 'Prompts for creative writing exercises' },
          { id: '2', name: 'Code Generation', description: 'Prompts for code generation tasks' },
          { id: '3', name: 'Analysis', description: 'Prompts for analytical thinking' }
        ];

        const mockTopics = [
          { id: '1', name: 'Science', description: 'Scientific concepts and experiments', icon: '🔬' },
          { id: '2', name: 'Business', description: 'Business applications and strategies', icon: '💼' },
          { id: '3', name: 'Education', description: 'Educational content and learning', icon: '📚' }
        ];

        const mockDifficulties = [
          { id: '1', name: 'Beginner', description: 'Simple examples and explanations' },
          { id: '2', name: 'Intermediate', description: 'More complex concepts and applications' },
          { id: '3', name: 'Advanced', description: 'Expert-level implementations' }
        ];

        const mockComponents = [
          { id: '1', name: 'Charts', description: 'Data visualization components', complexity: 'medium' },
          { id: '2', name: 'Tables', description: 'Tabular data display', complexity: 'low' },
          { id: '3', name: 'Interactive Widgets', description: 'User interaction elements', complexity: 'high' }
        ];

        const randomPrompt = mockPrompts[Math.floor(Math.random() * mockPrompts.length)];
        const randomTopic = mockTopics[Math.floor(Math.random() * mockTopics.length)];
        const randomDifficulty = mockDifficulties[Math.floor(Math.random() * mockDifficulties.length)];
        const randomComponent = mockComponents[Math.floor(Math.random() * mockComponents.length)];

        setSelectedCards({
          model: randomModel,
          prompt: randomPrompt,
          topic: randomTopic,
          difficulty: randomDifficulty,
          component: randomComponent
        });
      }
    } catch (error) {
      console.error('Error shuffling cards:', error);
    } finally {
      setIsShuffling(false);
      setShowShuffleToast(true);
    }
  }, [models]);

  const handleGenerate = useCallback(async () => {
    if (!selectedCards.model) {
      setGenerationState(prev => ({ ...prev, error: 'Please select a model' }));
      return;
    }

    setGenerationState(prev => ({
      ...prev,
      isGenerating: true,
      progress: 0,
      currentStep: 'Starting notebook generation...',
      error: null,
      taskId: null,
      validationSummary: null
    }));

    try {
      // Start generation
      const response = await BackendAPI.generateNotebook(selectedCards.model.modelId);
      const taskId = response.task_id;

      setGenerationState(prev => ({
        ...prev,
        taskId,
        currentStep: 'Notebook generation started...'
      }));

      // Set up WebSocket for real-time progress
      wsRef.current = BackendAPI.createWebSocketConnection(taskId);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected for real-time progress');
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'progress') {
            setGenerationState(prev => ({
              ...prev,
              progress: data.data.progress,
              currentStep: data.data.current_step || prev.currentStep
            }));
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        // Fall back to polling if WebSocket fails
        pollForCompletion(taskId);
      };

      // Start polling as backup/fallback
      pollForCompletion(taskId);

    } catch (error) {
      setGenerationState(prev => ({
        ...prev,
        isGenerating: false,
        error: error instanceof Error ? error.message : 'Failed to start notebook generation'
      }));
    }
  }, [selectedCards]);

  const pollForCompletion = async (taskId: string) => {
    try {
      const status = await BackendAPI.pollTaskCompletion(
        taskId,
        (status: TaskStatus) => {
          setGenerationState(prev => ({
            ...prev,
            progress: status.progress,
            currentStep: status.current_step || prev.currentStep
          }));
        }
      );

      // Task completed successfully
      setGenerationState(prev => ({
        ...prev,
        isGenerating: false,
        progress: 100,
        currentStep: 'Notebook generated successfully!',
        validationSummary: status.validation_summary
      }));

      // Show share page after a short delay
      setTimeout(() => {
        setShowSharePage(true);
        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }
      }, 1000);

    } catch (error) {
      setGenerationState(prev => ({
        ...prev,
        isGenerating: false,
        error: error instanceof Error ? error.message : 'Generation failed'
      }));
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    }
  };

  const canGenerate = Boolean(selectedCards.model && selectedCards.prompt && selectedCards.topic && selectedCards.difficulty);

  const resetGeneration = () => {
    setGenerationState({
      isGenerating: false,
      progress: 0,
      currentStep: '',
      taskId: null,
      error: null,
      validationSummary: null
    });
  };

  return {
    // State
    selectedCards,
    models,
    isShuffling,
    showShuffleToast,
    showSharePage,
    showGenerator,
    showRemixScreen,
    generationState,
    canGenerate,

    // Actions
    handleCardSelect,
    handleShuffle,
    handleGenerate,
    resetGeneration,
    setSelectedCards,
    setShowShuffleToast,
    setShowSharePage,
    setShowGenerator,
    setShowRemixScreen,
    loadModels
  };
};