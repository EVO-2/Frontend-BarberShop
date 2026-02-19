import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { LayoutComponent } from './layout/layout.component';
import { SidebarComponent } from 'src/app/layout/components/sidebar/sidebar.component';
import { FooterComponent } from 'src/app/layout/components/footer/footer.component';
import { PerfilComponent } from 'src/app/pages/perfil/perfil.component';

import { RouterModule } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';

import { MaterialModule } from 'src/app/shared/material.module';

@NgModule({
  declarations: [
    LayoutComponent,
    SidebarComponent,
    FooterComponent,
    PerfilComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    IonicModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    MaterialModule,
    MatSidenavModule,
    MatMenuModule
  ],
  exports: [
    LayoutComponent
  ]
})
export class LayoutModule { }
