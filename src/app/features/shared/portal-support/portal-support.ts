import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupportTicket } from '../../../core/models/support-ticket.model';
import { AuthService } from '../../../core/services/auth.service';
import { SupportTicketService } from '../../../core/services/support-ticket.service';

@Component({ selector:'app-portal-support', standalone:true, imports:[ReactiveFormsModule,DatePipe], templateUrl:'./portal-support.html', styleUrl:'./portal-support.css' })
export class PortalSupport implements OnInit {
  private readonly service=inject(SupportTicketService); private readonly auth=inject(AuthService); private readonly fb=inject(FormBuilder);
  readonly items=signal<SupportTicket[]>([]); readonly saving=signal(false); readonly message=signal(''); readonly error=signal('');
  readonly form=this.fb.nonNullable.group({subject:['',[Validators.required,Validators.minLength(5)]],description:['',[Validators.required,Validators.minLength(10)]],priority:['Medium' as 'Low'|'Medium'|'High'|'Urgent',Validators.required]});
  ngOnInit():void{this.load();}
  load():void{this.service.getMine().subscribe({next:r=>this.items.set(r.data??[]),error:e=>this.error.set(e?.error?.message??'No fue posible cargar soporte.')});}
  submit():void{if(this.form.invalid||this.saving()){this.form.markAllAsTouched();return;}const v=this.form.getRawValue();const u=this.auth.currentUser();if(!u)return;this.saving.set(true);this.error.set('');this.message.set('');this.service.create({customerId:u.roleName==='Client'?u.profileId:null,email:u.email,subject:v.subject.trim(),description:v.description.trim(),priority:v.priority}).subscribe({next:r=>{this.saving.set(false);this.message.set(r.message);this.form.reset({subject:'',description:'',priority:'Medium'});this.load();},error:e=>{this.saving.set(false);this.error.set(e?.error?.message??'No fue posible crear el ticket.');}});}
}

