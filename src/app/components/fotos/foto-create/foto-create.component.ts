import { CargandoComponent } from '../../shared/cargando/cargando.component';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IHttpFotosService } from 'src/app/services/interfaces/httpFotos.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { NotificationService } from 'src/app/services/shared/notification.service';

@Component({
    selector: 'app-foto-create',
    templateUrl: './foto-create.component.html',
    styleUrls: ['./foto-create.component.scss'],
    imports: [CargandoComponent, 
        FormsModule,
        ReactiveFormsModule,
        RouterLink,
    ],
})
export class FotoCreateComponent implements OnInit {
  private displayService = inject(DisplayComponentService);
  private fotosService = inject(IHttpFotosService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  private readonly destroyRef = inject(DestroyRef);

  public formGroup: FormGroup;
  public loading: boolean = false;
  public uploading: boolean = false;
  public editId: number = 0;
  public isEdit: boolean = false;

  // Image source toggle
  public imageSource: 'url' | 'upload' = 'url';
  public previewUrl: string = '';
  public uploadedFile: File | null = null;

  constructor() {
    this.formGroup = this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(150)]],
      descripcion: ['', Validators.maxLength(1000)],
      imageUrl: ['', Validators.required],
    });

    this.displayService.setDisplay({
      mainMenu: true,
      footer: true,
      searchFooter: true,
      submenu: true,
      background: '',
    });
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      if (params['id']) {
        this.editId = +params['id'];
        this.isEdit = true;
        this.loadFotoForEdit();
      }
    });
  }

  loadFotoForEdit(): void {
    this.fotosService.getFotoById(this.editId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
      if (res) {
        this.formGroup.patchValue({
          titulo: res.titulo,
          descripcion: res.descripcion,
          imageUrl: res.imageUrl,
        });
        this.previewUrl = res.imageUrl;
        this.imageSource = 'url';
      }
    });
  }

  onUrlChange(event: Event): void {
    this.previewUrl = (event.target as HTMLInputElement).value;
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.uploadedFile = file;

    // Local preview
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  uploadAndSetUrl(): void {
    if (!this.uploadedFile) return;

    this.uploading = true;
    this.fotosService.uploadImage(this.uploadedFile).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (url: string) => {
        if (url) {
          this.formGroup.patchValue({ imageUrl: url });
          this.previewUrl = url;
        }
        this.uploading = false;
      },
      error: () => {
        this.uploading = false;
      },
    });
  }

  submit(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    // If file selected but not yet uploaded to server, upload first then save
    if (
      this.imageSource === 'upload' &&
      this.uploadedFile &&
      !this.formGroup.value.imageUrl?.startsWith('/images/')
    ) {
      this.uploading = true;
      this.fotosService.uploadImage(this.uploadedFile).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (url: string) => {
          this.uploading = false;
          if (url) {
            this.formGroup.patchValue({ imageUrl: url });
            this.saveModel();
          }
        },
        error: () => {
          this.uploading = false;
        },
      });
      return;
    }

    this.saveModel();
  }

  private saveModel(): void {
    this.loading = true;
    const model = { ...this.formGroup.value };

    if (this.isEdit) {
      model.id = this.editId;
      this.fotosService.updateFoto(model).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.loading = false;
          this.notificationService.success('Foto actualizada correctamente', 'Actualizado');
          this.router.navigate(['/fotos']);
        },
        error: () => {
          this.loading = false;
        },
      });
    } else {
      this.fotosService.saveFoto(model).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.loading = false;
          this.notificationService.success('Foto publicada correctamente', 'Publicada');
          this.router.navigate(['/fotos']);
        },
        error: () => {
          this.loading = false;
        },
      });
    }
  }
}
