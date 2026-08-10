import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InstitutionGroup, InstitutionMember } from '../../../core/models/institution-portal.model';
import { InstitutionPortalService } from '../../../core/services/institution-portal.service';

@Component({ selector: 'app-members', standalone: true, imports: [ReactiveFormsModule], templateUrl: './members.html', styleUrl: './members.css' })
export class InstitutionMembers implements OnInit {
  private readonly service = inject(InstitutionPortalService);
  private readonly fb = inject(FormBuilder);
  readonly items = signal<InstitutionMember[]>([]);
  readonly groups = signal<InstitutionGroup[]>([]);
  readonly editing = signal<InstitutionMember | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly message = signal('');
  readonly error = signal('');
  readonly form = this.fb.nonNullable.group({
    memberType: ['Student' as 'Student' | 'Teacher', Validators.required],
    fullName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(160)]],
    email: ['', [Validators.required, Validators.email]],
    enrollmentOrEmployeeNumber: [''],
    groupId: [''],
    isActive: [true]
  });

  readonly students = computed(() => this.items().filter(x => x.memberType === 'Student' && x.isActive).length);
  readonly teachers = computed(() => this.items().filter(x => x.memberType === 'Teacher' && x.isActive).length);

  ngOnInit(): void { this.load(); }
  load(): void {
    this.loading.set(true);
    this.service.members().subscribe({ next: r => { this.items.set(r.data ?? []); this.loading.set(false); }, error: e => { this.loading.set(false); this.error.set(e?.error?.message ?? 'No fue posible cargar las personas.'); } });
    this.service.groups().subscribe({ next: r => this.groups.set((r.data ?? []).filter(x => x.isActive)) });
  }
  startCreate(): void { this.editing.set(null); this.form.reset({ memberType: 'Student', fullName: '', email: '', enrollmentOrEmployeeNumber: '', groupId: '', isActive: true }); }
  edit(item: InstitutionMember): void {
    this.editing.set(item);
    this.form.reset({ memberType: item.memberType, fullName: item.fullName, email: item.email, enrollmentOrEmployeeNumber: item.enrollmentOrEmployeeNumber ?? '', groupId: item.groupId ?? '', isActive: item.isActive });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  cancel(): void { this.startCreate(); }
  save(): void {
    if (this.form.invalid || this.saving()) { this.form.markAllAsTouched(); return; }
    const v = this.form.getRawValue();
    const request = { memberType: v.memberType, fullName: v.fullName.trim(), email: v.email.trim(), enrollmentOrEmployeeNumber: v.enrollmentOrEmployeeNumber.trim() || null, groupId: v.groupId || null, isActive: v.isActive };
    this.saving.set(true); this.error.set(''); this.message.set('');
    const op = this.editing() ? this.service.updateMember(this.editing()!.id, request) : this.service.createMember(request);
    op.subscribe({ next: r => { this.saving.set(false); this.message.set(r.message ?? 'Datos guardados correctamente.'); this.startCreate(); this.load(); }, error: e => { this.saving.set(false); this.error.set(e?.error?.message ?? 'No fue posible guardar la persona.'); } });
  }
  toggle(item: InstitutionMember): void {
    this.service.setMemberStatus(item.id, !item.isActive).subscribe({ next: () => this.load(), error: e => this.error.set(e?.error?.message ?? 'No fue posible cambiar el estado.') });
  }
  typeLabel(value: string): string { return value === 'Teacher' ? 'Docente / responsable' : 'Alumno'; }
}
