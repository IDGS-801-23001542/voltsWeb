import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InstitutionGroup, InstitutionMember } from '../../../core/models/institution-portal.model';
import { InstitutionPortalService } from '../../../core/services/institution-portal.service';

@Component({ selector:'app-groups', standalone:true, imports:[ReactiveFormsModule], templateUrl:'./groups.html', styleUrl:'./groups.css' })
export class InstitutionGroups implements OnInit {
  private readonly service=inject(InstitutionPortalService); private readonly fb=inject(FormBuilder);
  readonly items=signal<InstitutionGroup[]>([]); readonly members=signal<InstitutionMember[]>([]); readonly editing=signal<InstitutionGroup|null>(null); readonly loading=signal(true); readonly saving=signal(false); readonly message=signal(''); readonly error=signal('');
  readonly form=this.fb.nonNullable.group({name:['',[Validators.required,Validators.minLength(2),Validators.maxLength(100)]],description:[''],teacherMemberId:[''],isActive:[true]});
  readonly activeCount=computed(()=>this.items().filter(x=>x.isActive).length);
  ngOnInit(){this.load();}
  load(){this.loading.set(true);this.service.groups().subscribe({next:r=>{this.items.set(r.data??[]);this.loading.set(false)},error:e=>{this.loading.set(false);this.error.set(e?.error?.message??'No fue posible cargar los grupos.')}});this.service.members().subscribe({next:r=>this.members.set(r.data??[])});}
  teachers(){return this.members().filter(x=>x.memberType==='Teacher'&&x.isActive);}
  memberCount(id:string){return this.members().filter(x=>x.groupId===id && x.isActive).length;}
  startCreate(){this.editing.set(null);this.form.reset({name:'',description:'',teacherMemberId:'',isActive:true});}
  edit(x:InstitutionGroup){this.editing.set(x);this.form.reset({name:x.name,description:x.description??'',teacherMemberId:x.teacherMemberId??'',isActive:x.isActive});window.scrollTo({top:0,behavior:'smooth'});}
  save(){if(this.form.invalid||this.saving()){this.form.markAllAsTouched();return;}const v=this.form.getRawValue();const req={name:v.name.trim(),description:v.description.trim()||null,teacherMemberId:v.teacherMemberId||null,isActive:v.isActive};this.saving.set(true);this.error.set('');this.message.set('');const op=this.editing()?this.service.updateGroup(this.editing()!.id,req):this.service.createGroup(req);op.subscribe({next:r=>{this.saving.set(false);this.message.set(r.message??'Grupo guardado.');this.startCreate();this.load()},error:e=>{this.saving.set(false);this.error.set(e?.error?.message??'No fue posible guardar el grupo.')}});}
  toggle(x:InstitutionGroup){this.service.setGroupStatus(x.id,!x.isActive).subscribe({next:()=>this.load(),error:e=>this.error.set(e?.error?.message??'No fue posible cambiar el estado.')});}
}
