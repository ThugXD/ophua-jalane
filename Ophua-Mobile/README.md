# Ophua Mobile

Uma aplicação mobile moderna desenvolvida em React Native com Expo, que replica as funcionalidades do [jalane-reimagined](../jalane-reimagined) - plataforma de cartão de contato digital.

## 🎯 Funcionalidades Principais

- 📱 **Autenticação**: Login, Signup e Recuperação de Senha via Supabase
- 👤 **Perfil do Usuário**: Visualização e edição de perfil com avatar e capa
- 📇 **Cartão de Contato Digital**: Visualização e compartilhamento do cartão
- 📋 **Gestão de Contatos**: CRUD completo de contatos com filtros
- 📸 **Scanner de Cartão de Visita**: OCR para extrair dados de cartões
- 📊 **Analytics**: Estatísticas de visualizações e cliques
- 🌐 **Idiomas**: Suporte para Português e Inglês
- 🎨 **Temas**: Modo claro e escuro
- 🔄 **Sincronização em Tempo Real**: Via Supabase Realtime
- 📱 **Responsivo**: Funciona em iOS, Android e Web

## 🛠️ Tecnologias Utilizadas

- **React Native 0.81.5** com TypeScript
- **Expo Router** para navegação
- **Supabase** para autenticação e backend
- **React Query** para gerenciamento de estado
- **React Hook Form** para formulários
- **Zod** para validação de dados
- **Tailwind CSS** (via NativeWind para RN)
- **Lucide React** para ícones

## 📦 Pré-requisitos

- Node.js >= 18
- npm ou yarn
- Conta Supabase com projeto configurado
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (para desenvolver no macOS) ou Android Emulator

## 🚀 Configuração Inicial

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Edite `.env.local` e adicione suas credenciais Supabase:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Iniciar o Servidor de Desenvolvimento

```bash
npm start
```

Isso abrirá o Expo Go QR code scanner. Você pode:
- Pressionar **i** para abrir no iOS Simulator (macOS apenas)
- Pressionar **a** para abrir no Android Emulator
- Escanear o QR code com o Expo Go app no seu telefone

## 📁 Estrutura do Projeto

```
Ophua-Mobile/
├── app/                          # Rotas e telas (Expo Router)
│   ├── (auth)/                  # Screens de autenticação
│   ├── (app)/                   # Screens da app autenticada
│   ├── index.tsx                # Tela inicial
│   └── _layout.tsx              # Layout raiz
├── components/                   # Componentes reutilizáveis
│   ├── ui/                      # Componentes UI básicos
│   ├── ProfileCard.tsx          # Cartão de perfil
│   ├── ContactList.tsx          # Lista de contatos
│   └── ...
├── hooks/                        # Custom React Hooks
│   ├── useAuth.ts               # Autenticação
│   ├── useProfile.ts            # Perfil do usuário
│   ├── useContacts.ts           # Contatos
│   └── useAnalytics.ts          # Analytics
├── lib/                          # Funções utilitárias
│   ├── supabase.ts              # Cliente Supabase
│   ├── validation.ts            # Validações com Zod
│   └── formatting.ts            # Formatação de dados
├── types/                        # Tipos TypeScript
│   ├── index.ts                 # Tipos gerais
│   ├── database.ts              # Tipos do banco de dados
│   └── api.ts                   # Tipos de API
├── config/                       # Configurações
│   └── environment.ts           # Variáveis de ambiente
├── styles/                       # Estilos globais
│   └── theme.ts                 # Tema da app
├── constants/                    # Constantes
│   ├── colors.ts                # Cores
│   └── dimensions.ts            # Dimensões
├── app.json                      # Configuração Expo
├── package.json
├── tsconfig.json
└── API.md                        # Documentação das APIs
```

## 🔐 Autenticação

A autenticação é feita via Supabase Auth:

### Login
```typescript
const { login } = useAuth();
await login('email@example.com', 'password');
```

### Signup
```typescript
const { signup } = useAuth();
await signup('email@example.com', 'password', 'Full Name');
```

### Logout
```typescript
const { logout } = useAuth();
await logout();
```

## 📡 Consumindo APIs

Todos os dados são consumidos via Supabase. Veja [API.md](./API.md) para documentação completa.

### Exemplo: Obter Perfil do Usuário
```typescript
import { useProfile } from '@/hooks/useProfile';

export default function ProfileScreen() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile(user?.id);

  return (
    <View>
      {isLoading ? (
        <Text>Carregando...</Text>
      ) : profile ? (
        <Text>{profile.full_name}</Text>
      ) : null}
    </View>
  );
}
```

## 📚 Documentação

- [API Documentation](./API.md) - Endpoints e integração com Supabase
- [Types](./types/) - Tipos TypeScript
- [Hooks](./hooks/) - Custom React Hooks

## 🚢 Build e Deploy

### Build para iOS
```bash
eas build --platform ios
```

### Build para Android
```bash
eas build --platform android
```

## 🤝 Contribuindo

1. Crie uma branch para sua feature
2. Commit suas mudanças
3. Push para a branch
4. Abra um Pull Request

## 📄 Licença

MIT License - 2025

---

**Última atualização**: 28/04/2025
