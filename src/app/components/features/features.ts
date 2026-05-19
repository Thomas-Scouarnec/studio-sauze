import { ChangeDetectionStrategy, Component } from '@angular/core';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-features',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './features.html',
  styleUrl: './features.css',
  host: {
    id: 'features',
    role: 'region',
    'aria-labelledby': 'features-heading'
  }
})
export class FeaturesComponent {
  protected readonly features: Feature[] = [
    {
      icon: '⛷️',
      title: 'Skis aux pieds',
      description: "Accès direct aux pistes depuis la résidence. Pas de navette, pas de marche — chaussez et partez."
    },
    {
      icon: '🛏️',
      title: 'Grand coin montagne',
      description: "Un espace nuit généreux pouvant accueillir un lit double, pensé pour le repos après les pistes."
    },
    {
      icon: '🍳',
      title: 'Coin cuisine',
      description: "Cuisine équipée dans le séjour pour préparer vos repas en toute autonomie."
    },
    {
      icon: '🚿',
      title: 'Salle de bain & WC',
      description: "Salle de bain complète et WC séparés pour plus de confort."
    },
    {
      icon: '🎿',
      title: 'Rangements',
      description: "Deux placards dans l'entrée pour ranger skis, équipements et bagages."
    },
    {
      icon: '🏡',
      title: 'Résidence de standing',
      description: "Appartement dans une résidence montagne bien entretenue, à l'ambiance chaleureuse et conviviale."
    }
  ];
}
