# Ophua-Mobile API Documentation

## Visão Geral
O Ophua-Mobile é um aplicativo mobile que consome as APIs do jalane-reimagined. O backend fornece autenticação via Supabase e dados através de endpoints REST/Realtime.

## Configuração Base
- **Base URL**: Supabase (configurado via SUPABASE_URL e SUPABASE_ANON_KEY)
- **Autenticação**: JWT Bearer Token (armazenado no AsyncStorage)
- **Realtime**: WebSockets via Supabase Realtime

## Endpoints de Autenticação

### 1. Login (Email + Password)
```
POST /auth/v1/token?grant_type=password
Headers:
  - Content-Type: application/json
Body:
{
  "email": "user@example.com",
  "password": "password"
}
Response:
{
  "access_token": "jwt_token",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "refresh_token",
  "user": { ... }
}
```

### 2. Signup (Public Signup)
```
POST /functions/v1/public-signup
Headers:
  - Content-Type: application/json
Body:
{
  "email": "newuser@example.com",
  "password": "password",
  "full_name": "User Name"
}
Response:
{
  "ok": true
}
```

### 3. Esqueceu Senha
```
POST /functions/v1/forgot-password
Headers:
  - Content-Type: application/json
Body:
{
  "email": "user@example.com"
}
Response:
{
  "ok": true
}
```

### 4. Refresh Token
```
POST /auth/v1/token?grant_type=refresh_token
Headers:
  - Content-Type: application/json
Body:
{
  "refresh_token": "refresh_token"
}
Response:
{
  "access_token": "new_jwt_token",
  ...
}
```

## Endpoints de Perfil

### 1. Obter Perfil do Usuário Logado
```
GET /rest/v1/profiles?id=eq.{user_id}&select=*
Headers:
  - Authorization: Bearer {jwt_token}
Response:
[{
  "id": "uuid",
  "full_name": "Name",
  "job_title": "Job",
  "company": "Company",
  "address": "Address",
  "primary_email": "email@example.com",
  "secondary_email": "email2@example.com",
  "mobile_phone": "+55...",
  "work_phone": "+55...",
  "avatar_url": "https://...",
  "cover_url": "https://...",
  "card_lang": "pt" | "en",
  "created_at": "2025-04-28T..."
}]
```

### 2. Obter Perfil Público (por ID)
```
GET /rest/v1/profiles?id=eq.{profile_id}&select=*
Response: [{ ... profile data ... }]
```

### 3. Atualizar Perfil
```
PATCH /rest/v1/profiles?id=eq.{user_id}
Headers:
  - Authorization: Bearer {jwt_token}
  - Content-Type: application/json
Body:
{
  "full_name": "New Name",
  "job_title": "New Job",
  "company": "New Company",
  "address": "New Address",
  "primary_email": "newemail@example.com",
  "secondary_email": "secondary@example.com",
  "mobile_phone": "+55...",
  "work_phone": "+55...",
  "card_lang": "pt"
}
Response: [{ updated profile }]
```

### 4. Upload de Avatar/Cover
```
POST /storage/v1/object/profiles/{user_id}/avatar
Headers:
  - Authorization: Bearer {jwt_token}
  - Content-Type: image/jpeg (or png)
Body: binary image data

Response:
{
  "name": "avatar.jpg",
  "id": "file_id",
  "updated_at": "2025-04-28T...",
  ...
}
```

## Endpoints de Contatos

### 1. Listar Contatos do Usuário
```
GET /rest/v1/contacts?user_id=eq.{user_id}&select=*
Headers:
  - Authorization: Bearer {jwt_token}
Response:
[{
  "id": "uuid",
  "user_id": "uuid",
  "name": "Contact Name",
  "email": "contact@example.com",
  "phone": "+55...",
  "company": "Company",
  "job_title": "Job",
  "notes": "Notes",
  "source": "manual" | "received",
  "created_at": "2025-04-28T..."
}]
```

### 2. Criar Contato
```
POST /rest/v1/contacts
Headers:
  - Authorization: Bearer {jwt_token}
  - Content-Type: application/json
Body:
{
  "name": "Contact Name",
  "email": "contact@example.com",
  "phone": "+55...",
  "company": "Company",
  "job_title": "Job",
  "notes": "Notes"
}
Response: { created contact }
```

### 3. Atualizar Contato
```
PATCH /rest/v1/contacts?id=eq.{contact_id}
Headers:
  - Authorization: Bearer {jwt_token}
Response: { updated contact }
```

### 4. Deletar Contato
```
DELETE /rest/v1/contacts?id=eq.{contact_id}
Headers:
  - Authorization: Bearer {jwt_token}
Response: empty
```

## Endpoints de Troca de Contatos

### 1. Enviar Contato (Contact Exchange)
```
POST /rest/v1/contact_exchanges
Headers:
  - Content-Type: application/json
Body:
{
  "owner_id": "uuid (target user)",
  "full_name": "Sender Name",
  "email": "sender@example.com",
  "phone": "+55...",
  "company": "Company",
  "job_title": "Job",
  "message": "Hello, nice to meet you"
}
Response: { created exchange }
```

### 2. Listar Trocas Recebidas
```
GET /rest/v1/contact_exchanges?owner_id=eq.{user_id}&select=*
Headers:
  - Authorization: Bearer {jwt_token}
Response: [{ contact exchanges }]
```

## Endpoints de Analytics

### 1. Registrar Visualização de Perfil
```
POST /rest/v1/profile_views
Headers:
  - Content-Type: application/json
Body:
{
  "profile_id": "uuid",
  "visitor_id": "uuid" (opcional)
}
Response: { created view record }
```

### 2. Registrar Clique no Cartão
```
POST /rest/v1/profile_clicks
Headers:
  - Content-Type: application/json
Body:
{
  "profile_id": "uuid",
  "click_type": "email" | "phone" | "whatsapp" | "address"
}
Response: { created click record }
```

### 3. Obter Estatísticas do Perfil
```
GET /rest/v1/profile_views?profile_id=eq.{user_id}
GET /rest/v1/profile_clicks?profile_id=eq.{user_id}
Headers:
  - Authorization: Bearer {jwt_token}
Response: [{ statistics }]
```

## Endpoints Supabase Functions

### 1. Scan Business Card (OCR)
```
POST /functions/v1/scan-business-card
Headers:
  - Authorization: Bearer {jwt_token}
  - Content-Type: application/json
Body:
{
  "imageBase64": "data:image/jpeg;base64,..."
}
Response:
{
  "name": "Extracted Name",
  "email": "extracted@example.com",
  "phone": "+55...",
  "company": "Company",
  "job_title": "Job",
  "notes": "Additional info"
}
```

## Realtime Subscriptions

### 1. Escutar Mudanças no Perfil
```typescript
const channel = supabase
  .channel(`public:profiles:id=eq.${user_id}`)
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${user_id}` },
    (payload) => {
      console.log('Profile updated:', payload.new)
    }
  )
  .subscribe()
```

### 2. Escutar Novas Trocas de Contato
```typescript
const channel = supabase
  .channel(`public:contact_exchanges:owner_id=eq.${user_id}`)
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'contact_exchanges', filter: `owner_id=eq.${user_id}` },
    (payload) => {
      console.log('New contact exchange:', payload.new)
    }
  )
  .subscribe()
```

## Fluxo de Autenticação Mobile

1. **Login**: Utilizador faz login com email/password
2. **Token Storage**: JWT token armazenado em AsyncStorage
3. **Auto-refresh**: Ao iniciar a app, verifica se o token é válido
4. **Logout**: Remove token do AsyncStorage

## Rate Limiting & Error Handling

- **429 Too Many Requests**: Aguardar e tentar novamente
- **401 Unauthorized**: Token expirado, fazer refresh
- **403 Forbidden**: Sem permissão para acessar recurso
- **500 Server Error**: Tentar novamente mais tarde

## Environment Variables

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
API_TIMEOUT=30000
```

## Versão da API
- **Data**: 28/04/2025
- **Supabase Version**: v1
- **Última atualização**: 28/04/2025
