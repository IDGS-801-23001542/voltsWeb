import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

interface FaqItem {
  icon: string;
  category: string;
  question: string;
  answer: string;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './faq.html',
  styleUrl: './faq.css'
})
export class Faq {
  readonly openIndex = signal<number | null>(0);

  readonly questions: FaqItem[] = [
    {
      icon: '🐶',
      category: 'Proyecto',
      question: '¿Qué es VOLTS?',
      answer:
        'VOLTS es un perro robot educativo creado para que niños y familias practiquen cuidado, responsabilidad y conciencia ambiental mediante el juego.'
    },
    {
      icon: '♻️',
      category: 'Materiales',
      question: '¿De qué materiales está hecho?',
      answer:
        'El prototipo utiliza principalmente cartón y materiales reutilizados, además de componentes electrónicos como ESP32, servomotores y un LED RGB.'
    },
    {
      icon: '🧒',
      category: 'Edades',
      question: '¿Para qué edades está recomendado?',
      answer:
        'La propuesta educativa está dirigida principalmente a niños de 3 a 11 años, con aprendizajes adaptados a diferentes etapas.'
    },
    {
      icon: '🎓',
      category: 'Aprendizaje',
      question: '¿Cómo enseña a los niños?',
      answer:
        'VOLTS utiliza interacciones de alimentación, cariño, juego y descanso para reforzar rutinas, empatía y responsabilidad.'
    },
    {
      icon: '📶',
      category: 'Conectividad',
      question: '¿Necesita internet para funcionar?',
      answer:
        'El control directo entre la aplicación Android y el robot funciona mediante Bluetooth. Algunas funciones futuras del ecosistema sí podrán utilizar internet.'
    },
    {
      icon: '🔋',
      category: 'Energía',
      question: '¿Cómo se alimenta eléctricamente?',
      answer:
        'El prototipo utiliza baterías y regulación de voltaje para alimentar de forma segura al ESP32 y a los servomotores.'
    },
    {
      icon: '🏫',
      category: 'Educación',
      question: '¿Puede utilizarse en escuelas?',
      answer:
        'Sí. El plan institucional contempla recursos pedagógicos, administración de grupos, reportes y capacitación.'
    },
    {
      icon: '📝',
      category: 'Cotización',
      question: '¿Cómo solicito una cotización?',
      answer:
        'Selecciona la sección Cotización, elige un plan, indica la cantidad de unidades y completa tus datos.'
    }
  ];

  toggle(index: number): void {
    this.openIndex.update(current =>
      current === index ? null : index
    );
  }
}



