import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

// Material
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';

// sidenav
import {MatSidenavModule} from '@angular/material/sidenav';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IndexComponent } from './components/index/index.component';
import { NotfoundComponent } from './components/notfound/notfound.component';
import { PersonalCenterComponent } from './components/personal-center/personal-center.component';
import { HomeComponent } from './components/home/home.component';

import { SelectPlayerComponent } from './components/select-player/select-player.component';
import { ClassroomComponent } from './components/classroom/classroom.component';

// http
import {HttpClientModule,HttpClientJsonpModule,HTTP_INTERCEPTORS} from '@angular/common/http';

import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts';

import { InterceptorInterceptor } from './interceptor.interceptor';




@NgModule({
  declarations: [
    AppComponent,
    IndexComponent,
    NotfoundComponent,
    PersonalCenterComponent,
    HomeComponent,
    SelectPlayerComponent,
    ClassroomComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatCardModule,

    HttpClientModule,
    HttpClientJsonpModule,
    MatSidenavModule,
    NgxEchartsModule,

  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: InterceptorInterceptor, multi: true }

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
