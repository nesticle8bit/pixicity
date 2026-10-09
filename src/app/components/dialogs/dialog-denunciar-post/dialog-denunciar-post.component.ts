import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { SelectAutocompleteComponent } from '../../shared/select-autocomplete/select-autocomplete.component';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-dialog-denunciar-post',
    templateUrl: './dialog-denunciar-post.component.html',
    styleUrls: ['./dialog-denunciar-post.component.scss'],
    imports: [MatDialogTitle, FormsModule, ReactiveFormsModule, CdkScrollable, MatDialogContent, SelectAutocompleteComponent, MatDialogActions, MatButton, MatDialogClose]
})
export class DialogDenunciarPostComponent implements OnInit {
  data = inject(MAT_DIALOG_DATA);
  private formBuilder = inject(FormBuilder);
  private postService = inject(IHttpPostsService);
  private dialogRef = inject<MatDialogRef<DialogDenunciarPostComponent>>(MatDialogRef);
  private notificationService = inject(NotificationService);

  private readonly destroyRef = inject(DestroyRef);

  public formGroup: FormGroup;
  public razonDenuncia: any[] = [{
    id: 1,
    label: 'Re-post'
  },{
    id: 2,
    label: 'Se hace Spam'
  },{
    id: 3,
    label: 'Tiene links muertos'
  },{
    id: 4,
    label: 'Es racista o irrespetuoso'
  },{
    id: 5,
    label: 'Contiene información personal'
  },{
    id: 6,
    label: 'El título esta en mayúscula'
  },{
    id: 7,
    label: 'Contiene pedofilia'
  },{
    id: 8,
    label: 'Es gore o asqueroso'
  },{
    id: 9,
    label: 'Está mal la fuente'
  },{
    id: 10,
    label: 'Post demasiado pobre / Crap'
  },{
    id: 11,
    label: 'Taringa! no es un foro'
  },{
    id: 12,
    label: 'No cumple con el protocolo'
  },{
    id: 13,
    label: 'Otra razón (por favor especificar)'
  }];

  constructor() {
    this.formGroup = this.formBuilder.group({
      postId: [this.data?.id, Validators.required],
      razonDenunciaId: [undefined, Validators.required],
      comentarios: ['', Validators.required]
    });
  }

  ngOnInit(): void {
  }

  enviarDenuncia(): void {
    const form = Object.assign({}, this.formGroup.value);

    this.postService.reportPost(form).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      if(response) {
        this.notificationService.success(`El post ${this.data?.titulo} ha sido denunciado correctamente, el equipo de modaración revisará en la brevedad`, 'Denunciado');
        this.dialogRef.close(response);
      }
    });
  }
}
