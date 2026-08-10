import { Component, OnInit, inject, signal } from '@angular/core';
import { Documentation } from '../../../core/models/documentation.model';
import { DocumentationService } from '../../../core/services/documentation.service';

@Component({ selector:'app-institution-resources', standalone:true, templateUrl:'./resources.html', styleUrl:'./resources.css' })
export class InstitutionResources implements OnInit {
  private readonly service=inject(DocumentationService);
  readonly documents=signal<Documentation[]>([]); readonly loading=signal(true); readonly message=signal(''); readonly error=signal('');
  ngOnInit(){this.load();}
  load(){this.loading.set(true);this.error.set('');this.service.getMyResources().subscribe({next:r=>{this.documents.set(r.data??[]);this.message.set(r.message??'');this.loading.set(false)},error:e=>{this.loading.set(false);this.error.set(e?.error?.message??'No fue posible cargar los recursos institucionales.')}});}
  icon(type:Documentation['documentType']){return ({Manual:'📘',QuickGuide:'🧭',Firmware:'🔧',Video:'🎬',AndroidApp:'📱',EducationalResource:'🎓',Warranty:'🛡️',Other:'📎'} as Record<Documentation['documentType'],string>)[type]??'📎';}
  typeLabel(type:Documentation['documentType']){return ({Manual:'Manual',QuickGuide:'Guía rápida',Firmware:'Firmware',Video:'Video',AndroidApp:'Aplicación Android',EducationalResource:'Recurso educativo',Warranty:'Garantía',Other:'Otro'} as Record<Documentation['documentType'],string>)[type];}
}
