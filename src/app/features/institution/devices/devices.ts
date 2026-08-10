import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InstitutionMember, VoltsDevice } from '../../../core/models/institution-portal.model';
import { InstitutionPortalService } from '../../../core/services/institution-portal.service';

@Component({selector:'app-devices',standalone:true,imports:[DatePipe,FormsModule],templateUrl:'./devices.html',styleUrl:'./devices.css'})
export class InstitutionDevices implements OnInit{
  private readonly service=inject(InstitutionPortalService); readonly items=signal<VoltsDevice[]>([]); readonly members=signal<InstitutionMember[]>([]); readonly loading=signal(true); readonly busyId=signal<string|null>(null); readonly assignments=signal<Record<string,string>>({}); readonly message=signal(''); readonly error=signal('');
  readonly assigned=computed(()=>this.items().filter(x=>!!x.assignedMemberId).length);
  ngOnInit(){this.load();}
  load(){this.loading.set(true);this.service.devices().subscribe({next:r=>{this.items.set(r.data??[]);this.loading.set(false)},error:e=>{this.loading.set(false);this.error.set(e?.error?.message??'No fue posible cargar los dispositivos.')}});this.service.members().subscribe({next:r=>this.members.set((r.data??[]).filter(x=>x.isActive))});}
  selected(id:string){return this.assignments()[id]??'';} setMember(id:string,e:Event){const value=(e.target as HTMLSelectElement).value;this.assignments.update(v=>({...v,[id]:value}));}
  assign(x:VoltsDevice){const memberId=this.selected(x.id);if(!memberId)return;this.busyId.set(x.id);this.service.assignDevice(x.id,memberId).subscribe({next:r=>{this.busyId.set(null);this.message.set(r.message??'Dispositivo asignado.');this.load()},error:e=>{this.busyId.set(null);this.error.set(e?.error?.message??'No fue posible asignar el dispositivo.')}});}
  unassign(x:VoltsDevice){if(!confirm(`¿Desasignar el dispositivo ${x.serialNumber}?`))return;this.busyId.set(x.id);this.service.unassignDevice(x.id).subscribe({next:r=>{this.busyId.set(null);this.message.set(r.message??'Dispositivo desasignado.');this.load()},error:e=>{this.busyId.set(null);this.error.set(e?.error?.message??'No fue posible desasignar el dispositivo.')}});}
  modeLabel(v:string){return v==='DiyKit'?'Kit DIY':v==='WorkshopAssist'?'Armado contigo':'Armado y listo';}
}
