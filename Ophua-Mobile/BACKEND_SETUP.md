# ⚙️ Setup Backend (jalane-reimagined)

Este documento descreve como configurar o jalane-reimagined para que o Ophua-Mobile possa consumir suas APIs.

## Visão Geral

O Ophua-Mobile consome dados do jalane-reimagined através do Supabase. Não é necessário criar novos endpoints REST, pois o Supabase fornece automaticamente uma API REST para todas as tabelas.

## Requisitos

- Projeto Supabase configurado e ativo
- Database PostgreSQL com as tabelas necessárias
- RLS (Row Level Security) policies configuradas
- Storage buckets para avatars e covers
- Funções Supabase para operações complexas (opcional)

## 1. Verificar Database Schema

Certifique-se de que as seguintes tabelas existem no Supabase:

### Tabelas Necessárias

```sql
-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  job_title TEXT DEFAULT '',
  company TEXT DEFAULT '',
  address TEXT DEFAULT '',
  primary_email TEXT,
  secondary_email TEXT DEFAULT '',
  mobile_phone TEXT DEFAULT '',
  work_phone TEXT DEFAULT '',
  avatar_url TEXT,
  cover_url TEXT,
  card_lang TEXT DEFAULT 'pt',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Contacts
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  job_title TEXT,
  notes TEXT,
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Contact Exchanges
CREATE TABLE IF NOT EXISTS public.contact_exchanges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  company TEXT DEFAULT '',
  job_title TEXT DEFAULT '',
  message TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Profile Views (Analytics)
CREATE TABLE IF NOT EXISTS public.profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  visitor_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Profile Clicks (Analytics)
CREATE TABLE IF NOT EXISTS public.profile_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  click_type TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 2. Configurar RLS (Row Level Security) Policies

### Profiles - Políticas RLS

```sql
-- Qualquer um pode ler perfils públicos (exceto informações privadas)
CREATE POLICY "Profiles are public for reading" ON public.profiles
  FOR SELECT USING (true);

-- Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Usuários autenticados podem fazer insert na tabela profiles (via trigger)
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### Contacts - Políticas RLS

```sql
-- Usuários só podem ver seus próprios contatos
CREATE POLICY "Users can read own contacts" ON public.contacts
  FOR SELECT USING (auth.uid() = user_id);

-- Usuários autenticados podem criar contatos
CREATE POLICY "Authenticated users can create contacts" ON public.contacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar seus próprios contatos
CREATE POLICY "Users can update own contacts" ON public.contacts
  FOR UPDATE USING (auth.uid() = user_id);

-- Usuários podem deletar seus próprios contatos
CREATE POLICY "Users can delete own contacts" ON public.contacts
  FOR DELETE USING (auth.uid() = user_id);
```

### Contact Exchanges - Políticas RLS

```sql
-- Qualquer um pode enviar contato (sem autenticação)
CREATE POLICY "Anyone can insert contact exchange" ON public.contact_exchanges
  FOR INSERT WITH CHECK (true);

-- Usuários só podem ver exchanges para eles
CREATE POLICY "Users can read own exchanges" ON public.contact_exchanges
  FOR SELECT USING (auth.uid() = owner_id);

-- Usuários podem deletar suas exchanges
CREATE POLICY "Users can delete own exchanges" ON public.contact_exchanges
  FOR DELETE USING (auth.uid() = owner_id);
```

### Profile Views - Políticas RLS

```sql
-- Qualquer um pode registrar uma visualização
CREATE POLICY "Anyone can insert profile view" ON public.profile_views
  FOR INSERT WITH CHECK (true);

-- Usuários autenticados podem ver visualizações do seu perfil
CREATE POLICY "Users can read own views" ON public.profile_views
  FOR SELECT USING (auth.uid() = profile_id);
```

### Profile Clicks - Políticas RLS

```sql
-- Qualquer um pode registrar um clique
CREATE POLICY "Anyone can insert profile click" ON public.profile_clicks
  FOR INSERT WITH CHECK (true);

-- Usuários autenticados podem ver cliques do seu perfil
CREATE POLICY "Users can read own clicks" ON public.profile_clicks
  FOR SELECT USING (auth.uid() = profile_id);
```

## 3. Configurar Storage (Buckets)

### Criar Buckets no Supabase Storage

1. Vá para Storage na console do Supabase
2. Crie dois buckets públicos:
   - `avatars` - para armazenar avatars dos usuários
   - `covers` - para armazenar capas dos cartões

### Políticas de Storage

```sql
-- Avatars
-- Qualquer um pode ler avatars
CREATE POLICY "Public read access for avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Usuários autenticados podem fazer upload
CREATE POLICY "Users can upload avatars" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
  );

-- Covers (similar)
CREATE POLICY "Public read access for covers" ON storage.objects
  FOR SELECT USING (bucket_id = 'covers');

CREATE POLICY "Users can upload covers" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'covers'
    AND auth.uid() IS NOT NULL
  );
```

## 4. Configurar Triggers (Automação)

### Auto-criar Profile no Signup

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, primary_email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Auto-atualizar Updated_at

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
```

## 5. Habilitar Realtime

1. Vá para Realtime na console do Supabase
2. Clique em "Enable Realtime"
3. Selecione as tabelas:
   - profiles
   - contacts
   - contact_exchanges
   - profile_views
   - profile_clicks

## 6. Funções Supabase (Opcional)

### Business Card Scanner Function

Crie uma função Supabase para extrair dados de cartões (ja existe em jalane-reimagined):

```bash
supabase functions new scan-business-card
```

Copie o código de `jalane-reimagined/supabase/functions/scan-business-card/index.ts`.

## 7. Variáveis de Ambiente

Adicione ao `.env` do jalane-reimagined (se ainda não existir):

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-publica
SUPABASE_SERVICE_ROLE_KEY=sua-chave-servico
```

## 8. Testes de Conectividade

### Testar de curl

```bash
# Listar perfils
curl -H "apikey: YOUR_ANON_KEY" \
  "https://seu-projeto.supabase.co/rest/v1/profiles"

# Autenticação
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  "https://seu-projeto.supabase.co/auth/v1/token?grant_type=password"
```

### Testar no Ophua-Mobile

```typescript
import { supabase } from '@/lib/supabase';

// Testar conexão
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .limit(1);

console.log('Connection test:', { data, error });
```

## 9. Checklist de Setup

- [ ] Database schema criado (todas as tabelas)
- [ ] RLS policies configuradas para todas as tabelas
- [ ] Storage buckets criados (avatars, covers)
- [ ] Storage policies configuradas
- [ ] Triggers criados (handle_new_user, update_updated_at)
- [ ] Realtime habilitado
- [ ] Função scan-business-card deployada
- [ ] Variáveis de ambiente configuradas
- [ ] Testes de conectividade passando

## 10. Troubleshooting

### Erro: "Relation does not exist"
- Verificar se a tabela foi criada corretamente
- Executar migrations: `supabase migration up`

### Erro: "Policy violates"
- Verificar RLS policies
- Verifar se usuário tem permissão para a ação

### Erro: "Bucket not found"
- Verificar se o bucket foi criado
- Verificar se o nome do bucket está correto

### Erro: "Function not found"
- Deploy a função: `supabase functions deploy scan-business-card`
- Verificar nome da função

## Recursos

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [RLS Best Practices](https://supabase.com/docs/guides/auth/row-level-security)

---

**Última atualização**: 28/04/2025
