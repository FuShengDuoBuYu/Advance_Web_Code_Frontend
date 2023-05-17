import { CanActivateFn} from '@angular/router';


export const loginguard : CanActivateFn=(
    
  ) =>{
  /*console.log('CanActivate守卫：进入当前路由', next, state);*/
      if (localStorage.getItem('token')) {
        return true;
      } else {
        alert("请先登录！");
        window.location.href ='./index';
        return false;
      }
  }

