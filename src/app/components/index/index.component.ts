import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {HttpClient,HttpHeaders} from "@angular/common/http";



@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent {

  registrationForm!: FormGroup;
  loginForm!: FormGroup;


  constructor(private formBuilder: FormBuilder, public dialog: MatDialog,public http:HttpClient) {
    this.registrationForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

  }


  onRegisterSubmit() {
    if (this.registrationForm.valid) {
      //todo: register to server
      const httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
      };

      const api = "/user/register";
      this.http.post(api,this.registrationForm,httpOptions).subscribe((res:any) => {
        if(res.success){
          console.log(res.message);
        }
      });

      console.log(this.registrationForm.value);

    }
  }

  onLoginSubmit() {
    if (this.loginForm.valid) {
      //todo: login to server
      const httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
      };

      const api = "/user/login";
      this.http.post(api,this.loginForm,httpOptions).subscribe((res:any) => {
          if(res.success){
            const storage = window.sessionStorage;
            sessionStorage.setItem("token",res.data.token);
            console.log(res.message);
          }
      });
      console.log(this.loginForm.value);
      // 重定向到home
      window.location.href = '/selectPlayer';
    }
  }
}

