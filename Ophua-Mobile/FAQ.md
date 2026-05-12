# ❓ FAQ - Perguntas Frequentes

## Geral

### O que é Ophua-Mobile?
Ophua-Mobile é uma aplicação mobile nativa desenvolvida em React Native com Expo. Ela replica as funcionalidades do jalane-reimagined e consome suas APIs através do Supabase.

### Qual é a diferença entre Ophua-Mobile e jalane-reimagined?
- **jalane-reimagined**: Web app (React + TanStack) com painel admin completo
- **Ophua-Mobile**: Mobile app (React Native) focada em perfil e contatos, consome APIs do jalane-reimagined

### Posso usar Ophua-Mobile sem o jalane-reimagined?
Não, o Ophua-Mobile precisa do Supabase (que é usado pelo jalane-reimagined). Ambos compartilham o mesmo banco de dados.

## Setup e Instalação

### Qual é a versão mínima do Node.js?
Node.js 18 ou superior. Recomendamos 20+.

### Posso desenvolver em Windows?
Sim! Você pode:
- Usar Android Emulator (recomendado no Windows)
- Usar Expo Go no seu telefone
- Usar web (limitado para testes)

### Posso desenvolver em macOS?
Sim! Você pode usar:
- iOS Simulator
- Android Emulator
- Expo Go
- Web

### Posso desenvolver em Linux?
Sim! Linux suporta:
- Android Emulator
- Expo Go
- Web

### O que é Expo?
Expo é uma plataforma que facilita o desenvolvimento de apps React Native. Fornece ferramentas, SDKs e serviços para build, deploy e testing.

### O que é Expo Go?
Expo Go é um app que permite rodar seu código React Native no seu telefone sem fazer build. Escaneia um QR code e pronto!

## Desenvolvimento

### Como fazer debug no React Native?
Opções:
1. **Console logs**: `console.log()` aparece no terminal
2. **React Native Debugger**: Download [aqui](https://github.com/jhen0409/react-native-debugger)
3. **Flipper**: Download [aqui](https://fbflipper.com/)
4. **DevTools**: Pressione `j` no terminal do Expo

### Como recarregar a app?
- Pressione `r` no terminal do Expo
- Ou chacoalhe o telefone 2x (Expo Go)
- ou `Ctrl+M` (Android) / `Cmd+D` (iOS) e reload

### Como limpar o cache?
```bash
npm run reset-project
npm install
npm start
```

### Qual é a diferença entre npm start, npm run android, npm run ios?
- `npm start`: Menu interativo (escolhe Android/iOS/Web)
- `npm run android`: Lança direto no Android
- `npm run ios`: Lança direto no iOS

### Como usar variáveis de ambiente?
```bash
# Crie .env.local
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...

# No código (prefixo EXPO_PUBLIC_ obrigatório para Expo)
import { ENV } from '@/config/environment';
console.log(ENV.SUPABASE_URL);
```

### Como usar AsyncStorage?
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Salvar
await AsyncStorage.setItem('key', 'value');

// Carregar
const value = await AsyncStorage.getItem('key');

// Deletar
await AsyncStorage.removeItem('key');
```

## Autenticação

### Como fazer login?
```typescript
const { login } = useAuth();
const { user, error } = await login('email@example.com', 'password');
```

### Como fazer logout?
```typescript
const { logout } = useAuth();
await logout();
```

### Como resetar senha?
```typescript
const { resetPassword } = useAuth();
await resetPassword('email@example.com');
```

### O token é salvo automaticamente?
Sim! Supabase salva o token no AsyncStorage automaticamente e faz refresh quando expira.

### Posso fazer login com Google/GitHub?
Sim, mas precisaria configurar o Supabase para isso. Veja [Supabase OAuth](https://supabase.com/docs/guides/auth/social-login).

## Dados e APIs

### Como carregar dados do Supabase?
```typescript
const { data, isLoading, error } = useProfile(userId);
```

### Como criar/atualizar dados?
```typescript
const { mutate } = useUpdateProfile();
await mutate({ full_name: 'New Name' });
```

### Como usar Realtime?
```typescript
useEffect(() => {
  const channel = supabase.channel('table:*')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'contacts' },
      (payload) => console.log(payload)
    )
    .subscribe();
  
  return () => channel.unsubscribe();
}, []);
```

### Como fazer queries avançadas?
```typescript
const { data } = await supabase
  .from('contacts')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(10);
```

## Componentes e UI

### Qual biblioteca de componentes usar?
Por padrão, componentes nativos do React Native (View, Text, etc). Para componentes mais complexos, considere:
- NativeWind (Tailwind para RN)
- React Native Paper
- UI Kitten

### Como fazer styling?
```typescript
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
});
```

### Como usar NativeWind (Tailwind)?
```bash
npm install nativewind tailwindcss
npx tailwindcss init
```

### Como fazer layouts responsivos?
```typescript
import { useWindowDimensions } from 'react-native';

function ResponsiveComponent() {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 600;
  
  return (
    <View style={isSmallScreen ? styles.mobile : styles.desktop}>
      ...
    </View>
  );
}
```

## Imagens

### Como fazer upload de imagem?
```typescript
const { mutate: uploadAvatar } = useUploadAvatar();
await uploadAvatar(imageUri);
```

### Como carregar imagem da câmera?
```typescript
import * as ImagePicker from 'expo-image-picker';

const pickImage = async () => {
  const result = await ImagePicker.launchCameraAsync();
  if (!result.canceled) {
    return result.assets[0].uri;
  }
};
```

### Como exibir imagem com placeholder?
```typescript
import { Image } from 'expo-image';

<Image
  source={{ uri: imageUrl }}
  placeholder={{ blurhash }}
  style={{ width: 200, height: 200 }}
/>
```

## Performance

### A app está lenta. O que fazer?
1. Verificar React DevTools (re-renders desnecessários)
2. Usar React.memo() para componentes pesados
3. Usar useMemo() e useCallback()
4. Verificar FlatList performance (key props, renderItem)
5. Cachear dados com React Query

### Como otimizar images?
```typescript
// Comprimir antes de fazer upload
import * as ImageManipulator from 'expo-image-manipulator';

const compressed = await ImageManipulator.manipulateAsync(
  uri,
  [{ resize: { width: 800, height: 800 } }],
  { compress: 0.8 }
);
```

## Build e Deploy

### Como fazer build para iOS?
```bash
eas build --platform ios
```

Requisitos:
- Apple Developer Account
- Certificate assinado

### Como fazer build para Android?
```bash
eas build --platform android
```

Requisitos:
- Google Play Developer Account
- Keystore

### Como publicar na App Store?
1. Fazer build com `eas build`
2. Enviar com `eas submit`

### Quanto custa o EAS?
Free até X builds/mês. Depois paga-se por build.

## Troubleshooting

### Erro: "Cannot find module '@/...'"
Verificar `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Erro: "Supabase credentials missing"
Verificar `.env.local`:
```env
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

### Erro: "Network error"
1. Verificar internet
2. Verificar URL do Supabase
3. Verificar firewall/proxy

### Erro: "Auth session expired"
Fazer logout e login novamente. Token precisa ser refreshado.

### App não atualiza ao fazer mudanças
1. Pressionar `r` para reload
2. Fechar Expo Go e reabrir
3. Limpar cache: `npm run reset-project`

### Emulator não inicia
Android Studio:
1. Tools → Device Manager
2. Create Virtual Device
3. Selecionar Pixel 4 + Android 12+

## Documentação

### Onde encontro documentação do Supabase?
[supabase.com/docs](https://supabase.com/docs)

### Documentação de React Native?
[reactnative.dev](https://reactnative.dev)

### Documentação de Expo?
[docs.expo.dev](https://docs.expo.dev)

### Documentação de React Query?
[tanstack.com/query](https://tanstack.com/query/latest)

## Comunidade

### Onde tirar dúvidas?
- Discord de Expo: [chat.expo.dev](https://chat.expo.dev)
- Comunidade React Native: [GitHub Discussions](https://github.com/facebook/react-native/discussions)
- Stack Overflow: tag `react-native`

### Como contribuir?
1. Fork o repositório
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## Outros

### Posso usar TypeScript?
Sim, e é recomendado! O projeto já vem configurado com TypeScript.

### Como testo offline?
```typescript
import NetInfo from '@react-native-community/netinfo';

const isConnected = await NetInfo.fetch().then(state => state.isConnected);
```

### Como fazer testes?
```bash
npm install --save-dev jest @testing-library/react-native
npm test
```

### Como monitorar erros em produção?
Use ferramentas como:
- Sentry: [sentry.io](https://sentry.io)
- Rollbar: [rollbar.com](https://rollbar.com)
- LogRocket: [logrocket.com](https://logrocket.com)

---

**Última atualização**: 28/04/2025

Não encontrou sua pergunta? Abra uma issue no repositório!
