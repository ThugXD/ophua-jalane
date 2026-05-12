# 🚀 Deployment Guide

Guia completo para fazer deploy do Ophua-Mobile para iOS e Android.

## Visão Geral

```
Development → Testing → Beta → Production
     ↓            ↓        ↓        ↓
  Local       Emulator  TestFlight  App Store
             / Expo Go    / Beta   / Play Store
```

## Pré-requisitos

### Para iOS
- Apple Developer Account ($99/ano)
- Mac com Xcode
- Apple Distribution Certificate
- Provisioning Profile

### Para Android
- Google Play Developer Account ($25 one-time)
- Keystore gerado
- Google Play Console acesso

### Para ambos
- EAS CLI: `npm install -g eas-cli`
- Estar logado: `eas login`

## 1. Configurar EAS

### 1.1 Inicializar EAS

```bash
cd Ophua-Mobile
eas init
```

Isso cria `eas.json` com configurações de build.

### 1.2 Editar eas.json

```json
{
  "cli": {
    "version": ">= 0.0.0"
  },
  "build": {
    "development": {
      "distribution": "internal",
      "android": {
        "gradleCommand": ":app:assembleDebug"
      },
      "ios": {
        "buildConfiguration": "Debug"
      }
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "distribution": "store"
    }
  },
  "submit": {
    "production": {
      "ios": {
        "action": "upload"
      },
      "android": {
        "action": "google-play"
      }
    }
  }
}
```

## 2. Preparar App para Build

### 2.1 Atualizar app.json

```json
{
  "expo": {
    "name": "Ophua Mobile",
    "slug": "ophua-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png"
    },
    "ios": {
      "supportsTabletMode": true,
      "bundleIdentifier": "com.ophua.mobile",
      "buildNumber": "1"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.ophua.mobile",
      "versionCode": 1
    },
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Permite usar a câmera para scanner de cartão"
        }
      ]
    ]
  }
}
```

### 2.2 Gerar Icons e Splash

```bash
# Fazer download das imagens
# icon.png (1024x1024)
# splash.png (1080x1920)

# Ou usar:
npx expo-icon-builder assets/icon.png --output ./assets/icon
```

### 2.3 Incrementar Versão

```bash
# iOS
nano app.json
# Aumentar version e ios.buildNumber

# Android
nano app.json
# Aumentar version e android.versionCode
```

## 3. Build para iOS

### 3.1 Preparar Credenciais Apple

```bash
eas credentials -p ios
```

Siga as instruções para:
1. Create Apple App ID
2. Create Distribution Certificate
3. Create Provisioning Profile

### 3.2 Build

```bash
# Development (para testing)
eas build -p ios --profile development

# Production (para App Store)
eas build -p ios --profile production
```

Isso pode levar 20-30 minutos.

### 3.3 Submeter para App Store

```bash
eas submit -p ios --latest
```

Ou manualmente:
1. Download o `.ipa`
2. Abra no Transporter
3. Selecione App Store
4. Upload

### 3.4 Aguardar Revisão

- Apple leva 1-3 dias para revisar
- Pode pedir mudanças (screenshots, descrição, etc)
- Quando aprovado, automaticamente no App Store

## 4. Build para Android

### 4.1 Preparar Keystore

Se é primeira vez:
```bash
keytool -genkey-pair -v -keystore ophua-mobile.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias ophua-key
```

Ou use credenciais EAS:
```bash
eas credentials -p android
```

### 4.2 Build

```bash
# Development
eas build -p android --profile development

# Production
eas build -p android --profile production
```

### 4.3 Submeter para Play Store

```bash
eas submit -p android --latest
```

Ou manualmente:
1. Download o `.aab` (Android App Bundle)
2. Faça upload no Google Play Console
3. Complete store listing
4. Selecione países
5. Submit for review

### 4.4 Aguardar Revisão

- Google Play leva 2-24 horas
- Menos rigoroso que Apple
- Quando aprovado, aparece em Play Store

## 5. Versioning Strategy

Seguir [Semantic Versioning](https://semver.org/):
- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (1.1.0): Novas features
- **PATCH** (1.0.1): Bug fixes

### Exemplo

```
v1.0.0 - Initial release
v1.1.0 - Add business card scanner
v1.1.1 - Fix authentication bug
v2.0.0 - Complete redesign
```

## 6. Testing Antes de Build

### 6.1 Testes Locais

```bash
npm test
npm run lint
```

### 6.2 Build Local

```bash
eas build -p android --local
```

### 6.3 TestFlight (iOS) / Internal Testing (Android)

Distribuir para testers antes de produção:

```bash
# Enviar para TestFlight
eas submit -p ios --latest

# Enviar para Internal Testing
eas submit -p android --latest
```

## 7. Monitoring em Produção

### Erros e Crashes

Use Sentry:

```bash
npm install @sentry/react-native
```

```typescript
import * as Sentry from "@sentry/react-native";

Sentry.init({
  dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",
});
```

### Analytics

```bash
npm install expo-firebase-analytics
```

## 8. Checklist Pre-Deploy

- [ ] Versão atualizada em `app.json`
- [ ] Código testado localmente
- [ ] Sem errors de lint (`npm run lint`)
- [ ] Variáveis de ambiente configuradas
- [ ] Icons e splash images preparados
- [ ] Privacy policy e terms of service prontos
- [ ] Screenshots de app store preparados
- [ ] Descrição da app escrita
- [ ] Credentials da Apple/Google configurados
- [ ] Build de teste passou

## 9. Troubleshooting

### Build falha com erro de credentials
```bash
eas credentials -p [ios|android] --clear
eas credentials -p [ios|android]
```

### Submissão rejeitada pela Apple
- Revisar guidelines da Apple
- Adicionar screenshots melhor
- Reescrever descrição
- Resubmeter

### Submissão rejeitada pelo Google Play
- Revisar content rating questionnaire
- Adicionar privacy policy
- Teste bem em emulator antes

### App crashes em produção
1. Verificar Sentry
2. Fazer hotfix
3. Incrementar patch version
4. Fazer novo build
5. Resubmeter

## 10. Release Notes

Criar changelog para cada versão:

```markdown
# v1.1.0 - 2025-05-15

## Novas Features
- Adicionar suporte para scanner de cartão de visita via câmera
- Melhorar performance de carregamento de contatos

## Bug Fixes
- Corrigir crash ao sair da app durante upload
- Corrigir autenticação expirada em background

## Melhorias
- UI mais responsiva
- Melhor internacionalização

## Download
- [iOS](link)
- [Android](link)
```

## 11. Rollback

Se identificado bug crítico após deploy:

```bash
# Re-submeter versão anterior
eas submit -p [ios|android] --id=BUILD_ID_ANTERIOR
```

## 12. Continuous Deployment (Futuro)

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    tags:
      - 'v*'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm test
      - run: eas build -p android
      - run: eas submit -p android --latest
```

## Recursos

- [Expo Publishing Docs](https://docs.expo.dev/build/setup/)
- [App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policies](https://play.google.com/about/developer-content-policy/)
- [EAS Documentation](https://docs.expo.dev/eas/)

---

**Última atualização**: 28/04/2025
