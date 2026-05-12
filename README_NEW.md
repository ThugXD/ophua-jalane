# Ophua - Plataforma Digital de Cartão de Contato

Uma plataforma completa de cartão de contato digital com suporte mobile.

## 📱 Repositórios

### [jalane-reimagined](./jalane-reimagined)
Web app principal desenvolvida em React + TanStack Router com Supabase backend.

**Features**:
- 👤 Perfil e cartão de contato digital
- 📇 Gestão de contatos
- 👥 Admin panel para gerenciar usuários e empresas
- 📊 Analytics e estatísticas
- 📱 Suporte mobile via Capacitor
- 🌐 Web app responsiva

**Tech Stack**:
- Frontend: React 19, TypeScript, Tailwind CSS, Radix UI
- Backend: Supabase (PostgreSQL, Auth, Storage, Functions)
- Mobile: Capacitor
- Deployment: Vite + Cloudflare

**Documentação**: [jalane-reimagined/README.md](./jalane-reimagined/README.md)

### [Ophua-Mobile](./Ophua-Mobile) ⭐ NEW
Aplicação mobile nativa desenvolvida em React Native com Expo, que consome APIs do jalane-reimagined.

**Features**:
- 📱 App nativa iOS + Android
- 👤 Perfil e cartão digital
- 📋 Gestão de contatos
- 📸 Scanner de cartão de visita (OCR)
- 📊 Analytics
- 🌐 Suporte web
- 🎨 Tema claro/escuro
- 🌍 Multilíngue (PT/EN)

**Tech Stack**:
- Frontend: React Native, Expo, TypeScript, NativeWind
- State: React Query + Context
- Forms: React Hook Form + Zod
- Backend: Supabase (compartilhado com jalane-reimagined)
- Deployment: EAS

**Documentação**: [Ophua-Mobile/DOCUMENTATION_INDEX.md](./Ophua-Mobile/DOCUMENTATION_INDEX.md)

## 🚀 Começar

### Opção 1: Web (jalane-reimagined)
```bash
cd jalane-reimagined
npm install
npm run dev
```

### Opção 2: Mobile (Ophua-Mobile)
```bash
cd Ophua-Mobile
npm install
npm start
```

## 🏗️ Arquitetura

```
┌─────────────────────────────────────┐
│  Clientes                            │
├──────────────┬──────────────────────┤
│ Ophua-Mobile │  jalane-reimagined   │
│ (React Native)│  (React Web)        │
└──────────────┴──────────────────────┘
       │                 │
       └────────┬────────┘
                │
        ┌───────▼────────┐
        │   Supabase     │
        ├────────────────┤
        │ - Auth         │
        │ - PostgreSQL   │
        │ - Storage      │
        │ - Functions    │
        │ - Realtime     │
        └────────────────┘
```

## 📊 Estrutura

```
Ophua/
├── jalane-reimagined/    # Web app principal
│   ├── src/             # Código fonte
│   ├── supabase/        # Migrações e funções
│   └── README.md
│
├── Ophua-Mobile/        # Mobile app (React Native)
│   ├── app/             # Rotas (Expo Router)
│   ├── components/      # Componentes
│   ├── hooks/           # Custom hooks
│   ├── types/           # TypeScript types
│   ├── lib/             # Utilitários
│   └── DOCUMENTATION_INDEX.md
│
└── README.md            # Este arquivo
```

## 🔑 Conceitos Principais

### Dados Compartilhados
Ambos os clientes (web e mobile) compartilham:
- Mesmo database Supabase
- Mesmas policies de segurança (RLS)
- Mesmas autenticações
- Mesmo storage

### APIs
O Supabase fornece automaticamente:
- REST API para todas as tabelas
- Realtime subscriptions
- Auth management
- File storage

Não há backend separado - o Supabase é o backend!

## 🔐 Segurança

### Row Level Security (RLS)
- Usuários só veem seus próprios dados
- Policies no database enforçam segurança
- JWT authentication via Supabase

### Boas Práticas
- Nunca exponha `SERVICE_ROLE_KEY`
- Use apenas `ANON_KEY` no frontend
- Tokens são salvos seguramente no AsyncStorage (mobile) / localStorage (web)

## 📚 Documentação

### Começar
- [Ophua-Mobile Getting Started](./Ophua-Mobile/GETTING_STARTED.md) ⭐ **COMECE AQUI PARA MOBILE**
- [jalane-reimagined README](./jalane-reimagined/README.md)

### Entender
- [Ophua-Mobile Project Structure](./Ophua-Mobile/PROJECT_STRUCTURE.md)
- [Ophua-Mobile Technical Decisions](./Ophua-Mobile/TECHNICAL_DECISIONS.md)

### Desenvolver
- [API Documentation](./Ophua-Mobile/API.md)
- [Integration Guide](./Ophua-Mobile/INTEGRATION.md)
- [Backend Setup](./Ophua-Mobile/BACKEND_SETUP.md)

### Deploy
- [Deployment Guide](./Ophua-Mobile/DEPLOYMENT.md)

### Dúvidas
- [FAQ](./Ophua-Mobile/FAQ.md)

## 📱 Fluxo de Uso

### Web (jalane-reimagined)
```
Admin/Manager
    ↓
1. Criar empresa (grupo)
2. Convidar usuários
3. Gerenciar permissions
4. Ver analytics globais
5. Gerenciar templates (futuro)
```

### Mobile (Ophua-Mobile)
```
Usuário
    ↓
1. Fazer signup / login
2. Editar perfil e cartão
3. Gerenciar contatos
4. Compartilhar cartão
5. Receber contatos
6. Ver analytics pessoal
```

## 🛠️ Stack Completo

### Frontend
- **Web**: React 19, TypeScript, Tailwind CSS, Radix UI, React Router
- **Mobile**: React Native, TypeScript, NativeWind, Expo Router

### Backend
- **Database**: PostgreSQL (via Supabase)
- **Auth**: Supabase Auth (JWT)
- **Storage**: Supabase Storage
- **Realtime**: Supabase Realtime
- **Functions**: Deno (Supabase Functions)

### DevOps
- **Web Hosting**: Cloudflare Pages / Vite
- **Mobile Build**: EAS Build
- **Database**: Supabase
- **CI/CD**: GitHub Actions (futuro)

## 🚀 Deployment

### Web (jalane-reimagined)
```bash
npm run build
# Deploy to Cloudflare / Vercel / Netlify
```

### Mobile (Ophua-Mobile)
```bash
# iOS
eas build -p ios
eas submit -p ios

# Android
eas build -p android
eas submit -p android
```

## 🤝 Contribuição

1. Fork o repositório
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

MIT License - 2025

## 📞 Contato

Para dúvidas ou sugestões:
- Abra uma issue no repositório
- Envie um email para: [seu-email@example.com]

## 🎯 Roadmap

### v1.0 (Atual)
- ✅ Web app completa
- ✅ Mobile app básica
- ✅ Autenticação
- ✅ Perfil e cartão
- ✅ Contatos
- ✅ Analytics

### v1.1 (Próximo)
- 📋 Business card scanner (melhorado)
- 📋 Push notifications
- 📋 Offline support
- 📋 Admin mobile

### v2.0 (Futuro)
- 📋 Payment integration
- 📋 Video profiles
- 📋 QR codes
- 📋 Advanced analytics
- 📋 Custom themes

## 👥 Quem Somos

Ophua é uma plataforma desenvolvida para criar e compartilhar cartões de contato digitais profissionais.

---

**Última atualização**: 28/04/2025

Para mais informações, acesse:
- Web: [jalane-reimagined](./jalane-reimagined)
- Mobile: [Ophua-Mobile](./Ophua-Mobile)
