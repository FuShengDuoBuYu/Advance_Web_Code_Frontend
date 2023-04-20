import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexComponent } from './components/index/index.component';
import { NotfoundComponent } from './components/notfound/notfound.component';
import { PersonalCenterComponent } from './components/personal-center/personal-center.component';
import { HomeComponent } from './components/home/home.component';

const routes: Routes = [
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
    path:'**',
    component: NotfoundComponent
  },
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
