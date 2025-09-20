# Loading Screen Garry's Mod – Thème Vert Néon

Refonte graphique appliquée : passage d'une palette violette à un thème noir / blanc / vert néon inspiré de l'image fournie (logo vert lumineux).

## Palette

| Rôle | Couleur |
|------|---------|
| Fond principal | `#020302` |
| Fond alternatif | `#060a07` |
| Surface / panneaux | `#0d1510` |
| Bordure | `#123824` |
| Accent vert | `#00ff6a` |
| Accent vert alt | `#19ff83` |
| Texte principal | `#e7fbef` |
| Texte atténué | `#9fb7a8` |

Les variables sont définies dans `css/main.css` dans `:root`.

## Effets

* Glow néon : combinaison d'ombres externes autour des éléments accentués.
* Progress bar : gradient animé + balayage lumineux (animation `scan`).
* Historique : cartes translucides vert foncé avec légère bordure lumineuse.
* Blobs d'arrière-plan : gradients radiaux verts remplacent les violets.

## Ajustements HTML

`index.html` a été mis à jour pour retirer les classes Tailwind violettes et appliquer les styles verts (`progress-container-green`, `glow-text`, etc.).

## Personnalisation Rapide

Pour changer l'intensité du vert ou de la lueur :

1. Modifier `--color-accent` et `--color-accent-alt`.
2. Ajuster `--shadow-glow` si la luminosité est trop forte.

## Développement

Le chargement des ressources et la progression restent gérés par `js/main.js`. Aucune logique n'a été altérée, uniquement le style.

---
Si vous souhaitez ajouter un mode clair ou une autre couleur (ex: cyan ou magenta), créez un nouveau bloc `:root[data-theme="alt"] { ... }` et appliquez `document.documentElement.dataset.theme = 'alt';` dans un script.


