# 🏗️ Decisões Técnicas Arquiteturais

Documento de Arquitetura Decision Records (ADRs) do Ophua-Mobile.

## 1. Framework e Linguagem

### Decisão: React Native + TypeScript com Expo

**Status**: Aprovado ✅

**Contexto**:
- Precisamos de app mobile nativa (iOS + Android)
- Código compartilhado entre plataformas
- Development rápido

**Opções Consideradas**:
1. **React Native + Expo** ✅ (Escolhido)
2. Flutter + Dart
3. Native (Swift + Kotlin)

**Razões**:
- ✅ Code reusability (70-90% entre iOS/Android)
- ✅ Expo simplifica deployment (sem Xcode/Android Studio requiridos)
- ✅ TypeScript para type safety
- ✅ Comunidade grande e ecosystem maduro
- ✅ Rápido para prototipagem

**Trade-offs**:
- ❌ Performance inferior a native (negligível para este app)
- ❌ Tamanho do bundle maior
- ❌ Menos acesso a APIs nativas

## 2. Estado Global

### Decisão: React Query + React Context

**Status**: Aprovado ✅

**Contexto**:
- Precisamos gerenciar estado de autenticação
- Precisamos de caching de dados
- Sincronização realtime

**Opções Consideradas**:
1. **React Query + Context** ✅ (Escolhido)
2. Redux + Thunk
3. Zustand + Axios
4. MobX

**Razões**:
- ✅ React Query: melhor para sincronizar com servidor
- ✅ Context: simples para auth state
- ✅ Menos boilerplate que Redux
- ✅ Excelente performance com caching
- ✅ Suporte nativo a Realtime

**Trade-offs**:
- ❌ Curva de aprendizado para React Query
- ❌ DevTools menos intuitivos que Redux

## 3. Backend e API

### Decisão: Supabase (PostgreSQL + Auth + Storage)

**Status**: Aprovado ✅

**Contexto**:
- Compartilhar com jalane-reimagined
- Não queremos manter múltiplos backends
- Autenticação, database e storage necessários

**Opções Consideradas**:
1. **Supabase** ✅ (Escolhido)
2. Firebase
3. AWS Amplify
4. Custom REST API

**Razões**:
- ✅ Já usado por jalane-reimagined
- ✅ PostgreSQL poderoso (vs Firebase)
- ✅ RLS nativo para segurança
- ✅ Realtime automático
- ✅ Free tier generoso
- ✅ Open source (auto-hospedável)

**Trade-offs**:
- ❌ Menos maduro que Firebase
- ❌ Suporte mais limitado

## 4. Validação de Dados

### Decisão: Zod para Runtime Validation

**Status**: Aprovado ✅

**Contexto**:
- Validar dados de formulários
- Validar respostas da API
- Type inference automático

**Opções Consideradas**:
1. **Zod** ✅ (Escolhido)
2. Yup
3. Joi
4. Superstruct

**Razões**:
- ✅ TypeScript-first design
- ✅ Excellent type inference
- ✅ Composable validators
- ✅ Pequeno bundle size
- ✅ Ótima developer experience

**Trade-offs**:
- ❌ Mais verbose que simples pattern matching
- ❌ Runtime overhead

## 5. Gerenciamento de Formulários

### Decisão: React Hook Form

**Status**: Aprovado ✅

**Contexto**:
- Muitos formulários na app
- Validação complexa
- Performance é importante

**Opções Consideradas**:
1. **React Hook Form** ✅ (Escolhido)
2. Formik
3. Final Form
4. Manualmente com useState

**Razões**:
- ✅ Minimal re-renders
- ✅ Pequeno bundle (~6KB)
- ✅ Excelente UX
- ✅ Integra bem com Zod
- ✅ Ótimo suporte mobile

**Trade-offs**:
- ❌ Curva de aprendizado
- ❌ Menos features que Formik

## 6. Navegação

### Decisão: Expo Router (File-based)

**Status**: Aprovado ✅

**Contexto**:
- Navegação entre telas
- Deep linking suportado
- Tipo-segura

**Opções Consideradas**:
1. **Expo Router** ✅ (Escolhido)
2. React Navigation
3. Native navigation (expo-navigation-bar)

**Razões**:
- ✅ File-based (como Next.js)
- ✅ Type-safe routes
- ✅ Deep linking automático
- ✅ Web support
- ✅ Integrado com Expo

**Trade-offs**:
- ❌ Mais novo que React Navigation
- ❌ Menos customização disponível

## 7. Integração de Imagens

### Decisão: Expo Image + Expo Image Picker

**Status**: Aprovado ✅

**Contexto**:
- Upload de avatars e covers
- Caching eficiente
- Blur placeholder

**Seleção**:
- **expo-image**: Cache intelligente + blurhash
- **expo-image-picker**: Acessar câmera/galeria

**Razões**:
- ✅ Melhor performance que Image
- ✅ Suporte a blurhash (UI mais responsiva)
- ✅ Integrado com Expo
- ✅ Permissões automáticas

## 8. Segurança

### Decisão: RLS + JWT + AsyncStorage

**Status**: Aprovado ✅

**Estratégia**:
1. **JWT Token**: Armazenado no AsyncStorage
2. **RLS**: PostgreSQL força regras de acesso
3. **HTTPS**: Apenas com SSL
4. **Auto-refresh**: Token renovado automaticamente

**Implementação**:
```typescript
// Token stored in AsyncStorage by Supabase
// RLS policies enforce data access
// Headers automatically add Authorization
```

## 9. Logging e Analytics

### Decisão: Sentry + Event Logging

**Status**: Planejado 📋

**Contexto**:
- Monitorar crashes em produção
- Track user behavior
- Error aggregation

**Opções Consideradas**:
1. **Sentry** (para errors)
2. **Firebase Analytics** (para events)
3. Custom logging

**Razões**:
- ✅ Sentry: melhor para errors/crashes
- ✅ Firebase: analytics e events
- ✅ Ambos têm free tier
- ✅ Integração simples

## 10. Testes

### Decisão: Jest + React Testing Library

**Status**: Planejado 📋

**Contexto**:
- Unit tests para hooks
- Component tests para UI
- Integration tests para fluxos

**Stack**:
```typescript
// jest.config.js
// setupTests.ts com React Testing Library
// Mocks para Supabase
```

## 11. CI/CD

### Decisão: GitHub Actions (Futuro)

**Status**: Planejado 📋

**Pipeline**:
1. Lint: `npm run lint`
2. Test: `npm test`
3. Build: `eas build`
4. Deploy: `eas submit`

## 12. Performance

### Decisão: Code Splitting + Lazy Loading

**Status**: Aprovado ✅

**Implementação**:
- Cada rota é um bundle separado
- Componentes pesados carregam sob demanda
- React Query cache estratégico
- Virtual lists para longas listas

## 13. Internacionalização

### Decisão: i18n com JSON + React Context

**Status**: Aprovado ✅

**Estrutura**:
```
i18n/
├── pt.json    # Português
├── en.json    # Inglês
└── index.ts   # Setup + hook
```

**Razões**:
- ✅ Simples de manter
- ✅ Type-safe com TypeScript
- ✅ Sem dependências complexas

## 14. Persistência Local

### Decisão: AsyncStorage para dados sensíveis

**Status**: Aprovado ✅

**O que salvar**:
- ✅ Auth token (via Supabase)
- ✅ Theme preference
- ✅ Language preference

**O que NÃO salvar**:
- ❌ Senhas
- ❌ Dados financeiros
- ❌ Dados pessoais sensíveis

## Evolução Futuro

### Possíveis Mudanças

1. **Offline Support**: SQLite + Syncing
2. **Better Analytics**: Amplitude ou Mixpanel
3. **Push Notifications**: FCM + APNs
4. **Video**: React Native Video
5. **Background Sync**: Background Tasks
6. **Payment**: Stripe/Square integration

## Justificação Geral

O stack foi escolhido por:
- **Produtividade**: React Native + Expo acelera development
- **Manutenibilidade**: TypeScript + estrutura clara
- **Performance**: React Query + caching eficiente
- **Segurança**: Supabase RLS + JWT
- **Escalabilidade**: Arquitetura modular
- **Cost**: Free tiers generosos

## Documentação

Para mais detalhes, ver:
- [Architecture.md](./PROJECT_STRUCTURE.md)
- [API.md](./API.md)
- [INTEGRATION.md](./INTEGRATION.md)

---

**Última atualização**: 28/04/2025
**Próxima revisão**: 30/06/2025
