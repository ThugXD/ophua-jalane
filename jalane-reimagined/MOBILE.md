# Empacotar como app Android e iOS (Capacitor)

A app web no Lovable continua igual. Estes passos são para gerar os instaladores nativos no **seu computador**.

## 1. Pré-requisitos

- **Android**: [Android Studio](https://developer.android.com/studio) (Windows / Mac / Linux) + JDK 17.
- **iOS**: Mac com [Xcode](https://apps.apple.com/app/xcode/id497799835) + CocoaPods (`sudo gem install cocoapods`).
- Node 20+ e npm instalados.

## 2. Exportar o projeto

No editor Lovable: **GitHub → Connect → Create Repository**. Depois localmente:

```bash
git clone <url-do-seu-repo>
cd <pasta>
npm install
```

## 3. Adicionar plataformas nativas

```bash
npx cap add android
npx cap add ios     # apenas em Mac
```

Isto cria as pastas `android/` e `ios/` (já estão no `.gitignore` por convenção — pode commitá-las se quiser versionar).

## 4. Build + sync

Sempre que alterar código web ou plugins:

```bash
npm run build
npx cap sync
```

> **Modo "live reload"**: a `capacitor.config.ts` já aponta para `https://ophua.lovable.app`, ou seja, a app nativa carrega sempre a versão publicada. Basta clicar em **Update** no Lovable e a app móvel mostra a nova versão sem republicar nas lojas. Se quiser empacotar offline (HTML estático dentro do APK/IPA), remova o bloco `server.url` em `capacitor.config.ts`.

## 5. Ícones e splash screen

Coloque um ícone quadrado (mínimo 1024×1024) em `resources/icon.png` e um splash (2732×2732) em `resources/splash.png`, depois:

```bash
npx capacitor-assets generate
```

## 6. Abrir nos IDEs nativos

```bash
npx cap open android   # Android Studio
npx cap open ios       # Xcode
```

- **Android**: Build → Generate Signed Bundle/APK → AAB (para Play Store).
- **iOS**: Product → Archive → Distribute App → App Store Connect.

## 7. Permissões usadas

Já incluímos plugins comuns (câmara, push, partilha, network, haptics, preferences). Configure as permissões nos manifests quando necessário:

- **Android**: `android/app/src/main/AndroidManifest.xml`
- **iOS**: `ios/App/App/Info.plist` (chaves `NSCameraUsageDescription`, etc.)

## 8. Contas de developer

- Google Play: ~25 USD único — https://play.google.com/console
- Apple Developer: 99 USD/ano — https://developer.apple.com/programs/

## Atualizações futuras

- Mudanças **de UI/lógica web**: clique em **Update** no Lovable → aparece automaticamente na app (graças ao `server.url`).
- Mudanças que envolvem **plugins novos / permissões / ícones**: precisa de novo `npx cap sync`, novo build no IDE nativo, e nova submissão às lojas.
