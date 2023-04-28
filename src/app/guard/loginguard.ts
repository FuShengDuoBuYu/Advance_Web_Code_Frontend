import { Injectable } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';


export const loginguard : CanActivateFn=(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) =>{
  /*console.log('CanActivate守卫：进入当前路由', next, state);*/
      if (sessionStorage.getItem('token')) {
        return true;
      } else {
        alert("请先登录！");
        window.location.href ='./index';
        return false;
      }
  }

