//@ts-nocheck
import { Component } from '@angular/core';
import io from 'socket.io-client';
import { environment } from '../../app.module';
import { SpeechBubble } from '../speech_bublle';
import { Platform } from './platform';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Course, Teacher } from '../course';
import Recorder from 'js-audio-recorder';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Message } from '../message';
import * as imageConversion from 'image-conversion';
import {chatMessage} from "../../type";
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [
    trigger('openClose', [
      // animation triggers go here
      state('open', style({
        width: '30%',
        height: '50%',
      })),
      state('closed', style({
        width: '0%',
        height: '0%',
      })),
      transition('open => closed', [
        animate('0.3s')
      ]),
      transition('closed => open', [
        animate('0.3s')
      ]),
    ])
  ]
})
export class HomeComponent {
  userName: string | null = localStorage.getItem('role') + '-' + localStorage.getItem('username');
  role: string | null = localStorage.getItem('role');
  roomId: number = 1;
  message = '';
  socket: any;
  //聊天相关
  isShowChat = true;
  messages: Message[] = [];
  //开课相关
  createCourseTitle = "";
  createCourseDescription = "";
  lastTeachingBuilding = 0;
  courseList: Course[] = [];
  showCourseList: Course[] = [];
  createCourseForm: FormGroup;
  //录音相关
  recorder: Recorder;
  decoder: Recorder
  robotCommand: string = '/robot';
  assistantRole: string = 'assistant';
  userRole: string = 'user';
  initChatMessage: chatMessage = {
    role: this.assistantRole,
    content: '你好，我是机器人小助手，有什么可以帮助你的吗？',
  }
  //之前的信息
  dataList: chatMessage[] = [this.initChatMessage];

  constructor(private formBuilder: FormBuilder, public http: HttpClient) { }
  //当页面view加载完成后，执行ngAfterViewInit方法
  ngAfterViewInit() {
    //修改页面的title
    document.title = '主页';
    this.ifShowChat();
    const url = environment.socketPrefix;
    let opts = {
      query: 'roomId=' + this.roomId + '&userName=' + localStorage.getItem('role') + '-' + localStorage.getItem('username'),
      transports: ['websocket']
    };
    this.socket = io(url, opts);
    this.timers = {};
    this.timers['timer'] = setTimeout(
      () => {
      }, 5000
    )
    this.socket.connect();
    this.socket.on('connect', () => {
      this.output(
        "您已连接到服务器!",localStorage.getItem('username'),"connect-msg"
      );
    });

    //接收到聊天消息
    this.socket.on('chat', (data: { userName: string; message: string,type:string }) => {
      //为romatePlayer添加speechBubble
      for (let name in platform.remotePlayers) {
        if (name == data.userName) {
          let speech = platform.speechBubbles[name];
          if (speech !== undefined) {
            speech.update(data.message,data.type);
          } else {
            platform.speechBubbles[name] = new SpeechBubble(platform, data.message, 150,data.type);
            platform.speechBubbles[name].player = platform.remotePlayers[name];
            this.timers[name] = setTimeout(function () {
              platform.speechBubbles[name].mesh.parent.remove(platform.speechBubbles[name].mesh);
              delete platform.speechBubbles[name];
            }, 5000);
            platform.speechBubbles[name].update(data.message,data.type)
          }
        }
      }
      //为本地player添加speechBubble
      let name = data.userName;
      if (data.userName == localStorage.getItem('role') + '-' + localStorage.getItem('username')) {
        let speech = platform.speechBubbles[name];
        if (speech !== undefined) {
          speech.update(data.message,data.type);
        } else {
          platform.speechBubbles[name] = new SpeechBubble(platform, data.message, 150,data.type);
          platform.speechBubbles[name].player = platform.player;
          this.timers[name] = setTimeout(function () {
            platform.speechBubbles[name].mesh.parent.remove(platform.speechBubbles[name].mesh);
            delete platform.speechBubbles[name];
          }, 5000);
          platform.speechBubbles[name].update(data.message,data.type)
        }
      }
      this.output(
        data.message, data.userName, "",data.type
      );
    });

    this.socket.on('chatGPT',(data:{message:string})=>{
      console.log(data.message)
    })

    this.socket.on('speech', (data: { userName: string; message: string }) => {
      var snd = new Audio(data.message);
      snd.play();
    });

    this.socket.on('disconnect', () => {
      this.output("您已断开连接!",localStorage.getItem('username'),"disconnect-msg");
    });
    this.socket.on('reconnect_attempt', (attempts: string) => {
      console.log('Try to reconnect at ' + attempts + ' attempt(s).');
    });

    const platformDiv = document.getElementById('platform');
    //设置platformDiv的pointLock
    platformDiv?.addEventListener('click', () => {
      platformDiv.requestPointerLock();
    });
    const classroomDiv = document.getElementById('classroom-dialog');
    this.observeClassroomDiv(classroomDiv!);
    const platform = new Platform(platformDiv, this.socket, classroomDiv);
    window.platform = platform;
    this.playerMove(platform);
    document.addEventListener('mousemove', (event) => {
      this.playerView(platform, event, platformDiv);
    });
  }

  ngOnInit() {
    this.createCourseForm = this.formBuilder.group({
      courseName: ['', Validators.required],
      courseDescription: ['', Validators.required]
    });

    this.recorder = new Recorder({
      sampleBits: 16,         // 采样位数，支持 8 或 16，默认是16
      sampleRate: 16000,      // 采样率，支持 11025、16000、22050、24000、44100、48000，默认是16000
      numChannels: 1,         // 声道，支持 1 或 2，默认是1
      compiling: true,       // 是否边录边转换，默认是false
    });
  }

  startRecording() {
    this.recorder.start();
    const that = this;
    // 设置一个1s的间距
    setInterval(function () {
      that.recorder.stop();
      let blob: Blob = that.recorder.getWAVBlob();
      that.recorder.start();
      // 编码成为字符串
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = (e) => {
        that.socket.emit('speech', {
          roomId: that.roomId,
          userName: localStorage.getItem('role') + '-' + localStorage.getItem('username'),
          message: reader.result
        });
      }
    }, 2000);
  }

  stopRecording() {
    this.recorder.stop();
    let blob: Blob = this.recorder.getWAVBlob();
    // 编码成为字符串
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = (e) => {
      this.socket.emit('speech', {
        roomId: this.roomId,
        userName: localStorage.getItem('role') + '-' + localStorage.getItem('username'),
        message: reader.result
      });
    }
  }

  //观察classroom-dialog元素
  observeClassroomDiv(targetElement: HTMLElement) {
    // 创建一个新的MutationObserver实例
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          // style属性发生变化,获取targetElement的id为teach_building的元素中的文字
          let buildingName = targetElement.querySelector('#teach_building')!.innerHTML;
          this.lastTeachingBuilding = (buildingName == "第一教学楼" ? 1 : 2)
          this.getCourseList(this.lastTeachingBuilding);
        }
      }
    });

    // 配置观察选项
    const config = { attributes: true, attributeFilter: ['style'] };
    // 开始观察目标元素
    observer.observe(targetElement, config);
  }

  onSubmit() {
    this.sendMessage();
    // 获取到表单里的数据
    if (this.message.startsWith(this.robotCommand)){
      let content = this.message.split(this.robotCommand)[1];
      this.socket.emit('chatGPT',{
        dataList: this.dataList,
        message: content,
      })
    }
  }

  sendMessage() {
    const jsonObject = {
      userName: this.userName,
      message: this.message,
      roomId: this.roomId,
      type: 'text'
    };
    this.socket.emit('chat', jsonObject);
    this.message = '';
  }

  sendImageMessage(imageMessage:string,) {
    const jsonObject = {
      userName: this.userName,
      message: imageMessage,
      roomId: this.roomId,
      type: 'image'
    };
    this.socket.emit('chat', jsonObject);
  }

  output(msg: string,username:string,other:string = '',type:string = 'notification') {
    let message = new Message(
      //当前时间
      new Date().toLocaleTimeString(),
      //消息内容
      msg,
      //用户名
      username.split('-')[1],
      //身份
      username.split('-')[0],
      //其他
      other,
      //类型
      type
    );
    this.messages.push(message);
  }

  // 点击按钮后跳转到个人中心
  navigateToPersonalCenter() {
    window.location.href = '/personalCenter';
  }

  playerMove(platform) {
    let isMove = false;
    document.addEventListener('keydown', (event) => {
      if (isMove) return;
      switch (event.keyCode) {
        case 87: // w
          platform.playerControl('w');
          break;
      }
    }, false);
    //松手后停止
    document.addEventListener('keyup', (event) => {
      isMove = false;
      platform.playerControl('stop');
    }, false);
  }

  //监听用户的鼠标视角
  playerView(platform, event, platformDiv) {
    //判断当前鼠标是否被锁定
    if(document.pointerLockElement === platformDiv || document.mozPointerLockElement === platformDiv) {
      //鼠标被锁定
      let movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
      let movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
      platform.playerViewControl(movementX, movementY);
    }
  }

  //是否显示聊天框
  ifShowChat() {
    this.isShowChat = !this.isShowChat;
  }

  //进入课程
  enterClass(index) {
    //todo:进入课程
    console.log(this.courseList[index]);
  }

  //创建课程
  onCreateCourseSubmit() {

    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json', 'token': localStorage.getItem("token")! }),
    };
    const api = environment.apiPrefix + "/user/createCourse";
    const jsonObject = {
      courseName: this.createCourseTitle,
      courseDescription: this.createCourseDescription,
      building: this.lastTeachingBuilding,
      isOver: false
    };
    console.log(jsonObject);
    this.http.post(api, jsonObject, httpOptions).subscribe((res: any) => {
      if (res.success) {
        alert("创建成功");
        this.getCourseList(this.lastTeachingBuilding);
        this.createCourseTitle = "";
        this.createCourseDescription = "";
      }
      else {
        alert(res.message);
      }
    });
  }

  //获取当前某个教学楼的课程
  getCourseList(buildingIndex: number) {
    this.showCourseList = [];
    this.courseList = [];
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json', 'token': localStorage.getItem("token")! }),
    };
    const api = environment.apiPrefix + "/user/getCourseByBuilding/" + buildingIndex;
    this.http.get(api, httpOptions).subscribe((res: any) => {
      if (res.success) {
        for (let i = 0; i < res.data.length; i++) {
          let teacher = new Teacher(res.data[i].teacher.userId, res.data[i].teacher.username, res.data[i].role);
          let course = new Course(res.data[i].courseId, res.data[i].courseName, res.data[i].courseDescription,
            res.data[i].building, res.data[i].isOver, teacher);
          this.courseList.push(course);
        }
        for (let i = 0; i < this.courseList.length; i++) {
          if (this.courseList[i].isOver == 0 && this.courseList[i].building == buildingIndex) {
            this.showCourseList.push(this.courseList[i]);
          }
        }
      }
      else {
        alert(res.message);
      }
    });
  }

  //获取用户输入的图片文件
  view(){
    const file = document.getElementById('demo').files[0];
    console.log(file);
    imageConversion.compressAccurately(file,200).then(res=>{
      //The res in the promise is a compressed Blob type (which can be treated as a File type) file;
      //make the compressed file into base64 format
      imageConversion.filetoDataURL(res).then(res2=>{
        this.sendImageMessage(res2);
      })
    })
  }
}
