import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Notification } from '../../../../core/models/notification.model';
import { User } from '../../../../core/models/user.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { UserService } from '../../../../core/services/user.service';
import { Router } from '@angular/router';

@Component({ selector:'app-notifications', standalone:true, imports:[DatePipe,ReactiveFormsModule], templateUrl:'./notifications.html', styleUrl:'./notifications.css' })
export class Notifications implements OnInit {
  private readonly service=inject(NotificationService); private readonly usersService=inject(UserService); private readonly fb=inject(FormBuilder); private readonly router=inject(Router);
  readonly items=signal<Notification[]>([]); readonly users=signal<User[]>([]); readonly loading=signal(true); readonly saving=signal(false);
  readonly errorMessage=signal(''); readonly successMessage=signal(''); readonly formOpen=signal(false); readonly search=signal('');
  readonly visible=computed(()=>{const q=this.search().trim().toLowerCase(); return this.items().filter(x=>!q||`${x.title} ${x.message} ${x.userName} ${x.module}`.toLowerCase().includes(q));});
  readonly form=this.fb.nonNullable.group({targetType:['Role',Validators.required],userId:[''],targetRole:['Employee'],title:['',Validators.required],message:['',Validators.required],type:['Information'],priority:['Normal'],module:['General'],route:['']});
  ngOnInit():void{this.load();}
  load():void{this.loading.set(true); this.service.getAll().subscribe({next:r=>{this.items.set(r.data??[]);this.loading.set(false);},error:e=>{this.loading.set(false);this.errorMessage.set(e?.error?.message??'No fue posible cargar notificaciones.');}}); this.usersService.getAll().subscribe({next:r=>this.users.set(r.data??[])});}
  updateSearch(e:Event):void{this.search.set((e.target as HTMLInputElement).value);}
  openCreate():void{this.form.reset({targetType:'Role',userId:'',targetRole:'Employee',title:'',message:'',type:'Information',priority:'Normal',module:'General',route:''});this.formOpen.set(true);}
  close():void{if(!this.saving())this.formOpen.set(false);}
  submit():void{if(this.form.invalid){this.form.markAllAsTouched();return;} const v=this.form.getRawValue(); this.saving.set(true); this.service.create({userId:v.targetType==='User'?v.userId:null,targetRole:v.targetType==='Role'?v.targetRole:null,title:v.title.trim(),message:v.message.trim(),type:v.type,priority:v.priority,module:v.module,route:v.route.trim()||null}).subscribe({next:r=>{this.saving.set(false);this.formOpen.set(false);this.successMessage.set(r.message);this.load();},error:e=>{this.saving.set(false);this.errorMessage.set(e?.error?.message??'No fue posible enviar.');}});}
  remove(item:Notification):void{if(!confirm(`¿Eliminar la notificación «${item.title}»?`))return;this.service.delete(item.id).subscribe({next:r=>{this.successMessage.set(r.message);this.load();},error:e=>this.errorMessage.set(e?.error?.message??'No fue posible eliminar.')});}
  open(item:Notification):void{if(!item.route)return; const go=()=>this.router.navigateByUrl(item.route!); if(item.isRead){go();return;} this.service.markAsRead(item.id).subscribe({next:()=>go(),error:()=>go()});}
}
