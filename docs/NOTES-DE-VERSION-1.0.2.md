# Tempo 1.0.2

Cette version fiabilise la distribution Windows et la documentation du projet.

## Changements

- Numéro `1.0.2` ajouté au MSI, à l’application et au désinstalleur.
- Archive Windows x64 versionnée avec son empreinte SHA-256.
- Téléchargement Windows placé au début du README.
- Fonctionnalités, confidentialité et fonctionnement local mieux expliqués.
- Licence clarifiée pour le code source, les modifications et la redistribution.
- Guide complété avec l’avertissement SmartScreen lié à l’absence de signature numérique.

## Installation et mise à jour

Télécharge `Tempo-Windows-x64-1.0.2.zip`, extrais entièrement le dossier puis lance `Installer Tempo.msi`. Le MSI met à jour une installation précédente de Tempo et conserve les tâches, les thèmes, l’historique et les réglages stockés dans `%LOCALAPPDATA%\TempoRadio`.

Tempo utilise Microsoft Edge WebView2 Runtime. Si ce composant manque, l’application affiche un message avec la page officielle de téléchargement.

## Vérification du téléchargement

Compare l’empreinte SHA-256 du ZIP avec le fichier `Tempo-Windows-x64-1.0.2.sha256` joint à la Release.

    a74e5545feb18ccce2f470d055888ddb720fe092fc7453ad0049b197fb2c0faa  Tempo-Windows-x64-1.0.2.zip

Tempo 1.0.2 n’est pas signé numériquement. Windows peut afficher SmartScreen ou « Éditeur inconnu ». Télécharge l’application uniquement depuis la Release GitHub officielle et vérifie son empreinte avant l’installation.
