import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {
  perfilForm!: FormGroup;
  fotoPreview: string = '';
  fotoFile!: File;

  hideCurrent = true;
  hideNew = true;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const usuario = this.authService.obtenerUsuarioInfo();
    if (!usuario) return;

    this.fotoPreview = usuario.foto ? `http://localhost:3000/${usuario.foto}` : '';

    this.perfilForm = this.fb.group({
      nombre: [usuario.nombre, Validators.required],
      nuevaPassword: [''],
      confirmarPassword: [''],
      foto: [null]
    }, { validators: this.passwordsIgualesValidator });
  }

  /** Valida que las contraseñas nuevas coincidan */
  passwordsIgualesValidator(form: FormGroup) {
    const pass1 = form.get('nuevaPassword')?.value;
    const pass2 = form.get('confirmarPassword')?.value;
    return pass1 === pass2 ? null : { noCoincide: true };
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.fotoFile = file;
      const reader = new FileReader();
      reader.onload = () => this.fotoPreview = reader.result as string;
      reader.readAsDataURL(file);
    }
  }

  guardarCambios(): void {
  if (this.perfilForm.invalid) return;

  const nombre = this.perfilForm.get('nombre')?.value;
  const nuevaPassword = this.perfilForm.get('nuevaPassword')?.value;

  const formData = new FormData();
  formData.append('nombre', nombre);
  if (nuevaPassword) {
    formData.append('password', nuevaPassword);
  }
  if (this.fotoFile) {
    formData.append('foto', this.fotoFile);
  }

  const id = this.authService.obtenerUID();

  this.http.post(`http://localhost:3000/api/usuarios/${id}/foto`, formData).subscribe({
    next: (res: any) => {
      alert('✅ Perfil actualizado correctamente');

      // ✅ Actualiza localStorage y notifica al layout
      if (res.foto) {
        const urlCompleta = `http://localhost:3000/${res.foto}`;
        localStorage.setItem('fotoUsuario', urlCompleta);
        this.authService.actualizarFotoPerfil(urlCompleta); // <- lo explicamos abajo
      }

      if (nombre) {
        localStorage.setItem('nombreUsuario', nombre);
      }

      this.router.navigate(['/']); // o volver a la ruta anterior si lo prefieres
    },
    error: (err) => {
      console.error('❌ Error al actualizar el perfil:', err);
      alert('Error al actualizar el perfil');
    }
  });
}


  cancelar(): void {
    this.router.navigate(['/']);
  }
}
