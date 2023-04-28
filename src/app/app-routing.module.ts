import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexComponent } from './components/index/index.component';
import { NotfoundComponent } from './components/notfound/notfound.component';
import { PersonalCenterComponent } from './components/personal-center/personal-center.component';
import { HomeComponent } from './components/home/home.component';

import { SelectPlayerComponent } from './components/select-player/select-player.component';
import {ClassroomComponent} from "./components/classroom/classroom.component";

<<<<<<< HEAD
import { MatTabsModule } from '@angular/material/tabs';
import {loginguard} from "./guard/loginguard";

=======
>>>>>>> 5ae4305a3047dc16b71173a4eb96723d422aadb1

const routes: Routes = [
  {
    path: '',
    //重定向到index
    component: IndexComponent
  }
  ,
  {
    path: 'index',
    component: IndexComponent
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [loginguard],
  },
  {
    path: 'personalCenter',
    component: PersonalCenterComponent,
    canActivate: [loginguard],
  },
  {
    path: 'selectPlayer',
    component: SelectPlayerComponent,
    canActivate: [loginguard],
  },
  {
    path: 'classroom',
    component: ClassroomComponent,
    canActivate: [loginguard],
  },
  {
    path:'**',
    component: NotfoundComponent

  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
