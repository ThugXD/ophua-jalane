# 📁 Project Structure

## Visão Geral da Estrutura

```
Ophua-Mobile/
├── app/                              # Expo Router - Rotas e Layouts
│   ├── _layout.tsx                  # Layout raiz (context providers)
│   ├── index.tsx                    # Tela inicial/home
│   ├── (auth)/                      # Grupo de rotas de autenticação
│   │   ├── _layout.tsx              # Layout para auth screens
│   │   ├── login.tsx                # Tela de login
│   │   ├── signup.tsx               # Tela de cadastro
│   │   └── forgot-password.tsx      # Tela de recuperação de senha
│   └── (app)/                       # Grupo de rotas autenticadas
│       ├── _layout.tsx              # Layout para app screens
│       ├── home.tsx                 # Home da app autenticada
│       ├── profile/                 # Rotas de perfil
│       │   ├── _layout.tsx
│       │   ├── index.tsx            # Visualizar perfil
│       │   └── edit.tsx             # Editar perfil
│       ├── contacts/                # Rotas de contatos
│       │   ├── _layout.tsx
│       │   ├── index.tsx            # Lista de contatos
│       │   ├── [id].tsx             # Detalhe do contato
│       │   └── create.tsx           # Criar novo contato
│       ├── card/                    # Rota do cartão digital
│       │   └── [id].tsx             # Visualizar cartão público
│       ├── analytics/               # Rota de analytics
│       │   └── index.tsx            # Dashboard de analytics
│       └── settings/                # Rotas de configurações
│           ├── _layout.tsx
│           ├── index.tsx            # Configurações gerais
│           ├── theme.tsx            # Tema
│           ├── language.tsx         # Idioma
│           └── about.tsx            # Sobre
│
├── components/                       # Componentes Reutilizáveis
│   ├── ui/                          # Componentes UI básicos
│   │   ├── Button.tsx               # Botão genérico
│   │   ├── Input.tsx                # Input genérico
│   │   ├── Card.tsx                 # Card component
│   │   ├── Modal.tsx                # Modal genérico
│   │   ├── Loading.tsx              # Loading spinner
│   │   └── Toast.tsx                # Toast notifications
│   ├── ProfileCard.tsx              # Cartão de perfil do usuário
│   ├── ContactCard.tsx              # Card para contato
│   ├── ContactList.tsx              # Lista de contatos
│   ├── BusinessCardScanner.tsx      # Scanner de cartão de visita
│   ├── Avatar.tsx                   # Avatar customizado
│   ├── Header.tsx                   # Header customizado
│   ├── TabBar.tsx                   # Bottom tab bar
│   └── Empty.tsx                    # Estado vazio
│
├── hooks/                            # Custom React Hooks
│   ├── useAuth.ts                   # Lógica de autenticação
│   ├── useProfile.ts                # Lógica de perfil
│   ├── useContacts.ts               # Lógica de contatos
│   ├── useAnalytics.ts              # Lógica de analytics
│   ├── useTheme.ts                  # Tema (claro/escuro)
│   ├── useLang.ts                   # Idioma (PT/EN)
│   ├── useKeyboard.ts               # Detectar teclado
│   └── useNetworkStatus.ts          # Status da rede
│
├── lib/                              # Utilitários e Funções
│   ├── supabase.ts                  # Cliente Supabase configurado
│   ├── validation.ts                # Validações com Zod
│   ├── formatting.ts                # Funções de formatação
│   ├── phone.ts                     # Parsing de telefone
│   ├── constants.ts                 # Constantes globais
│   └── utils.ts                     # Utilitários gerais
│
├── types/                            # Tipos TypeScript
│   ├── index.ts                     # Tipos gerais (Profile, Contact, etc)
│   ├── database.ts                  # Tipos do banco de dados
│   ├── api.ts                       # Tipos de respostas da API
│   └── navigation.ts                # Tipos de navegação
│
├── config/                           # Configurações
│   ├── environment.ts               # Variáveis de ambiente
│   ├── colors.ts                    # Paleta de cores
│   ├── spacing.ts                   # Dimensões de spacing
│   ├── typography.ts                # Tipografia
│   └── theme.ts                     # Temas (dark/light)
│
├── constants/                        # Constantes
│   ├── strings.ts                   # Strings em português
│   ├── strings.en.ts                # Strings em inglês
│   └── api.ts                       # Constantes de API
│
├── contexts/                         # React Contexts (optional)
│   ├── AuthContext.tsx              # Context de autenticação
│   └── ThemeContext.tsx             # Context de tema
│
├── i18n/                             # Internacionalização
│   ├── index.ts                     # Setup i18n
│   ├── pt.json                      # Tradução Português
│   └── en.json                      # Tradução Inglês
│
├── styles/                           # Estilos globais
│   ├── theme.ts                     # Tema da aplicação
│   ├── colors.ts                    # Cores globais
│   └── spacing.ts                   # Espaçamento padrão
│
├── .env.example                      # Exemplo de variáveis de ambiente
├── .env.local                        # Variáveis de ambiente (não commitar)
├── app.json                          # Configuração Expo
├── package.json                      # Dependências e scripts
├── tsconfig.json                     # Configuração TypeScript
├── eslint.config.js                 # Configuração ESLint
│
├── README.md                         # Documentação principal
├── GETTING_STARTED.md               # Guia de início rápido
├── API.md                            # Documentação de APIs
├── INTEGRATION.md                    # Guia de integração
├── BACKEND_SETUP.md                 # Setup do backend (Supabase)
└── PROJECT_STRUCTURE.md             # Este arquivo
```

## Convenções de Nomes

### Arquivos e Pastas
- **Componentes**: `PascalCase.tsx` (ex: `ProfileCard.tsx`)
- **Hooks**: `camelCase.ts` (ex: `useAuth.ts`)
- **Utilitários**: `camelCase.ts` (ex: `validation.ts`)
- **Tipos**: `index.ts` ou `descriptive.ts` (ex: `database.ts`)
- **Pastas**: `kebab-case` (ex: `profile-card`)

### Variáveis e Funções
- **Variáveis**: `camelCase`
- **Constantes**: `UPPER_SNAKE_CASE`
- **Interfaces/Types**: `PascalCase`
- **Boolean functions**: `is*`, `has*`, `can*` (ex: `isLoading`, `hasPermission`)

## Estrutura de Rotas (Expo Router)

### Autenticação (não autenticado)
```
/                    # Home (redireciona para /auth se não autenticado)
/auth/login          # Tela de login
/auth/signup         # Tela de cadastro
/auth/forgot-password # Recuperação de senha
```

### App (autenticado)
```
/(app)/home          # Home da app
/(app)/profile       # Visualizar perfil
/(app)/profile/edit  # Editar perfil
/(app)/contacts      # Lista de contatos
/(app)/contacts/[id] # Detalhe do contato
/(app)/contacts/create # Criar novo contato
/(app)/card/[id]     # Visualizar cartão público
/(app)/analytics     # Dashboard de analytics
/(app)/settings      # Configurações
/(app)/settings/theme # Configuração de tema
/(app)/settings/language # Configuração de idioma
```

## Fluxo de Dados

### Redux-like (via React Query)

```
Component
    ↓
Hook (useAuth, useProfile, etc)
    ↓
React Query
    ↓
Supabase Client
    ↓
Database / API
```

### Exemplo: Atualizar Perfil

```typescript
// 1. Component
<UpdateProfileForm onSave={handleSave} />

// 2. Hook
const { mutate: updateProfile } = useUpdateProfile();

// 3. Handler
const handleSave = async (data) => {
  await updateProfile(data);
};

// 4. Hook executa mutation
mutationFn: async (data) => {
  return supabase.from('profiles').update(data)...
}

// 5. React Query invalida cache
onSuccess: () => {
  queryClient.invalidateQueries(['profile']);
}

// 6. Component re-renders com dados atualizados
const { data: profile } = useProfile(userId);
```

## Estado Global

### Autenticação
- Usando React Context + AsyncStorage
- Hook: `useAuth()`

### Tema
- Usando localStorage (web) / AsyncStorage (mobile)
- Hook: `useTheme()`

### Idioma
- Usando localStorage (web) / AsyncStorage (mobile)
- Hook: `useLang()`

### Dados (Profiles, Contacts, etc)
- Usando React Query
- Hooks: `useProfile()`, `useContacts()`, etc

## Performance

### Otimizações Implementadas

1. **Code Splitting**: Cada rota é um bundle separado
2. **Lazy Loading**: Componentes pesados importados com lazy()
3. **Query Caching**: React Query cache de 1-24h dependendo do tipo
4. **Image Optimization**: Imagens comprimidas antes do upload
5. **Virtual Lists**: FlatList para longas listas

### Recomendações

- Use `React.memo()` para componentes que recebem props complexas
- Use `useMemo()` para computações pesadas
- Use `useCallback()` para callbacks passados para componentes
- Sempre use `trackingProps` em FlatList
- Minimize re-renders usando proper key props

## Dependências Principais

| Dependência | Versão | Uso |
|-------------|--------|-----|
| React | 19.1.0 | Framework |
| React Native | 0.81.5 | Framework mobile |
| Expo | ~54.0 | Build platform |
| Expo Router | ~6.0 | Navegação |
| Supabase | latest | Backend |
| React Query | latest | State management |
| React Hook Form | latest | Form management |
| Zod | latest | Validação |

## Testing

### Estrutura de Testes

```
__tests__/
├── components/
│   ├── ProfileCard.test.tsx
│   └── ContactList.test.tsx
├── hooks/
│   ├── useAuth.test.ts
│   └── useProfile.test.ts
└── lib/
    ├── validation.test.ts
    └── formatting.test.ts
```

## Documentação Adicional

Veja os arquivos de documentação para mais detalhes:
- **[README.md](./README.md)** - Visão geral do projeto
- **[GETTING_STARTED.md](./GETTING_STARTED.md)** - Guia de início rápido
- **[API.md](./API.md)** - Endpoints da API
- **[INTEGRATION.md](./INTEGRATION.md)** - Guia de integração
- **[BACKEND_SETUP.md](./BACKEND_SETUP.md)** - Setup do backend

---

**Última atualização**: 28/04/2025
