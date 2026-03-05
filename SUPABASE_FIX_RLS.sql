-- 🚀 CORREÇÃO DAS POLÍTICAS RLS - Execute isto no SQL Editor do Supabase
-- Copie TUDO abaixo e cole no: supabase.com → SQL Editor → New Query

-- Primeiro, remova todas as políticas existentes
DROP POLICY IF EXISTS "Public Read - Not Deleted" ON memories;
DROP POLICY IF EXISTS "Public Insert" ON memories;
DROP POLICY IF EXISTS "Public Update" ON memories;
DROP POLICY IF EXISTS "Public Delete - Soft Delete" ON memories;

-- Criar políticas mais permissivas

-- Política de LEITURA - permitir todos
CREATE POLICY "Allow Read" ON memories
  FOR SELECT USING (true);

-- Política de INSERÇÃO - permitir todos
CREATE POLICY "Allow Insert" ON memories
  FOR INSERT WITH CHECK (true);

-- Política de ATUALIZAÇÃO - permitir todos (com validação de is_deleted)
CREATE POLICY "Allow Update" ON memories
  FOR UPDATE USING (true)
  WITH CHECK (true);

-- Política de DELETE - permitir todos
CREATE POLICY "Allow Delete" ON memories
  FOR DELETE USING (true);

-- Verificar se RLS está habilitado
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

-- ✅ Políticas corrigidas!
