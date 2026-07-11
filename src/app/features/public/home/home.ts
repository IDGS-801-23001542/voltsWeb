import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  readonly interactions = [
    {
      img: 'assets/images/btn_food.png',
      label: 'Alimentar',
      desc: 'Enseña rutinas de nutrición responsable.'
    },
    {
      img: 'assets/images/btn_pet.png',
      label: 'Acariciar',
      desc: 'Desarrolla empatía, respeto y ternura.'
    },
    {
      img: 'assets/images/btn_play.png',
      label: 'Jugar',
      desc: 'Fomenta la actividad física y fortalece el vínculo.'
    },
    {
      img: 'assets/images/btn_sleep.png',
      label: 'Descansar',
      desc: 'Permite aprender sobre ciclos y necesidades naturales.'
    }
  ];

  readonly ecoFeatures = [
    {
      icon: '♻️',
      title: '100% Reciclado',
      text:
        'Fabricado con plásticos recuperados y telas de PET reciclado.'
    },
    {
      icon: '🌱',
      title: 'Cero Tóxicos',
      text:
        'Utiliza pinturas a base de agua, sin BPA ni metales pesados.'
    },
    {
      icon: '📦',
      title: 'Empaque Verde',
      text:
        'Caja de cartón reciclado e impresión con tintas vegetales.'
    },
    {
      icon: '🌍',
      title: 'Huella Reducida',
      text:
        'Producción local y una cadena de suministro más responsable.'
    }
  ];

  constructor(
    public readonly theme: ThemeService,
    private readonly router: Router
  ) {}

  goTo(path: string): void {
    this.router.navigate([path]);
  }
}
