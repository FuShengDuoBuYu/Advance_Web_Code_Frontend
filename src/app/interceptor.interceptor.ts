import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import {Observable, tap} from 'rxjs';

@Injectable()
export class InterceptorInterceptor /*implements HttpInterceptor*/ {

  constructor(private router: Router) {

  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<any>> {
      let req: any;
      console.log(request.url);
      if (request.url !== 'http://localhost:4200/index') {
        if (sessionStorage.getItem('token')) {
          req = request.headers.set('token', sessionStorage.getItem('token')!);
          return next.handle(req);
        }
      }

    return next.handle(request).pipe(
      tap(
        (event:any) => {
          if (event instanceof HttpResponse) {
            console.log(event);
            if (event.status >= 500) {
              // 处理错误
            }
          }
        },
        error=> {
          window.location.href = './components/index/index.component.html';

        })
    );


  }
}
