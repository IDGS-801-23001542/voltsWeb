import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InstitutionMember } from '../../../core/models/institution-portal.model';
import { License } from '../../../core/models/license.model';
import { InstitutionPortalService } from '../../../core/services/institution-portal.service';

@Component({selector:'app-licenses',standalone:true,imports:[DatePipe,FormsModule],templateUrl:'./licenses.html',styleUrl:'./licenses.css'})
export class InstitutionLicenses implements OnInit{
  private readonly service=inject(InstitutionPortalService); readonly items=signal<License[]>([]); readonly members=signal<InstitutionMember[]>([]); readonly loading=signal(true); readonly busyId=signal<string|null>(null); readonly message=signal(''); readonly error=signal(''); readonly assignments=signal<Record<string,string>>({});
  readonly available=computed(()=>this.items().filter(x=>x.status==='Available').length); readonly assigned=computed(()=>this.items().filter(x=>x.status==='Active'&&!!x.assignedMemberId).length);
  ngOnInit(){this.load();}
  load(){this.loading.set(true);this.service.licenses().subscribe({next:r=>{this.items.set(r.data??[]);this.loading.set(false)},error:e=>{this.loading.set(false);this.error.set(e?.error?.message??'No fue posible cargar las licencias.')}});this.service.members().subscribe({next:r=>this.members.set((r.data??[]).filter(x=>x.isActive))});}
  setMember(licenseId:string,event:Event){const value=(event.target as HTMLSelectElement).value;this.assignments.update(v=>({...v,[licenseId]:value}));}
  selected(licenseId:string){return this.assignments()[licenseId]??'';}
  assign(x:License){const memberId=this.selected(x.id);if(!memberId)return;this.busyId.set(x.id);this.error.set('');this.service.assignLicense(x.id,memberId).subscribe({next:r=>{this.busyId.set(null);this.message.set(r.message??'Licencia asignada.');this.load()},error:e=>{this.busyId.set(null);this.error.set(e?.error?.message??'No fue posible asignar la licencia.')}});}
  unassign(x:License){if(!confirm(`¿Dejar disponible la licencia ${x.licenseCode}?`))return;this.busyId.set(x.id);this.service.unassignLicense(x.id).subscribe({next:r=>{this.busyId.set(null);this.message.set(r.message??'Licencia disponible.');this.load()},error:e=>{this.busyId.set(null);this.error.set(e?.error?.message??'No fue posible desasignar la licencia.')}});}
  groupFor(memberId?:string|null){return this.members().find(m=>m.id===memberId)?.groupName||'Sin grupo';}
  statusLabel(s:string){return s==='Available'?'Disponible':s==='Active'?'Asignada / activa':s==='Expired'?'Expirada':s==='Revoked'?'Revocada':s;}
}
