
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Comment } from '../../../core/models/comment.model';
import { Sale } from '../../../core/models/sale.model';
import { CommentService } from '../../../core/services/comment.service';
import { SaleService } from '../../../core/services/sale.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({selector:'app-client-comments',standalone:true,imports:[CommonModule,ReactiveFormsModule],templateUrl:'./client-comments.html',styleUrl:'./client-comments.css'})
export class ClientComments implements OnInit {
 private fb=inject(FormBuilder); private commentsApi=inject(CommentService); private salesApi=inject(SaleService); private auth=inject(AuthService);
 readonly comments=signal<Comment[]>([]); readonly sales=signal<Sale[]>([]); readonly loading=signal(true); readonly saving=signal(false); readonly message=signal(''); readonly error=signal('');
 readonly form=this.fb.nonNullable.group({saleId:['',Validators.required],productId:['',Validators.required],rating:[5,[Validators.required,Validators.min(1),Validators.max(5)]],message:['',[Validators.required,Validators.minLength(10),Validators.maxLength(1500)]]});
 ngOnInit(){this.load();}
 load(){this.loading.set(true); this.commentsApi.getMine().subscribe({next:r=>{this.comments.set(r.data??[]);this.loading.set(false)},error:e=>{this.error.set(e?.error?.message??'No fue posible cargar tus comentarios.');this.loading.set(false)}}); this.salesApi.getMine().subscribe({next:r=>this.sales.set(r.data??[])});}
 selectedSale(){return this.sales().find(x=>x.id===this.form.controls.saleId.value)??null;}
 onSaleChange(){this.form.controls.productId.setValue('');}
 submit(){if(this.form.invalid||this.saving())return; const u=this.auth.currentUser(); const v=this.form.getRawValue(); this.saving.set(true);this.error.set('');this.message.set('');this.commentsApi.create({fullName:u?.fullName??'Cliente VOLTS',email:u?.email??'',message:v.message.trim(),rating:Number(v.rating),saleId:v.saleId||null,productId:v.productId||null}).subscribe({next:r=>{this.saving.set(false);this.message.set(r.message);this.form.reset({saleId:'',productId:'',rating:5,message:''});this.load()},error:e=>{this.saving.set(false);this.error.set(e?.error?.message??'No fue posible enviar el comentario.')}});}
 remove(id:string){if(!confirm('¿Eliminar este comentario?'))return;this.commentsApi.delete(id).subscribe({next:()=>this.load(),error:e=>this.error.set(e?.error?.message??'No fue posible eliminarlo.')});}
  modeLabel(v?:string|null){return v==='DiyKit'?'Kit DIY':v==='WorkshopAssist'?'Armado contigo en UTL':'Armado y listo';}
}
