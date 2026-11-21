# Vérification de Tempo 1.0.2

Vérifications réalisées le 21 novembre 2026 sur Windows 11 Famille x64, build 26200.

## Distribution

- Compilation x64 terminée sans erreur.
- `Tempo.exe` et `Désinstaller Tempo.exe` portent la version `1.0.2.0` et l’architecture PE x64.
- Le MSI porte la version `1.0.2` et conserve l’UpgradeCode des versions précédentes.
- Le ZIP contient uniquement l’installateur MSI, le désinstalleur et le guide.
- L’empreinte du ZIP correspond au fichier `.sha256` généré.

## Installation et mise à jour

- Mise à jour réelle de Tempo `1.0.1` vers `1.0.2` réussie avec Windows Installer.
- Application installée dans le profil utilisateur.
- Raccourcis créés sur le Bureau et dans le menu Démarrer.
- Les 408 fichiers présents dans `%LOCALAPPDATA%\TempoRadio` sont restés identiques après la mise à jour.
- Microsoft Edge WebView2 Runtime `157.0.4341.60` détecté et interface WebView2 initialisée.

## Désinstallation et réinstallation

- Désinstallation Windows terminée avec le code de sortie `0`.
- Application et raccourcis supprimés.
- Données locales conservées après désinstallation.
- Réinstallation `1.0.2` terminée avec le code de sortie `0`.
- Raccourcis recréés et données locales toujours identiques.

Le bouton de désinstallation intégré à Tempo utilise le même ProductCode enregistré par le MSI et lance Windows Installer. Son chemin de code et le ProductCode ont été contrôlés. Le dialogue interactif n’a pas été validé automatiquement afin de ne pas déclencher une seconde désinstallation visible.

## Limites du test

Windows 10 x64 n’était pas disponible dans l’environnement de vérification. La configuration du MSI cible Windows x64 avec .NET Framework 4.8 et WebView2, mais la compatibilité Windows 10 doit encore être confirmée sur une machine ou une machine virtuelle Windows 10 propre avant d’annoncer un test complet sur ce système.

## Signature et SmartScreen

Le MSI et les exécutables sont actuellement non signés. SmartScreen peut donc afficher « Windows a protégé votre ordinateur » ou « Éditeur inconnu », et certaines politiques d’entreprise peuvent bloquer l’exécution.

Une signature auto-signée gratuite ne résout pas ce problème pour une distribution publique, car son certificat n’est pas approuvé par défaut. Les options réalistes sont la publication MSIX via Microsoft Store, qui est signée par Microsoft, ou une signature Authenticode avec une identité vérifiée. Tempo utilise pour l’instant la publication GitHub, un avertissement clair et une empreinte SHA-256 vérifiable, sans imposer de service payant.
