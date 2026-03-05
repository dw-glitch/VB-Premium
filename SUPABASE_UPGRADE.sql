-- 🚀 UPGRADE DO BANCO DE DADOS - Execute isto no SQL Editor do Supabase
-- Copie TUDO abaixo e cole no: supabase.com → SQL Editor → New Query

-- ===== 1. ADICIONAR NOVAS COLUNAS =====
ALTER TABLE memories 
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'outro';

-- ===== 2. CRIAR ÍNDICES PARA PERFORMANCE =====
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memories_is_deleted ON memories(is_deleted);
CREATE INDEX IF NOT EXISTS idx_memories_is_favorite ON memories(is_favorite);
CREATE INDEX IF NOT EXISTS idx_memories_display_order ON memories(display_order);

-- ===== 3. ATUALIZAR POLÍTICAS RLS PARA SOFT DELETE =====
DROP POLICY IF EXISTS "Public Read" ON memories;
DROP POLICY IF EXISTS "Public Insert" ON memories;
DROP POLICY IF EXISTS "Public Update" ON memories;
DROP POLICY IF EXISTS "Public Delete" ON memories;

CREATE POLICY "Public Read - Not Deleted" ON memories
  FOR SELECT USING (is_deleted = false);

CREATE POLICY "Public Insert" ON memories
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Update" ON memories
  FOR UPDATE USING (is_deleted = false);

CREATE POLICY "Public Delete - Soft Delete" ON memories
  FOR UPDATE 
  USING (is_deleted = false)
  WITH CHECK (true);

-- ===== 4. POPULAR display_order PARA MEMÓRIAS EXISTENTES =====
-- Usar CTE para evitar erro com window functions
WITH ordered_memories AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as calc_order
  FROM memories
  WHERE display_order = 0
)
UPDATE memories 
SET display_order = ordered_memories.calc_order
FROM ordered_memories
WHERE memories.id = ordered_memories.id;

-- ✅ Pronto! A tabela foi atualizada com sucesso!
