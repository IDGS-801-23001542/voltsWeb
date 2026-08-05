import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-learning',
  standalone: true,
  templateUrl: './learning.html',
  styleUrl: './learning.css'
})
export class Learning {
  readonly theories = [
    {
      icon: '🔬',
      title: 'Aprendizaje experiencial',
      text:
        'El niño no solo lee sobre el cuidado de los animales: lo vive. Cada interacción crea un ciclo de experiencia, reflexión y acción.'
    },
    {
      icon: '💛',
      title: 'Vínculo y empatía',
      text:
        'La relación con VOLTS permite practicar afecto, cuidado y responsabilidad dentro de un entorno seguro, cercano y educativo.'
    },
    {
      icon: '🌱',
      title: 'Educación ambiental',
      text:
        'El juguete permite comprender de manera tangible el reciclaje, la reutilización de materiales y los principios de economía circular.'
    }
  ];

  readonly pillars = [
    {
      image: 'assets/images/btn_food.png',
      title: 'Nutrición y responsabilidad',
      text:
        'Alimentar a VOLTS refuerza rutinas de cuidado y permite comprender que los seres vivos dependen de acciones constantes.',
      className: 'pillar-card pillar-green'
    },
    {
      image: 'assets/images/btn_pet.png',
      title: 'Vínculo afectivo y empatía',
      text:
        'Acariciar a VOLTS fomenta el reconocimiento de emociones, la ternura y el respeto hacia otros seres vivos.',
      className: 'pillar-card pillar-purple'
    },
    {
      image: 'assets/images/btn_play.png',
      title: 'Actividad física y juego',
      text:
        'El modo de juego promueve movimiento, colaboración, coordinación motriz y convivencia con otros niños.',
      className: 'pillar-card pillar-cyan'
    },
    {
      image: 'assets/images/btn_sleep.png',
      title: 'Ciclos y autorregulación',
      text:
        'El descanso permite explicar ritmos naturales, sueño, paciencia y respeto por las necesidades de otros.',
      className: 'pillar-card pillar-yellow'
    }
  ];

  readonly stages = [
    {
      age: '3–5 años',
      icon: '🌱',
      title: 'Semilla de empatía',
      className: 'stage-card stage-green',
      goals: [
        'Reconocer necesidades básicas de los animales.',
        'Relacionar acciones de cuidado con consecuencias positivas.',
        'Expresar emociones como felicidad, cansancio o hambre.'
      ]
    },
    {
      age: '6–8 años',
      icon: '🌿',
      title: 'Rutinas con propósito',
      className: 'stage-card stage-purple',
      goals: [
        'Comprender alimentación, descanso y juego.',
        'Desarrollar constancia y responsabilidad.',
        'Introducir reciclaje y reutilización de materiales.'
      ]
    },
    {
      age: '9–11 años',
      icon: '🌳',
      title: 'Conciencia ambiental',
      className: 'stage-card stage-cyan',
      goals: [
        'Relacionar bienestar animal y cuidado ambiental.',
        'Reflexionar sobre el impacto de los residuos.',
        'Practicar principios de economía circular.'
      ]
    }
  ];

  readonly curriculum = [
    {
      subject: 'Ciencias Naturales',
      grade: '1°–4°',
      content:
        'Seres vivos, ecosistemas, alimentación y reciclaje.'
    },
    {
      subject: 'Educación Socioemocional',
      grade: '1°–6°',
      content:
        'Empatía, responsabilidad, autorregulación y convivencia.'
    },
    {
      subject: 'Español y Comunicación',
      grade: '2°–5°',
      content:
        'Descripción, narración de experiencias y vocabulario emocional.'
    },
    {
      subject: 'Formación Cívica',
      grade: '3°–6°',
      content:
        'Ciudadanía ambiental, cuidado animal y economía circular.'
    },
    {
      subject: 'Matemáticas',
      grade: '2°–4°',
      content:
        'Registro de rutinas, gráficas y secuencias temporales.'
    }
  ];

  readonly testimonials = [
    {
      name: 'Mtra. Lucía Ramírez',
      role: 'Docente de segundo grado',
      quote:
        'VOLTS convirtió una actividad de cuidado en una experiencia que mis alumnos esperaban todos los días.'
    },
    {
      name: 'Dr. Ernesto Solís',
      role: 'Psicólogo infantil',
      quote:
        'El juguete funciona como mediador entre el niño y el concepto de responsabilidad.'
    },
    {
      name: 'Ana Flores',
      role: 'Madre de familia',
      quote:
        'Mi hijo comenzó a separar residuos después de comprender que VOLTS utiliza materiales reciclados.'
    }
  ];

  constructor(
    private readonly router: Router
  ) {}

  goToQuote(): void {
    this.router.navigate(['/cotizacion']);
  }
}



