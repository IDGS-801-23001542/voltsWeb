import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Notification } from '../../../core/models/notification.model';
import { NotificationService } from '../../../core/services/notification.service';

@Component({selector:'app-portal-notifications',standalone:true,imports:[DatePipe],templateUrl:'./portal-notifications.html',styleUrl:'./portal-notifications.css'})
export class PortalNotifications implements OnInit{private readonly service=inject(NotificationService);private readonly router=inject(Router);readonly items=signal<Notification[]>([]);readonly error=signal('');ngOnInit():void{this.load()}load():void{this.service.getMine().subscribe({next:r=>this.items.set(r.data??[]),error:e=>this.error.set(e?.error?.message??'No fue posible cargar notificaciones.')})}open(item:Notification):void{const go=()=>{if(item.route)this.router.navigateByUrl(item.route)};if(item.isRead){go();return}this.service.markAsRead(item.id).subscribe({next:()=>{item.isRead=true;this.items.update(x=>[...x]);go()},error:()=>go()})}markAll():void{this.service.markAllAsRead().subscribe({next:()=>this.load()})}}
