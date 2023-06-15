import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../app.module";
import jwtDecode from "jwt-decode";

@Component({
  selector: 'app-change-password-dialog',
  templateUrl: './change-password-dialog.component.html',
  styleUrls: ['./change-password-dialog.component.css']
})
export class ChangePasswordDialogComponent {

  form !: FormGroup;

  constructor(private formBuilder: FormBuilder, public http:HttpClient) {
    this.form = this.formBuilder.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(){
    if(this.form.valid){
      const httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json', 'token': localStorage.getItem("token")! }),
      };
      const api = environment.apiPrefix + "/user/changePassword";
      // 判断两次密码是否一致
      if(this.form.value.newPassword != this.form.value.confirmPassword){
        alert("两次密码不一致");
        // 清空密码
        this.form.controls['newPassword'].setValue('');
        this.form.controls['confirmPassword'].setValue('');
        return;
      }
      // 判断新旧密码是否一致
      if(this.form.value.oldPassword == this.form.value.newPassword){
        alert("新旧密码不能一致");
        // 清空密码
        this.form.controls['newPassword'].setValue('');
        this.form.controls['confirmPassword'].setValue('');
        return;
      }
      // 发送请求
      this.http.post(api,{
        oldPassword: this.form.value.oldPassword,
        newPassword: this.form.value.newPassword,
      },httpOptions).subscribe((res:any) => {
        if(res.success){
          alert(res.message+"， 请重新登录");
          // 跳转到登录页面
          window.location.href = "/index";
        } else {
          alert(res.message);
        }
      });
    }
  }

}
