import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent {

  registrationForm!: FormGroup;
  loginForm!: FormGroup;

  constructor(private formBuilder: FormBuilder, public dialog: MatDialog) {
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
      console.log(this.registrationForm.value);
    }
  }

  onLoginSubmit() {
    if (this.loginForm.valid) {
      //todo: login to server
      console.log(this.loginForm.value);
      // 重定向到home
      window.location.href = '/home';
    }
  }
}
