import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FlatInfoService } from '../../services/flat-info.service';

@Component({
  selector: 'app-equipment',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './equipment.html',
  styleUrl: './equipment.css',
  host: {
    id: 'equipment',
    role: 'region',
    'aria-labelledby': 'equipment-heading'
  }
})
export class EquipmentComponent {
  protected readonly flatInfo = inject(FlatInfoService);
}
