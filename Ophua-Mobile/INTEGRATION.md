# Documentação de Integração de APIs

Este documento descreve como o Ophua-Mobile se integra com o jalane-reimagined backend via Supabase.

## Arquitetura de Integração

```
┌──────────────────────┐
│  Ophua-Mobile (RN)   │
│  React Native + Expo │
└──────────┬───────────┘
           │
           │ REST + WebSocket
           ▼
┌──────────────────────┐
│   Supabase          │
│ - Auth              │
│ - Database (PostGIS)│
│ - Realtime          │
│ - Storage           │
│ - Functions         │
└──────────┬───────────┘
           │
           │
           ▼
┌──────────────────────┐
│ jalane-reimagined    │
│ - Backend Logic      │
│ - Business Rules     │
│ - Admin Panel        │
└──────────────────────┘
```

## Fluxos Principais

### 1. Fluxo de Autenticação

```
User (Mobile) → Input Email/Password
                │
                ▼
        Supabase Auth API
                │
        ┌───────┴────────┐
        │                │
    Success          Fail
        │                │
        ▼                ▼
   Store Token     Show Error
   Fetch Profile
```

**Código:**
```typescript
import { supabase } from '@/lib/supabase';

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password',
});

if (error) {
  console.error('Login failed:', error.message);
} else {
  // Token automatically stored in AsyncStorage
  console.log('Logged in as:', data.user.email);
}
```

### 2. Fluxo de Sincronização de Perfil

```
App Launched
    │
    ▼
Check Auth Session (AsyncStorage)
    │
    ├─ Session Valid?
    │   │
    │   Yes ▼
    │   Fetch Profile from Supabase
    │   │
    │   ├─ Profile Updated?
    │   │   │
    │   │   Yes ▼
    │   │       Update Local Cache
    │   │       Trigger UI Update
    │   │
    │   └─ No
    │       Use Cached Profile
    │
    └─ Session Invalid
        │
        ▼
    Try Refresh Token
        │
        ├─ Refresh Success
        │   ▼
        │   Fetch Profile
        │
        └─ Refresh Failed
            ▼
            Redirect to Login
```

**Código:**
```typescript
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';

export function ProfileScreen() {
  const { user } = useAuth();
  const { data: profile, isLoading, error } = useProfile(user?.id);

  if (error) {
    console.error('Failed to fetch profile:', error);
  }

  return (
    <View>
      {isLoading ? <ActivityIndicator /> : <ProfileCard profile={profile} />}
    </View>
  );
}
```

### 3. Fluxo de Upload de Arquivo

```
User Selects Image
    │
    ▼
Convert to Blob
    │
    ▼
Upload to Supabase Storage
    │
    ├─ Success ▼
    │    Get Public URL
    │    │
    │    ▼
    │    Update Profile (avatar_url)
    │    │
    │    ▼
    │    Update Local Cache
    │    Trigger UI Refresh
    │
    └─ Error ▼
         Show Error Toast
         Log Error
```

**Código:**
```typescript
import { useUploadAvatar } from '@/hooks/useProfile';

export function EditProfileScreen() {
  const uploadAvatar = useUploadAvatar();

  const handlePickImage = async (uri: string) => {
    try {
      const url = await uploadAvatar.mutateAsync(uri);
      console.log('Avatar uploaded:', url);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <Button
      onPress={() => {
        // Pick image from device
      }}
    >
      Upload Avatar
    </Button>
  );
}
```

### 4. Fluxo de Realtime (Contact Exchange)

```
User Receives Contact
    │
    ▼
Supabase Triggers INSERT on contact_exchanges
    │
    ▼
Realtime Channel Notifies Connected Clients
    │
    ▼
Mobile App Receives Event
    │
    ▼
React Query Invalidates Cache
    │
    ▼
UI Fetches New Data
    │
    ▼
Show Notification
```

**Código:**
```typescript
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useContactExchanges } from '@/hooks/useContacts';

export function useRealtimeContacts(userId: string) {
  const { refetch } = useContactExchanges(userId);

  useEffect(() => {
    const channel = supabase
      .channel(`contact_exchanges:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'contact_exchanges',
          filter: `owner_id=eq.${userId}`,
        },
        (payload) => {
          console.log('New contact:', payload.new);
          refetch();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId, refetch]);
}
```

## Endpoints de Dados Consumidos

### Perfil
- `GET /rest/v1/profiles` - Listar perfis
- `PATCH /rest/v1/profiles` - Atualizar perfil
- `POST /storage/v1/object/avatars` - Upload de avatar
- `POST /storage/v1/object/covers` - Upload de capa

### Contatos
- `GET /rest/v1/contacts` - Listar contatos
- `POST /rest/v1/contacts` - Criar contato
- `PATCH /rest/v1/contacts` - Atualizar contato
- `DELETE /rest/v1/contacts` - Deletar contato

### Troca de Contatos
- `GET /rest/v1/contact_exchanges` - Listar trocas recebidas
- `POST /rest/v1/contact_exchanges` - Enviar contato

### Analytics
- `POST /rest/v1/profile_views` - Registrar visualização
- `POST /rest/v1/profile_clicks` - Registrar clique
- `GET /rest/v1/profile_views` - Listar visualizações
- `GET /rest/v1/profile_clicks` - Listar cliques

### Autenticação
- `POST /auth/v1/signup` - Criar conta
- `POST /auth/v1/token` - Login
- `POST /auth/v1/refresh` - Refresh token
- `POST /auth/v1/logout` - Logout

## Tratamento de Erros

### Erros Comuns

| Erro | Código HTTP | Solução |
|------|-------------|---------|
| Credenciais Inválidas | 401 | Pedir para fazer login novamente |
| Sem Permissão | 403 | Verificar RLS policies |
| Recurso Não Encontrado | 404 | Verificar se ID é válido |
| Rate Limited | 429 | Aguardar e tentar novamente |
| Servidor Indisponível | 500 | Mostrar mensagem e tentar depois |

### Implementação de Retry com Exponential Backoff

```typescript
async function retryFetch<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

// Usage
const profile = await retryFetch(
  () => supabase.from('profiles').select('*').single()
);
```

## Caching Strategy

O projeto usa React Query com as seguintes estratégias:

```typescript
// Dados que mudam frequentemente
const { data: stats } = useQuery({
  queryKey: ['stats'],
  queryFn: fetchStats,
  staleTime: 1000 * 60, // 1 minuto
  gcTime: 1000 * 60 * 5, // 5 minutos
});

// Dados que mudam raramente
const { data: profile } = useQuery({
  queryKey: ['profile', userId],
  queryFn: () => fetchProfile(userId),
  staleTime: 1000 * 60 * 60, // 1 hora
  gcTime: 1000 * 60 * 60 * 24, // 24 horas
});
```

## Segurança

### Row Level Security (RLS)

O Supabase usa RLS policies para garantir que:
- Usuários só podem ler/escrever seu próprio perfil
- Contatos são privados para o usuário
- Analytics são registrados sem autenticação (para perfis públicos)

### Token Management

```typescript
// Tokens são automaticamente armazenados em AsyncStorage
// Refresh automático via Supabase Auth

// Para operações sensíveis, sempre verificar token válido:
const { data: session } = await supabase.auth.getSession();
if (!session?.access_token) {
  // Redirect to login
}
```

## Performance

### Otimizações Implementadas

1. **Query Deduplication**: React Query deduplica requisições simultâneas
2. **Caching**: Dados são cacheados localmente
3. **Lazy Loading**: Dados são carregados sob demanda
4. **Pagination**: Contatos são paginados (não implementado ainda)
5. **Image Optimization**: Imagens são comprimidas antes do upload

### Monitoramento

Para monitorar performance:

```typescript
import { useQueryClient } from '@tanstack/react-query';

export function useQueryPerformance() {
  const queryClient = useQueryClient();

  return {
    cacheSize: Object.keys(queryClient.getQueryCache().getAll()).length,
    mutations: queryClient.getMutationCache().getAll().length,
  };
}
```

## Rate Limiting

Supabase aplica rate limits:
- **Auth**: 10 requests/segundo
- **REST API**: 100 requests/segundo
- **Realtime**: Conexões simultâneas limitadas

Para evitar rate limiting:
```typescript
// Usar debounce para busca
import { useMemo } from 'react';
import debounce from 'lodash/debounce';

function useSearchContacts(query: string) {
  const debouncedSearch = useMemo(
    () => debounce((q: string) => {
      // Fazer busca
    }, 500),
    []
  );

  return { debouncedSearch };
}
```

## Testes de Integração

```typescript
// Jest + React Testing Library
import { render, screen, waitFor } from '@testing-library/react-native';
import ProfileScreen from '@/app/profile';

jest.mock('@/hooks/useProfile', () => ({
  useProfile: jest.fn(() => ({
    data: { full_name: 'Test User' },
    isLoading: false,
  })),
}));

test('renders user profile', async () => {
  render(<ProfileScreen />);
  await waitFor(() => {
    expect(screen.getByText('Test User')).toBeTruthy();
  });
});
```

---

**Última atualização**: 28/04/2025
