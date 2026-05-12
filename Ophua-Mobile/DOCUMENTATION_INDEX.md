# 📚 Índice de Documentação

Guia completo para navegar pela documentação do Ophua-Mobile.

## 📖 Documentação Principal

### Para Começar
- **[README.md](./README.md)** - Visão geral do projeto, features e tecnologias
- **[GETTING_STARTED.md](./GETTING_STARTED.md)** ⭐ **COMECE AQUI** - Passo-a-passo para setup
- **[FAQ.md](./FAQ.md)** - Perguntas frequentes e respostas

### Entendendo o Projeto
- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Estrutura das pastas e arquivos
- **[TECHNICAL_DECISIONS.md](./TECHNICAL_DECISIONS.md)** - Decisões arquiteturais explicadas
- **[API.md](./API.md)** - Documentação de todos os endpoints

### Desenvolvendo
- **[INTEGRATION.md](./INTEGRATION.md)** - Como integrar com Supabase
- **[BACKEND_SETUP.md](./BACKEND_SETUP.md)** - Configurar o backend (jalane-reimagined)

### Deploy e Produção
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Build e deploy para App Store e Play Store

## 🎯 Fluxo Recomendado

### Primeiro Uso
```
1. README.md           (entender o projeto)
   ↓
2. GETTING_STARTED.md  (setup local)
   ↓
3. PROJECT_STRUCTURE.md (conhecer organização)
   ↓
4. INTEGRATION.md      (começar a codar)
```

### Para Contribuir
```
1. README.md
2. TECHNICAL_DECISIONS.md
3. PROJECT_STRUCTURE.md
4. O arquivo específico que vai modificar
```

### Para Deploy
```
1. DEPLOYMENT.md
2. BACKEND_SETUP.md (garantir que APIs estão corretas)
```

## 📚 Documentação por Tópico

### Autenticação
- [GETTING_STARTED.md#passo-5](./GETTING_STARTED.md#passo-5-abrir-a-app) - Testar auth
- [INTEGRATION.md#fluxo-de-autenticação](./INTEGRATION.md#1-fluxo-de-autenticação) - Detalhes de auth
- [FAQ.md#autenticação](./FAQ.md#autenticação) - Perguntas sobre auth

### Dados e APIs
- [API.md](./API.md) - Todos os endpoints
- [INTEGRATION.md#endpoints-de-dados-consumidos](./INTEGRATION.md#endpoints-de-dados-consumidos) - Quais dados consumir
- [BACKEND_SETUP.md](./BACKEND_SETUP.md) - Configurar Supabase

### Componentes e UI
- [PROJECT_STRUCTURE.md#componentes](./PROJECT_STRUCTURE.md#estrutura-de-componentes) - Estrutura de componentes
- [FAQ.md#componentes-e-ui](./FAQ.md#componentes-e-ui) - Dúvidas sobre UI

### Performance
- [PROJECT_STRUCTURE.md#performance](./PROJECT_STRUCTURE.md#performance) - Dicas de performance
- [TECHNICAL_DECISIONS.md#estado-global](./TECHNICAL_DECISIONS.md#2-estado-global) - Why React Query
- [FAQ.md#performance](./FAQ.md#performance) - Troubleshooting de performance

### Deploy
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guia completo de deployment
- [DEPLOYMENT.md#5-versioning-strategy](./DEPLOYMENT.md#5-versioning-strategy) - Versionamento

### Troubleshooting
- [FAQ.md#troubleshooting](./FAQ.md#troubleshooting) - Erros comuns e soluções
- [GETTING_STARTED.md#passo-10-debug](./GETTING_STARTED.md#passo-10-debug) - Debugging
- [INTEGRATION.md#tratamento-de-erros](./INTEGRATION.md#tratamento-de-erros) - Error handling

## 🔍 Encontrar Informações Específicas

| Tópico | Arquivo | Seção |
|--------|---------|-------|
| Como começar | GETTING_STARTED.md | Início |
| Estrutura de pastas | PROJECT_STRUCTURE.md | Visão Geral |
| Configurar Supabase | BACKEND_SETUP.md | Passo 1-3 |
| Fazer upload de imagem | INTEGRATION.md | Fluxo de Upload |
| Usar Realtime | INTEGRATION.md | Fluxo de Realtime |
| Build para iOS | DEPLOYMENT.md | Seção 3 |
| Build para Android | DEPLOYMENT.md | Seção 4 |
| Sobre TypeScript | TECHNICAL_DECISIONS.md | Seção 1 |
| Sobre React Query | TECHNICAL_DECISIONS.md | Seção 2 |
| Versionamento | DEPLOYMENT.md | Seção 5 |
| Testes | PROJECT_STRUCTURE.md | Testing |
| Debugging | FAQ.md | Desenvolvimento |

## 📱 Por Funcionalidade

### Autenticação
- [API.md#endpoints-de-autenticação](./API.md#endpoints-de-autenticação)
- [INTEGRATION.md#fluxo-de-autenticação](./INTEGRATION.md#1-fluxo-de-autenticação)
- [FAQ.md#autenticação](./FAQ.md#autenticação)

### Perfil do Usuário
- [API.md#endpoints-de-perfil](./API.md#endpoints-de-perfil)
- [INTEGRATION.md#fluxo-de-sincronização-de-perfil](./INTEGRATION.md#2-fluxo-de-sincronização-de-perfil)
- [INTEGRATION.md#fluxo-de-upload-de-arquivo](./INTEGRATION.md#3-fluxo-de-upload-de-arquivo)

### Contatos
- [API.md#endpoints-de-contatos](./API.md#endpoints-de-contatos)
- [hooks/useContacts.ts](./hooks/useContacts.ts)

### Analytics
- [API.md#endpoints-de-analytics](./API.md#endpoints-de-analytics)
- [hooks/useAnalytics.ts](./hooks/useAnalytics.ts)

### Scanner de Cartão
- [API.md#endpoints-supabase-functions](./API.md#endpoints-supabase-functions)
- [components/BusinessCardScanner.tsx](./components/BusinessCardScanner.tsx)

## 🛠️ Referência Técnica

### Tipos TypeScript
- [types/index.ts](./types/index.ts) - Tipos gerais
- [types/database.ts](./types/database.ts) - Tipos do banco de dados

### Configuração
- [config/environment.ts](./config/environment.ts) - Variáveis de ambiente
- [app.json](./app.json) - Configuração Expo

### Hooks Principais
- [hooks/useAuth.ts](./hooks/useAuth.ts) - Autenticação
- [hooks/useProfile.ts](./hooks/useProfile.ts) - Perfil
- [hooks/useContacts.ts](./hooks/useContacts.ts) - Contatos

### Cliente Supabase
- [lib/supabase.ts](./lib/supabase.ts) - Setup do cliente

## 🎓 Roteiros de Aprendizado

### Se é novo em React Native
```
1. Ler: GETTING_STARTED.md
2. Ler: PROJECT_STRUCTURE.md
3. Praticar: Criar componente simples
4. Ler: INTEGRATION.md
5. Praticar: Conectar com API
```

### Se é novo em Supabase
```
1. Ler: BACKEND_SETUP.md (entender database)
2. Ler: API.md (ver endpoints)
3. Ler: INTEGRATION.md (ver como usar)
4. Praticar: Fazer queries
```

### Se é novo no projeto
```
1. README.md (overview)
2. GETTING_STARTED.md (setup)
3. PROJECT_STRUCTURE.md (navegação)
4. TECHNICAL_DECISIONS.md (why these choices)
5. Fazer uma pequena mudança/bug fix
```

## 🔗 Links Rápidos

### Documentação Externa
- [React Native Docs](https://reactnative.dev)
- [Expo Docs](https://docs.expo.dev)
- [Supabase Docs](https://supabase.com/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)

### Comunidades
- [Expo Discord](https://chat.expo.dev)
- [React Native Community](https://github.com/react-native-community)
- [Supabase Community](https://discord.supabase.com)

## 📝 Atualizações Recentes

### v1.0.0 (28/04/2025)
- Criação inicial do projeto
- Setup Expo + TypeScript
- Integração Supabase
- Documentação completa

## ❓ Não Encontrou?

Se não encontrou a informação:

1. Verificar [FAQ.md](./FAQ.md)
2. Procurar em [Project_STRUCTURE.md](./PROJECT_STRUCTURE.md)
3. Pesquisar em [API.md](./API.md)
4. Abrir uma issue no repositório

## 📊 Estatísticas de Documentação

| Documento | Tamanho | Tópicos |
|-----------|---------|---------|
| README.md | 4KB | 10 |
| GETTING_STARTED.md | 8KB | 12 |
| API.md | 12KB | 15 |
| INTEGRATION.md | 15KB | 20 |
| PROJECT_STRUCTURE.md | 10KB | 12 |
| TECHNICAL_DECISIONS.md | 8KB | 14 |
| DEPLOYMENT.md | 10KB | 12 |
| FAQ.md | 12KB | 50+ |
| BACKEND_SETUP.md | 10KB | 10 |
| **Total** | **~89KB** | **~145** |

---

**Última atualização**: 28/04/2025

**Próximas seções a adicionar**:
- [ ] COMPONENTS.md - Guia de componentes
- [ ] TESTING.md - Guia de testes
- [ ] SECURITY.md - Melhores práticas de segurança
- [ ] PERFORMANCE.md - Guia de otimização
