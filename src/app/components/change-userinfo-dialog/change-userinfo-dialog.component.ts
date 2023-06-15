import {Component, Inject} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../app.module";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import * as imageConversion from "image-conversion";

@Component({
  selector: 'app-change-userinfo-dialog',
  templateUrl: './change-userinfo-dialog.component.html',
  styleUrls: ['./change-userinfo-dialog.component.css']
})
export class ChangeUserinfoDialogComponent {

  form !: FormGroup;

  constructor(private formBuilder: FormBuilder, public http:HttpClient, @Inject(MAT_DIALOG_DATA) public data: {
    username: string,
    avatar: string,
  }) {
    console.log(data)
    this.form = this.formBuilder.group({
      username: ['', [Validators.required]],
    });
    this.form.controls['username'].setValue(data.username);
  }

  onSubmit(){
    if(this.form.valid){
      const httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json', 'token': localStorage.getItem("token")! }),
      };
      const api = environment.apiPrefix + "/user/changeUserInfo";
      // 发送请求
      this.http.post(api,{
        username: this.form.value.username,
        avatarBase64: this.data.avatar,
      },httpOptions).subscribe((res:any) => {
        if(res.success){
          alert(res.message);
          // reload the page
          location.reload();
        } else {
          alert(res.message);
        }
      });
    }
  }
  //点击选择图片,展示本机图片文件夹
  onChooseImage() {
    document.getElementById('input_image')!.click();
  }

  //获取用户输入的图片文件
  view(){
    const _this = this;
    // @ts-ignore
    const file = document.getElementById('input_image').files[0];
    console.log(file);
    imageConversion.compressAccurately(file,200).then(res=>{
      //The res in the promise is a compressed Blob type (which can be treated as a File type) file;
      //make the compressed file into base64 format
      imageConversion.filetoDataURL(res).then(res2=>{
        _this.data.avatar = res2;
      })
    })
  }
}
