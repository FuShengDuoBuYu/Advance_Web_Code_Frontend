import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {HttpClient,HttpHeaders} from "@angular/common/http";
import { environment } from '../../app.module';
import jwtDecode from 'jwt-decode';


@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent {

  registrationForm!: FormGroup;
  loginForm!: FormGroup;
  //页面加载完成
  ngAfterViewInit() {
    document.title = "首页";
  }

  constructor(private formBuilder: FormBuilder, public dialog: MatDialog,public http:HttpClient) {
    this.registrationForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', [Validators.required]],
      avatarBase64: [''],
    });

    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

  }


  onRegisterSubmit() {
    if (this.registrationForm.valid) {
      const httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
      };

      const api = environment.apiPrefix + "/user/register";
      this.http.post(api,this.registrationForm.value,httpOptions).subscribe((res:any) => {
        console.log(res)
        if(res.success){
          alert(res.message+'请重新登录');
        }
      });

      // console.log(this.registrationForm.value);
      // console.log(this.registrationForm.value);

    }
  }

  onLoginSubmit() {
    if (this.loginForm.valid) {
      const httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
      };

      const api = environment.apiPrefix + "/user/login";
      this.http.post(api,this.loginForm.value,httpOptions).subscribe((res:any) => {
          if(res.success){
            // const storage = window.localStorage;
            localStorage.setItem("token",res.data.token);
            //解码token，以jwt格式
            let token = jwtDecode(res.data.token) as { role: string, username: string };;
            console.log(token);
            console.log(res.message);
            localStorage.setItem("role",token.role);
            localStorage.setItem("username",token.username);
            // 重定向到home
            window.location.href = '/selectPlayer';
          } else {
            // 弹出alert
            alert(res.message);
          }
      });
      // console.log(this.loginForm.value);
    }
  }
}

