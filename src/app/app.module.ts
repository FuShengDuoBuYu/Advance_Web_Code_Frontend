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
import {MatListModule} from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';

import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import {MatRadioModule} from '@angular/material/radio';
// sidenav
import {MatSidenavModule} from '@angular/material/sidenav';
// button-toggle
import {MatButtonToggleModule} from '@angular/material/button-toggle';

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
import {HttpClientModule,HttpClientJsonpModule} from '@angular/common/http';

import { NgxEchartsModule } from 'ngx-echarts';
import { MatSelectModule } from '@angular/material/select';





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
    MatRadioModule,
    MatListModule,
    MatMenuModule,
    MatButtonToggleModule,
    MatSelectModule,


    HttpClientModule,
    HttpClientJsonpModule,
    MatSidenavModule,
    NgxEchartsModule,

  ],
  providers: [

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
export const environment = {
  production: false,
  // apiPrefix: 'http://106.14.140.55:10086',
  // socketPrefix: 'http://106.14.140.55:10088'
  apiPrefix: 'http://localhost:10086',
  socketPrefix: 'http://localhost:10088'
};
