import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from './layout/layout.component';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/shared/material.module';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';

import { PerfilComponent } from 'src/app/pages/perfil/perfil.component';




import { SidebarComponent } from 'src/app/layout/components/sidebar/sidebar.component';
import { FooterComponent } from 'src/app/layout/components/footer/footer.component'; 

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
export class LayoutModule {}
