-- 🚀 MELHORIAS AVANÇADAS DO BANCO DE DADOS
-- Execute isto no SQL Editor do Supabase

-- ============================================
-- 1. COLUNAS ADICIONAIS ÚTEIS
-- ============================================

-- Adicionar colunas que podem ser úteis
ALTER TABLE memories 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT;

-- ============================================
-- 2. ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índices para buscas frequentes
CREATE INDEX IF NOT EXISTS idx_memories_created_at_desc ON memories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memories_is_favorite ON memories(is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS idx_memories_category ON memories(category);

-- ============================================
-- 3. TRIGGER AUTOMÁTICO PARA updated_at
-- ============================================

-- Criar função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger
DROP TRIGGER IF EXISTS update_memories_updated_at ON memories;
CREATE TRIGGER update_memories_updated_at
    BEFORE UPDATE ON memories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. FUNÇÕES ÚTEIS
-- ============================================

-- Função para buscar memórias por período
CREATE OR REPLACE FUNCTION get_memories_by_date_range(
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE
)
RETURNS SETOF memories AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM memories
    WHERE memories.created_at >= start_date
      AND memories.created_at <= end_date
      AND memories.is_deleted = false
    ORDER BY memories.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Função para buscar memórias favoritadas
CREATE OR REPLACE FUNCTION get_favorite_memories()
RETURNS SETOF memories AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM memories
    WHERE memories.is_favorite = true
      AND memories.is_deleted = false
    ORDER BY memories.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Função para buscar memórias por categoria
CREATE OR REPLACE FUNCTION get_memories_by_category(mem_category TEXT)
RETURNS SETOF memories AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM memories
    WHERE memories.category = mem_category
      AND memories.is_deleted = false
    ORDER BY memories.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. VIEW PARA STATS
-- ============================================

-- Criar view com estatísticas
CREATE OR REPLACE VIEW memories_stats AS
SELECT 
    COUNT(*) as total_memories,
    COUNT(CASE WHEN is_favorite = true THEN 1 END) as total_favorites,
    COUNT(CASE WHEN is_deleted = true THEN 1 END) as deleted_memories,
    MIN(created_at) as first_memory_date,
    MAX(created_at) as last_memory_date
FROM memories;

-- ============================================
-- 6. POLÍTICAS RLS ATUALIZADAS
-- ============================================

-- Atualizar políticas para usar as novas colunas
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow Read" ON memories;
DROP POLICY IF EXISTS "Allow Insert" ON memories;
DROP POLICY IF EXISTS "Allow Update" ON memories;
DROP POLICY IF EXISTS "Allow Delete" ON memories;

CREATE POLICY "Allow Read" ON memories FOR SELECT USING (true);
CREATE POLICY "Allow Insert" ON memories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow Update" ON memories FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow Delete" ON memories FOR DELETE USING (true);

-- ✅ Banco de dados melhorado!
