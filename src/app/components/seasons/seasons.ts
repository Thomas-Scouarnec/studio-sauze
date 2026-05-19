import { ChangeDetectionStrategy, Component } from '@angular/core';

interface Season {
  id: string;
  modifier: string;
  marker: string;
  title: string;
  description: string;
  tags: string[];
  bgSymbol: string;
}

@Component({
  selector: 'app-seasons',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './seasons.html',
  styleUrl: './seasons.css',
  host: {
    id: 'seasons',
    role: 'region',
    'aria-labelledby': 'seasons-heading'
  }
})
export class SeasonsComponent {
  protected readonly seasons: Season[] = [
    {
      id: 'winter',
      modifier: 'winter',
      marker: 'Décembre – Avril',
      title: "L'hiver",
      description: "Le Sauze offre un domaine skiable varié relié à Super-Sauze, avec des pistes pour tous niveaux et une atmosphère authentique loin des grandes stations.",
      tags: ['Ski alpin', 'Snowboard', 'Raquettes', 'Ski de fond', 'Pra-Loup à 15 km'],
      bgSymbol: '❄'
    },
    {
      id: 'summer',
      modifier: 'summer',
      marker: 'Juin – Septembre',
      title: "L'été",
      description: "La vallée de l'Ubaye révèle ses trésors estivaux : randonnées dans le Parc National du Mercantour, VTT, baignade et canyoning sur fond de paysages grandioses.",
      tags: ['Randonnée', 'VTT', 'Mercantour', 'Barcelonnette', 'Canyoning'],
      bgSymbol: '☀'
    }
  ];
}
