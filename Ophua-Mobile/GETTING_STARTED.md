# 🚀 Getting Started - Ophua Mobile

Um guia passo-a-passo para começar a desenvolver o Ophua Mobile.

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm** ou **yarn** (incluso com Node.js)
- **Git** - [Download](https://git-scm.com/)
- **Expo CLI** - Execute: `npm install -g expo-cli`

### Para iOS (macOS apenas)
- Xcode (12.0 ou superior)
- iOS Simulator (incluso no Xcode)

### Para Android
- Android Studio
- Android SDK 21 ou superior
- Android Emulator (incluso no Android Studio)

## Passo 1: Clonar o Repositório

```bash
cd C:\xampp\htdocs\Ophua
git clone <repository-url>
cd Ophua-Mobile
```

## Passo 2: Instalar Dependências

```bash
npm install
```

Isso pode levar alguns minutos. Você verá muitas mensagens sobre installing packages...

## Passo 3: Configurar Supabase

### 3.1 Obter Credenciais Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Crie um novo projeto ou use um existente
4. Vá para Project Settings → API
5. Copie:
   - `Project URL` (SUPABASE_URL)
   - `anon public` key (SUPABASE_ANON_KEY)

### 3.2 Configurar Arquivo .env

Crie um arquivo `.env.local` na raiz do projeto:

```bash
cp .env.example .env.local
```

Edite `.env.local` e adicione suas credenciais:

```env
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-publica-aqui
```

⚠️ **Importante**: Nunca commitar este arquivo com credenciais reais!

## Passo 4: Iniciar o Servidor de Desenvolvimento

```bash
npm start
```

Você verá algo como:

```
Expo Go
│
├─ Scan the QR code above with Expo Go (Android) or
│  Camera app (iOS)
│
├─ Android Emulator
│  a - android
│
├─ iOS Simulator
│  i - ios
│
├─ Web
│  w - web
│
├─ r - reload
│ q - quit
```

## Passo 5: Abrir a App

Escolha uma das opções:

### Opção A: Emulador Android

1. Abra Android Studio
2. Abra o Android Emulator
3. No terminal do Expo, pressione `a`
4. A app vai carregar no emulador

### Opção B: Simulador iOS (macOS apenas)

1. No terminal do Expo, pressione `i`
2. O iOS Simulator vai abrir automaticamente
3. A app vai carregar

### Opção C: Expo Go (Seu Telefone)

1. Baixe a app "Expo Go" na App Store/Google Play
2. Abra o Expo Go
3. Escaneie o QR code do terminal com sua câmera
4. A app vai abrir no Expo Go

### Opção D: Web

1. No terminal do Expo, pressione `w`
2. A app abrirá em http://localhost:19006

## Passo 6: Explorar a Estrutura

```
Ophua-Mobile/
├── app/                    # Rotas e telas
│   ├── _layout.tsx        # Layout raiz
│   ├── index.tsx          # Tela inicial
│   └── (auth)/            # Grupo de rotas de autenticação
├── components/            # Componentes reutilizáveis
├── hooks/                 # Custom React Hooks
├── lib/                   # Utilitários
├── types/                 # Tipos TypeScript
└── config/                # Configurações
```

## Passo 7: Primeiro Componente

Vamos criar um componente simples de teste.

### Editar `app/index.tsx`

```typescript
import { View, Text } from 'react-native';
import { useAuth } from '@/hooks/useAuth';

export default function HomeScreen() {
  const { user, isSignedIn } = useAuth();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
        Ophua Mobile
      </Text>
      <Text style={{ marginTop: 10, color: '#666' }}>
        {isSignedIn ? `Bem-vindo, ${user?.email}` : 'Não autenticado'}
      </Text>
    </View>
  );
}
```

Salve o arquivo e veja a app atualizar automaticamente (Fast Refresh)!

## Passo 8: Testar Autenticação

Vamos testar a integração com Supabase.

### Criar `app/(auth)/login.tsx`

```typescript
import { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { useAuth } from '@/hooks/useAuth';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const { user, error } = await login(email, password);
    setLoading(false);

    if (error) {
      Alert.alert('Erro', error.message);
    } else {
      Alert.alert('Sucesso', `Bem-vindo, ${user?.email}`);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 10,
          marginBottom: 10,
          borderRadius: 5,
        }}
      />
      <TextInput
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 10,
          marginBottom: 20,
          borderRadius: 5,
        }}
      />
      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        style={{
          backgroundColor: loading ? '#ccc' : '#007AFF',
          padding: 15,
          borderRadius: 5,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
          {loading ? 'Entrando...' : 'Entrar'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
```

## Passo 9: Usar React Query

Todos os dados vêm do Supabase. Aqui está um exemplo:

```typescript
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { View, Text, ActivityIndicator } from 'react-native';

export default function ProfileScreen() {
  const { user } = useAuth();
  const { data: profile, isLoading, error } = useProfile(user?.id);

  if (isLoading) return <ActivityIndicator />;
  if (error) return <Text>Erro ao carregar perfil</Text>;

  return (
    <View>
      <Text>Nome: {profile?.full_name}</Text>
      <Text>Empresa: {profile?.company}</Text>
    </View>
  );
}
```

## Passo 10: Debug

### Ver Logs

Pressione `j` no terminal do Expo para abrir o menu de debugging.

### React Native Debugger

1. Baixe [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
2. Abra a app e pressione `Ctrl+M` (Android) ou `Cmd+D` (iOS)
3. Selecione "Debug JS Remotely"

### Erros Comuns

| Erro | Solução |
|------|---------|
| `Cannot find module '@/...'` | Verificar `tsconfig.json` paths |
| `Supabase credentials missing` | Verificar `.env.local` |
| `Network error` | Verificar URL do Supabase |
| `Auth session expired` | Fazer logout e login novamente |

## Próximos Passos

1. **Explorar componentes existentes** em `/components`
2. **Ler documentação de APIs** em `API.md`
3. **Estudar integração** em `INTEGRATION.md`
4. **Criar novas telas** em `app/`
5. **Adicionar testes** usando Jest

## Recursos Úteis

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## Comandos Úteis

```bash
# Iniciar desenvolvimento
npm start

# Limpar cache
npm run reset-project

# Verificar tipos TypeScript
npx tsc --noEmit

# Lint código
npm run lint

# Build para Android
eas build --platform android

# Build para iOS
eas build --platform ios
```

## Suporte

Se encontrar problemas:

1. Verifique os logs no console
2. Consulte a documentação do Supabase
3. Abra uma issue no repositório
4. Pergunte na comunidade Expo

## 🎉 Parabéns!

Você está pronto para começar a desenvolver! Boa sorte! 🚀

---

**Última atualização**: 28/04/2025
