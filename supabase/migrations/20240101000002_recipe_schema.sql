-- Alacard Recipe-Based Migration
-- Update notebooks table to support recipe cards and community features

-- Add recipe and community columns to notebooks table
ALTER TABLE public.notebooks
ADD COLUMN IF NOT EXISTS recipe JSONB,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS remix_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Create card_presets table for curated card options
CREATE TABLE IF NOT EXISTS public.card_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_type TEXT NOT NULL,  -- 'model', 'prompt', 'topic', 'difficulty', 'ui_component'
  card_data JSONB NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create collections table for user organization (Post-MVP)
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  notebook_ids UUID[] DEFAULT array[]::uuid[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Update indexes for new features
CREATE INDEX IF NOT EXISTS notebooks_recipe_idx ON public.notebooks USING GIN (recipe);
CREATE INDEX IF NOT EXISTS notebooks_remix_idx ON public.notebooks(remix_count DESC);
CREATE INDEX IF NOT EXISTS notebooks_user_idx ON public.notebooks(user_id);
CREATE INDEX IF NOT EXISTS notebooks_public_idx ON public.notebooks(is_public) WHERE is_public = true;

-- Card preset indexes
CREATE INDEX IF NOT EXISTS card_presets_type_idx ON public.card_presets(card_type);
CREATE INDEX IF NOT EXISTS card_presets_featured_idx ON public.card_presets(is_featured, sort_order);

-- Collection indexes
CREATE INDEX IF NOT EXISTS collections_user_idx ON public.collections(user_id);

-- Insert initial card presets
INSERT INTO public.card_presets (card_type, card_data, is_featured, sort_order) VALUES
-- Difficulty Cards
('difficulty', '{"level": "beginner", "name": "🌱 Beginner", "description": "Lots of comments, step-by-step explanations", "commentDensity": 0.8, "explanationDepth": "high"}', true, 1),
('difficulty', '{"level": "intermediate", "name": "🌿 Intermediate", "description": "Moderate comments, assumes basic knowledge", "commentDensity": 0.4, "explanationDepth": "medium"}', true, 2),
('difficulty', '{"level": "advanced", "name": "🌳 Advanced", "description": "Minimal comments, production patterns", "commentDensity": 0.1, "explanationDepth": "low"}', true, 3),

-- Topic Cards
('topic', '{"id": "sourdough", "name": "🍞 Sourdough Bread Making", "description": "Baking instructions and recipe analysis", "icon": "🍞"}', true, 1),
('topic', '{"id": "healthcare", "name": "🏥 Healthcare", "description": "Medical Q&A and health analysis", "icon": "🏥"}', true, 2),
('topic', '{"id": "gamedev", "name": "🎮 Game Development", "description": "Game design and interactive storytelling", "icon": "🎮"}', true, 3),
('topic', '{"id": "finance", "name": "💼 Business Finance", "description": "Financial analysis and business insights", "icon": "💼"}', true, 4),
('topic', '{"id": "education", "name": "🎓 Education", "description": "Learning and educational content", "icon": "🎓"}', true, 5),

-- UI Component Cards
('ui_component', '{"type": "chat_interface", "name": "💬 Chat Interface", "description": "Conversational UI with message history", "features": ["message_history", "streaming"], "complexity": "moderate"}', true, 1),
('ui_component', '{"type": "api_endpoint", "name": "🔌 API Endpoint", "description": "FastAPI/Flask wrapper for model", "features": ["rest_api", "error_handling"], "complexity": "simple"}', true, 2),
('ui_component', '{"type": "gradio_demo", "name": "🖥️ Gradio Demo", "description": "Interactive web UI", "features": ["web_interface", "real_time"], "complexity": "simple"}', true, 3),
('ui_component', '{"type": "streamlit_app", "name": "📊 Streamlit App", "description": "Full dashboard application", "features": ["dashboard", "data_viz"], "complexity": "complex"}', true, 4),

-- Prompt Card Packs
('prompt', '{"id": "quick_start", "name": "🚀 Quick Start", "description": "Basic hello world examples", "category": "basics", "prompts": ["Hello, how are you?", "Introduce yourself", "What can you do?"]}', true, 1),
('prompt', '{"id": "real_world", "name": "🌍 Real World", "description": "Practical everyday use cases", "category": "practical", "prompts": ["Summarize this text", "Analyze this data", "Help me decide"]}', true, 2),
('prompt', '{"id": "creative", "name": "✨ Creative", "description": "Fun and imaginative prompts", "category": "creative", "prompts": ["Write a story about", "Create a poem about", "Imagine a world where"]}', true, 3),
('prompt', '{"id": "technical", "name": "🔧 Technical", "description": "Programming and technical tasks", "category": "technical", "prompts": ["Debug this code", "Explain this concept", "Optimize this function"]}', true, 4)

ON CONFLICT DO NOTHING;

-- Grant permissions for new tables
GRANT ALL ON public.card_presets TO authenticated;
GRANT ALL ON public.card_presets TO anon;
GRANT ALL ON public.collections TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Verify migration success
SELECT 'Recipe-based schema migration completed successfully' as status,
       (SELECT COUNT(*) FROM public.card_presets) as card_presets_created;