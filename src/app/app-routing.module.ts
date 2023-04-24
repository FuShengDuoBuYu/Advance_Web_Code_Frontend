import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexComponent } from './components/index/index.component';
import { NotfoundComponent } from './components/notfound/notfound.component';
import { PersonalCenterComponent } from './components/personal-center/personal-center.component';
import { HomeComponent } from './components/home/home.component';
import { SelectPlayerComponent } from './components/select-player/select-player.component';

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
    component: HomeComponent
  },
  {
    path: 'personalCenter',
    component: PersonalCenterComponent
  },
  {
    path: 'selectPlayer',
    component: SelectPlayerComponent
  },
  {
    path:'**',
    component: NotfoundComponent
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
