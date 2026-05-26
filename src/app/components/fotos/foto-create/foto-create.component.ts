import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IHttpFotosService } from 'src/app/services/interfaces/httpFotos.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { NotificationService } from 'src/app/services/shared/notification.service';

@Component({
  standalone: false,
  selector: 'app-foto-create',
  templateUrl: './foto-create.component.html',
  styleUrls: ['./foto-create.component.scss'],
})
export class FotoCreateComponent implements OnInit {
  public formGroup: FormGroup;
  public loading: boolean = false;
  public uploading: boolean = false;
  public editId: number = 0;
  public isEdit: boolean = false;

  // Image source toggle
  public imageSource: 'url' | 'upload' = 'url';
  public previewUrl: string = '';
  public uploadedFile: File | null = null;

  constructor(
    private displayService: DisplayComponentService,
    private fotosService: IHttpFotosService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private notificationService: NotificationService
  ) {
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
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.editId = +params['id'];
        this.isEdit = true;
        this.loadFotoForEdit();
      }
    });
  }

  loadFotoForEdit(): void {
    this.fotosService.getFotoById(this.editId).subscribe((res: any) => {
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

  onUrlChange(event: any): void {
    this.previewUrl = event.target.value;
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;

    this.uploadedFile = file;

    // Local preview
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previewUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  uploadAndSetUrl(): void {
    if (!this.uploadedFile) return;

    this.uploading = true;
    this.fotosService.uploadImage(this.uploadedFile).subscribe({
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
      this.fotosService.uploadImage(this.uploadedFile).subscribe({
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
      this.fotosService.updateFoto(model).subscribe({
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
      this.fotosService.saveFoto(model).subscribe({
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
