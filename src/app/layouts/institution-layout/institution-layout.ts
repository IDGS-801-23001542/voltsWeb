import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { PublicHeader } from '../../shared/components/public-header/public-header';

@Component({
  selector: 'app-institution-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    PublicHeader
  ],
  templateUrl: './institution-layout.html',
  styleUrl: './institution-layout.css'
})
export class InstitutionLayout {
  readonly portalLinks = [
    { path: '/institucion', label: 'Resumen', exact: true },
    { path: '/institucion/pedidos', label: 'Pedidos', exact: false },
    { path: '/institucion/licencias', label: 'Licencias', exact: false },
    { path: '/institucion/dispositivos', label: 'Dispositivos', exact: false },
    { path: '/institucion/personas', label: 'Personas', exact: false },
    { path: '/institucion/grupos', label: 'Grupos', exact: false },
    { path: '/institucion/recursos', label: 'Recursos', exact: false },
    { path: '/institucion/soporte', label: 'Soporte', exact: false }
  ];
}
