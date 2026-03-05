# 🚀 Guia de Configuração do Supabase para Sincronização Multi-Dispositivo

## O que você conseguirá fazer:
✅ Adicionar fotos em um celular e elas aparecerem automaticamente no outro  
✅ Editar legendas e sincronizar em tempo real  
✅ Deletar fotos e a ação sincronizar entre todos os dispositivos  
✅ Funciona offline e sincroniza quando voltar online  

---

## 📧 Passo 1: Criar Conta no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Clique em **"Sign Up"** com email ou GitHub
3. Confirme seu email
4. Crie um novo projeto:
   - **Project Name**: `nossa-historia` (ou outro nome)
   - **Database Password**: Guarde bem esta senha
   - **Region**: Escolha a mais próxima do Brasil (São Paulo ou mais próximo)

⏳ Aguarde alguns minutos enquanto o projeto é criado...

---

## 🔑 Passo 2: Pegar as Credenciais

Quando o projeto estiver pronto:

1. Vá em **"Settings"** no menu lateral → **"API"**
2. Copie estas informações:
   - **Project URL** (aparece como `API URL`)
   - **Anon Key** (a chave pública, NÃO a service role key!)

Exemplo:
```
URL: https://seu-projeto.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🗄️ Passo 3: Criar a Tabela no Banco de Dados

1. No painel do Supabase, vá em **"SQL Editor"**
2. Clique em **"New Query"**
3. **Copie e Cole** este código SQL inteiro:

```sql
-- Criar tabela de fotos compartilhadas
CREATE TABLE fotos_compartilhadas (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  foto TEXT NOT NULL,
  legenda TEXT NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  usuario_id TEXT DEFAULT 'anonimo',
  deletado BOOLEAN DEFAULT FALSE
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE fotos_compartilhadas ENABLE ROW LEVEL SECURITY;

-- Permitir todos os usuários ler
CREATE POLICY "Permitir leitura" ON fotos_compartilhadas
  FOR SELECT USING (true);

-- Permitir todos os usuários inserir
CREATE POLICY "Permitir inserção" ON fotos_compartilhadas
  FOR INSERT WITH CHECK (true);

-- Permitir deletar
CREATE POLICY "Permitir delete" ON fotos_compartilhadas
  FOR DELETE USING (true);

-- Permitir atualizar
CREATE POLICY "Permitir update" ON fotos_compartilhadas
  FOR UPDATE USING (true);
```

4. Clique em **"Run"** ou pressione **Ctrl + Enter**
5. Se aparecer ✅, funcionou!

---

## 📦 Passo 4: Criar Bucket no Storage (OBRIGATÓRIO para fotos)

**Este passo é ESSENCIAL para que as fotos sincronizem entre dispositivos!**

1. No painel do Supabase, vá em **"Storage"** no menu lateral
2. Clique em **"New bucket"**
3. Configure:
   - **Bucket name**: `fotos` (exactamente este nome!)
   - **Public bucket**: ✅ Marque como público
4. Clique em **"Create bucket"**

### Configurar permissões do Bucket:

**Forma mais fácil - usando a interface do Supabase:**

1. Clique no bucket `fotos` que você criou
2. Vá na aba **"Policies"**
3. Para CADA policy, clique em **"Add Policy"** e configure:

#### Policy 1 - Leitura:
- **Policy name**: `Public Read`
- **Select**: `SELECT`
- **Target roles**: leave empty or select `anon`
- **USING expression**: `bucket_id = 'fotos'`
- Clique em **"Save Policy"**

#### Policy 2 - Upload:
- **Policy name**: `Public Upload`
- **Select**: `INSERT`
- **Target roles**: leave empty or select `anon`
- **WITH CHECK expression**: `bucket_id = 'fotos'`
- Clique em **"Save Policy"**

#### Policy 3 - Delete:
- **Policy name**: `Public Delete`
- **Select**: `DELETE`
- **Target roles**: leave empty or select `anon`
- **USING expression**: `bucket_id = 'fotos'`
- Clique em **"Save Policy"**

**Se preferir usar SQL, execute uma política por vez:**

```sql
-- Apenas LEITURA
CREATE POLICY "Public Read" ON storage.objects
FOR SELECT USING (bucket_id = 'fotos');
```

```sql
-- Apenas UPLOAD  
CREATE POLICY "Public Upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'fotos');
```

```sql
-- Apenas DELETE
CREATE POLICY "Public Delete" ON storage.objects
FOR DELETE USING (bucket_id = 'fotos');
```

---

##  Passo 5: Configurar o Código HTML

No arquivo `index.html`, encontre esta seção:

```javascript
// ⚠️ CONFIGURE AQUI COM SUAS CREDENCIAIS DO SUPABASE
const SUPABASE_URL = 'https://seu-projeto.supabase.co'; // Substitua com seu URL
const SUPABASE_KEY = 'sua-chave-anonima-aqui'; // Substitua com sua Anon Key
```

**Substitua com os valores que você copiou no Passo 2:**

```javascript
const SUPABASE_URL = 'https://its7xp9xyzabc123.supabase.co'; // Seu URL real
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9abc...'; // Sua chave real
```

---

## 📱 Passo 6: Fazer Upload para GitHub Pages

1. Salve o arquivo `index.html` atualizado
2. No GitHub:
   - Acesse seu repositório
   - Adicione/atualize o arquivo `index.html`
   - Commit com mensagem: `Integração Supabase para sincronização`
   - Push para `main` branch

3. Aguarde 1-2 minutos para GitHub Pages fazer deploy

---

## ✅ Testar a Sincronização

1. **Celular 1**: Abra seu app no navegador
   - Clique em "Clica aqui neném"
   - Vá até o final do carrossel
   - Adicione uma foto com legenda

2. **Celular 2**: Abra a mesma URL no navegador
   - Aguarde 2-3 segundos
   - A foto deve aparecer automaticamente! 🎉

---

## 🐛 Troubleshooting

### "Erro ao sincronizar" ou "Cannot read property 'from'"
- **Solução**: Verifique se as credenciais SUPABASE_URL e SUPABASE_KEY estão corretas
- Não copie com espaços extra!

### Fotos não aparecem no outro celular
- **Verifique se criou o bucket no Storage** (Passo 4)
- **Verifique se as políticas do Storage foram criadas**
- Verifique se ambos os celulares estão no mesmo Wi-Fi (primeiro teste)
- Recarregue a página (F5 ou Ctrl+R)
- Abra o navegador com câmera de desenvolvedor (F12) para ver logs

### "RLS policy" error
- Significa que o SQL não foi executado corretamente
- Tente executar novamente no SQL Editor do Supabase
- Se falhar, delete a tabela e crie novamente

### "Bucket not found" ou erro no upload
- O bucket `fotos` não foi criado no Storage
- Siga o Passo 4 novamente

---

## 🔐 Segurança (Importante)

⚠️ **NUNCA compartilhe a service role key!**  
✅ Use apenas a **Anon Key** (chave pública)  
✅ As policy do RLS já estão configuradas para segurança

---

## 📞 Suporte

Se tiver problemas:
1. Verifique o Console do navegador (F12 → Console)
2. Procure por mensagens vermelhas (errors)
3. Verifique se a tabela foi criada em Database → Tables do Supabase
4. **Verifique se o bucket foi criado em Storage**

---

**Pronto!** Agora você tem sincronização em tempo real entre dispositivos! 💕
