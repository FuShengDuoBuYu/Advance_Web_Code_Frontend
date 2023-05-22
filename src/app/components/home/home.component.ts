//@ts-nocheck
import { Component } from '@angular/core';
import io from 'socket.io-client';
import { environment } from '../../app.module';
import { SpeechBubble } from './speech_bublle';
import { Platform } from './platform';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  userName: string | null = localStorage.getItem('role') + '-' + localStorage.getItem('username');
  role: string | null = localStorage.getItem('role');
  roomId: string = 'home';
  message = '';
  socket: any;
  isShowChat = true;
  courseList = [
    {'title': '软件工程', 'description':'答辩'},
    {'title': '计算机网络', 'description':'答辩'},
    {'title': '计算机组成原理', 'description':'答辩'},
    {'title': '操作系统', 'description':'答辩'},
    {'title': '数据库', 'description':'答辩'},
    {'title': '数据结构', 'description':'答辩'},
    {'title': '编译原理', 'description':'答辩'},
    {'title': '计算机图形学', 'description':'答辩'},
  ];
  createCourseForm!: FormGroup;
  constructor(private formBuilder: FormBuilder) {
    this.createCourseForm = this.formBuilder.group({
      courseName: ['', [Validators.required]],
      courseDescription: ['', [Validators.required]],
    });
  }
  //当页面view加载完成后，执行ngAfterViewInit方法
  ngAfterViewInit() {
    //修改页面的title
    document.title = '主页';
    this.ifShowChat();
    const url = environment.socketPrefix;
    let opts = {
      query: 'roomId=' + this.roomId + '&userName=' + localStorage.getItem('role') + '-' + localStorage.getItem('username'),
      transports:['websocket']
    };
    this.socket = io(url,opts);
    this.timers = {};
    this.timers['timer'] = setTimeout(
      () => {
      },5000
    )
    this.socket.connect();
    this.socket.on('connect', () => {
      this.output(
        '<span class="connect-msg">The client has connected with the server. Username: ' +
        this.userName + ' Room: ' + this.roomId +
          '</span>'
      );
    });
    this.socket.on('chat', (data: { userName: string; message: string }) => {
      for(let name in platform.remotePlayers){
        if(name == data.userName){
          let speech = platform.speechBubbles[name];
          if(speech !== undefined){
            speech.update(data.message);
          }else {
            platform.speechBubbles[name] = new SpeechBubble(platform,data.message,150);
            platform.speechBubbles[name].player = platform.remotePlayers[name];
            this.timers[name] = setTimeout(function(){
              platform.speechBubbles[name].mesh.parent.remove(platform.speechBubbles[name].mesh);
              delete platform.speechBubbles[name];
            }, 5000);
            platform.speechBubbles[name].update(data.message)
          }
        }
      }
      let name = data.userName;
      if (data.userName == localStorage.getItem('role') + '-' + localStorage.getItem('username')){
        let speech = platform.speechBubbles[name];
        if(speech !== undefined){
          speech.update(data.message);
        }else {
          platform.speechBubbles[name] = new SpeechBubble(platform,data.message,150);
          platform.speechBubbles[name].player = platform.player;
          this.timers[name] = setTimeout(function(){
            platform.speechBubbles[name].mesh.parent.remove(platform.speechBubbles[name].mesh);
            delete platform.speechBubbles[name];
          }, 5000);
          platform.speechBubbles[name].update(data.message)
        }
      }

      this.output(
        '<span class="username-msg">' +
          data.userName +
          ': ' +
          data.message +
        '</span>'
      );
    });
    this.socket.on('disconnect', () => {
      this.output('<span class="disconnect-msg">The client has disconnected!</span>');
    });
    this.socket.on('reconnect_attempt', (attempts: string) => {
      console.log('Try to reconnect at ' + attempts + ' attempt(s).');
    });

    const platformDiv = document.getElementById('platform');
    const classroomDiv = document.getElementById('classroom-dialog');
    const platform = new Platform(platformDiv, this.socket, classroomDiv);
    window.platform = platform;
    this.playerMove(platform);
    this.playerView(platform);

  }

  onSubmit() {
    // 获取到表单里的数据
    console.log(this.userName);
    console.log(this.message);
    this.sendMessage();
  }

  sendMessage() {
    const jsonObject = {
      userName: this.userName,
      message: this.message,
      roomId: this.roomId
    };
    this.socket.emit('chat', jsonObject);
    this.message = '';
  }

  output(message: string) {
    // 获取当前时间
    const currentTime = `[${new Date().toLocaleTimeString()}]`;
    const element = `<div>${currentTime} ${message}</div>`;
    document.getElementById('console')!.insertAdjacentHTML('beforebegin', element);
  }

  // 点击按钮后跳转到个人中心
  navigateToPersonalCenter() {
    window.location.href = '/personalCenter';
  }

  playerMove(platform) {
    let isMove = false;
    document.addEventListener('keydown', (event) => {
      if(isMove) return;
      switch (event.keyCode) {
        case 87: // w
          platform.playerControl('w');
          break;
        //按住c后进入classroom界面
        case 67: // c
          window.location.href = '/classroom';
      }
    }, false);
    //松手后停止
    document.addEventListener('keyup', (event) => {
      isMove = false;
      platform.playerControl('stop');
    }, false);
  }

  //监听用户的鼠标视角
  playerView(platform) {
    //监听一次鼠标移动的距离
    let lastX = 0;
    let lastY = 0;
    let isMouseMove = false;
    document.addEventListener('mousemove', (event) => {
      if(isMouseMove) return;
      isMouseMove = true;
      const x = event.clientX;
      const y = event.clientY;
      const dx = x - lastX;
      const dy = y - lastY;
      lastX = x;
      lastY = y;
      platform.playerViewControl(dx, dy);
      setTimeout(() => {
        isMouseMove = false;
      }, 100);
    }, false);
    //每100ms监听一次鼠标的位置
    setInterval(() => {
      //获取当前鼠标的位置
      if(isMouseMove) return;
      if(lastX<10){
        platform.playerViewControl(-100, 0);
      }
      if(innerWidth-lastX<10){
        platform.playerViewControl(100, 0);
      }
    }, 100);
  }

  //是否显示聊天框
  ifShowChat() {
    this.isShowChat = !this.isShowChat;
    let chat_element = document.getElementById('chat');
    chat_element.style.display = this.isShowChat ? 'block' : 'none';
  }

  //进入课程
  enterClass(index){
    //todo:进入课程
    console.log(this.courseList[index]);
  }

  //创建课程
  onCreateCourseSubmit(){
    console.log(this.courseName);
  }
}