# Tempo

Une console de bureau pour organiser ses séances de travail, prendre des pauses et suivre son activité.

Créée par **Adeline Courtois**, graphiste freelance à Lille, spécialisée en logos minimalistes et identités visuelles pour les SaaS B2B.

[Site et portfolio](https://adelinecourtois.fr/) · [LinkedIn](https://fr.linkedin.com/in/adelinecourtois) · contact@adelinecourtois.fr

## Installer

Télécharge [Tempo pour Windows 64 bits](release/Tempo-Windows.zip), extrais le ZIP et lance **Installer Tempo.msi**. Un raccourci Tempo apparaît sur ton bureau.

Le dossier contient aussi **Désinstaller Tempo.exe** et le guide utilisateur. L’application nécessite Microsoft Edge WebView2 Runtime.

## Fonctionnalités

### Programmer une vraie séance de travail

Indique la durée totale de la séance, le nombre de pauses et la durée de chaque pause. Tempo répartit le programme et lance un décompte visible en permanence. Une séance peut durer de 1 à 480 minutes et contenir jusqu’à 12 pauses.

Pendant la séance, tu peux déclencher la prochaine pause, la terminer avec **Reprendre**, ajouter cinq minutes à la phase en cours ou arrêter complètement. Le temps réellement écoulé est alors ajouté à ton historique. C’est pratique pour réserver une heure à du code, une proposition commerciale ou une tâche de fond sans surveiller l’horloge du système.

### Recevoir un rappel au bon moment

Tempo sonne lorsqu’une phase de travail ou une pause se termine. Tu peux utiliser le carillon intégré, choisir ton propre fichier WAV ou passer l’application en silencieux.

Le rappel continue de fonctionner lorsque la fenêtre est réduite ou en mode Mini, à condition que Tempo reste ouvert. Tu peux donc garder ton attention sur ton travail et laisser l’application surveiller le temps.

### Voir le temps réellement travaillé

Le tableau de bord affiche le temps de travail cumulé aujourd’hui, le nombre de pauses et leur durée totale. Le graphique de la journée distingue les périodes de travail et de pause sur une ligne de 24 heures.

L’onglet **Activité** permet ensuite de consulter une journée, une semaine ou un mois et de revenir sur les périodes précédentes. Tu vois rapidement si ta journée a été morcelée, si tu as enchaîné une longue session ou si tu as pris les pauses prévues.

### Garder les tâches du jour sous les yeux

Ajoute une tâche ou un rendez-vous dans **À faire**, avec une heure facultative. Une saisie comme « Réunion à 8 h » peut aussi programmer automatiquement le rappel à 08:00. Les tâches peuvent être modifiées, cochées lorsqu’elles sont terminées ou supprimées.

La prochaine tâche reste visible depuis la console principale. Les tâches non terminées restent disponibles le lendemain, ce qui évite de perdre une idée ou un rappel en fermant l’application.

### Retrouver ses rendez-vous dans Tempo

Connecte un calendrier avec un lien d’abonnement iCalendar ou `webcal`, ou importe un fichier `.ics`. Tempo affiche les prochains rendez-vous et relit un calendrier connecté toutes les dix minutes pendant son ouverture.

Tu choisis quand être prévenu : à l’heure, 5, 10, 15 ou 30 minutes avant, ou une heure avant. Les rendez-vous avec une heure déclenchent une alerte, y compris lorsque Tempo est réduit. Les événements prévus sur une journée entière restent visibles sans déclencher de sonnerie.

### Écouter de la musique sans quitter la console

L’onglet **Musique** regroupe les stations de radio, leur volume et le bouton d’arrêt. Tu peux également coller le lien d’une vidéo ou d’une playlist YouTube : le lecteur s’ouvre directement dans Tempo et se met en pause lorsque tu quittes l’onglet Musique.

Un lien Deezer ou Spotify s’ouvre dans le navigateur associé. Tu peux aussi sélectionner un fichier audio présent sur l’ordinateur. Les fonctions de radio et de streaming nécessitent une connexion Internet.

### Garder Tempo à la bonne place

La fenêtre se déplace et se redimensionne comme une petite console de bureau. Le bouton **Épingler** la maintient devant les autres applications. Le mode **Mini** réduit l’interface à l’horloge et au temps utile pour occuper peu de place dans un coin de l’écran.

### Changer complètement d’univers graphique

Les thèmes ne changent pas seulement une couleur : ils peuvent modifier la façade, les décors, la typographie et la disposition des informations. Tu peux choisir un univers fourni, ajuster sa palette, ajouter une illustration et enregistrer ta propre version.

Chaque thème peut être exporté au format `.tempo-theme`, partagé puis importé sur un autre ordinateur. D’autres thèmes seront proposés prochainement au téléchargement.

### Utiliser ses données sans créer de compte

Tempo fonctionne directement sur Windows et n’exige aucun compte. Les réglages, les tâches et l’historique sont enregistrés dans `%LOCALAPPDATA%\TempoRadio` sur l’ordinateur. Les rappels fonctionnent tant que l’application reste ouverte. Seuls les radios, les services musicaux et les calendriers distants utilisent Internet.

## Pourquoi utiliser Tempo ?

Tempo rassemble le minuteur, les pauses, les tâches, les rendez-vous, l’historique et la musique dans une seule fenêtre. Un fondateur ou un développeur peut lancer une session, garder son prochain appel visible et vérifier le temps consacré à son travail sans multiplier les outils pendant la journée.

## Exemples de thèmes

Tempo contient plusieurs univers graphiques qui modifient les couleurs, les décors et la disposition de la console. Voici quelques exemples inclus dans cette version.

![Galerie des thèmes disponibles dans Tempo](assets/screenshots/theme-gallery.png)

| Circuits temporels | Monde inversé |
| --- | --- |
| ![Thème Circuits temporels](assets/screenshots/theme-circuits-temporels.png) | ![Thème inspiré du Monde inversé](assets/screenshots/theme-stranger-things.png) |

| Nouveau-Mexique | Vice City |
| --- | --- |
| ![Thème inspiré du Nouveau-Mexique](assets/screenshots/theme-breaking-bad.png) | ![Thème inspiré de Vice City](assets/screenshots/theme-gta-vi.png) |

Ces thèmes sont des exemples. D’autres thèmes seront proposés prochainement au téléchargement et pourront être importés directement dans Tempo au format `.tempo-theme`.

## Compiler

Sur Windows 64 bits, avec PowerShell 5.1 ou ultérieur et .NET Framework 4.8, lance à la racine du projet

    powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\build.ps1

Le script restaure les versions figées de NAudio, WebView2 et WiX, contrôle les archives par SHA-256, puis construit l’application, le MSI et le désinstalleur. La distribution apparaît dans dist/Tempo-Windows.zip.

Pour une nouvelle version, augmente Product/@Version dans installer/Tempo.wxs. Conserve UpgradeCode pour permettre les mises à niveau.

## Organisation du projet

- src/ — application Windows et désinstalleur.
- ui/ — interface locale et décors.
- assets/ — icône.
- scripts/ — restauration et compilation.
- installer/ — définition du MSI.
- themes/ — exemple de thème importable.
- vendor/ et licenses/ — composant JavaScript intégré et notices.
- docs/ — guide utilisateur.
- release/ — archive utilisateur prête à télécharger.

## Créer un thème

Dans Thèmes, sélectionne un univers, ajuste ses couleurs et ajoute éventuellement une illustration. Exporte le thème actif au format .tempo-theme. Ce fichier peut être importé par un autre utilisateur. Un exemple est fourni dans themes/.

## Utilisation

Tempo est une ressource gratuite. Sa revente, seule ou dans un lot, un abonnement ou une offre payante, nécessite l’accord écrit d’Adeline Courtois. Consulte [les conditions](LICENSE.txt) et [les notices des composants tiers](THIRD-PARTY-NOTICES.md).

Les noms et univers évoqués appartiennent à leurs titulaires respectifs. Tempo est une création indépendante.

