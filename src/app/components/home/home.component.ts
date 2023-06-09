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
import { Router, ActivatedRoute } from "@angular/router";
import { Name } from "../name";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [
    trigger('openClose', [
      // animation triggers go here
      state('open', style({
        width: '50%',
        height: '60%',
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
  isLoading: boolean = true;
  style = {
    'display': 'none'
  };
  socket: any;
  //聊天相关
  isShowChat = false;
  isShowRobot = false;
  message = '';
  messages: Message[] = [];
  robotMessage = '';
  robotMessages: Message[] = [];
  aiModel = 'moss';
  //开课相关
  createCourseTitle = "";
  createCourseDescription = "";
  lastTeachingBuilding = 0;
  courseList: Course[] = [];
  showCourseList: Course[] = [];
  createCourseForm: FormGroup;
  //录音相关
  recorder: Recorder;
  decoder: Recorder;
  recordInterval: any;
  constructor(private formBuilder: FormBuilder, public http: HttpClient, private router: Router, private route: ActivatedRoute) {};

  //当页面view加载完成后，执行ngAfterViewInit方法
  ngAfterViewInit() {
    if (localStorage.getItem('isReload') == 'true') {
      location.reload();
      localStorage.setItem('isReload', 'false');
    }
    //修改页面的title
    document.title = '主页';
    // this.ifShowChat();
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
            platform.speechBubbles[name].update(data.message,data.type)
          }
          clearTimeout(this.timers[name])
          this.timers[name] = setTimeout(function () {
            platform.speechBubbles[name].mesh.parent.remove(platform.speechBubbles[name].mesh);
            delete platform.speechBubbles[name];
          }, 5000);
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
          platform.speechBubbles[name].update(data.message,data.type)
        }
        clearTimeout(this.timers[name]);
        this.timers[name] = setTimeout(function () {
          platform.speechBubbles[name].mesh.parent.remove(platform.speechBubbles[name].mesh);
          delete platform.speechBubbles[name];
        }, 5000);
      }
      this.output(
        data.message, data.userName, "",data.type
      );
    });

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
    this.socket.on("AI_assistant", (data: { message: string }) => {
      this.robotMessages.push(new Message(new Date().toLocaleTimeString(), data.message, this.aiModel, 'assistant',"","text"));
    });
    const platformDiv = document.getElementById('platform');
    //设置platformDiv的pointLock
    platformDiv?.addEventListener('click', () => {
      platformDiv.requestPointerLock();
    });
    const classroomDiv = document.getElementById('classroom-dialog');
    this.observeClassroomDiv(classroomDiv!);
    const platform = new Platform(platformDiv, this.socket, classroomDiv,this);
    window.platform = platform;
    // platform.nameBubbles[localStorage.getItem('role') + '-' + localStorage.getItem('username')] = new Name(platform, localStorage.getItem('username'), 150);
    // platform.nameBubbles[localStorage.getItem('role') + '-' + localStorage.getItem('username')].player = platform.player;
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
    this.recordInterval = setInterval(function () {
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
    clearInterval(this.recordInterval);
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
    // 获取到表单里的数据
    console.log(this.userName);
    console.log(this.message);
    this.sendMessage();
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
        //c
        case 67:
          this.ifShowChat();
          break;
        //r
        case 82:
          this.ifShowRobot();
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
    let chatDiv = document.getElementById('chatDiv');
    if(this.isShowChat) {
      chatDiv!.style.display = 'block';
    }
    else {
      chatDiv!.style.display = 'none';
    }
  }

  //是否显示机器人
  ifShowRobot() {
    this.isShowRobot = !this.isShowRobot;
    let robotDiv = document.getElementById('robotDiv');
    if(this.isShowRobot) {
      robotDiv!.style.display = 'block';
    }
    else {
      robotDiv!.style.display = 'none';
    }
  }

  //进入课程
  enterClass(index) {
    // console.log(this.courseList[index])
    localStorage.setItem("isReload", "true");
    this.router.navigate(['/classroom'],{state: this.courseList[index]});
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

  //点击选择图片,展示本机图片文件夹
  onChooseImage() {
    document.getElementById('input_image')!.click();
  }

  //获取用户输入的图片文件
  view(){
    const file = document.getElementById('input_image').files[0];
    console.log(file);
    imageConversion.compressAccurately(file,200).then(res=>{
      //The res in the promise is a compressed Blob type (which can be treated as a File type) file;
      //make the compressed file into base64 format
      imageConversion.filetoDataURL(res).then(res2=>{
        this.sendImageMessage(res2);
      })
    })
  }
  //用户点击语音聊天
  onChooseVoice(){
    let voiceBtn = document.getElementById('voice_btn');
    //获取btn的文本
    let voiceBtnText = voiceBtn!.innerText;
    if(voiceBtnText == '开启聊天'){
      voiceBtn!.innerText = '关闭聊天';
      this.startRecording();
    }
    else{
      voiceBtn!.innerText = '开启聊天';
      this.stopRecording();
    }
  }

  //机器人聊天
  onRobotSubmit(){
    let robotMessage = new Message(
      //当前时间
      new Date().toLocaleTimeString(),
      //消息内容
      this.robotMessage,
      //用户名
      localStorage.getItem("username")!,
      //角色
      "user",
      "",
      //消息类型
      "text");
    this.robotMessages.push(robotMessage);

    //发送消息
    //设置历史消息
    let historyMessage = [];
    for(let i = 0;i<this.robotMessages.length;i++){
      historyMessage.push(
        {"role":this.robotMessages[i].role,"message":this.robotMessages[i].message}
      );
    }

    const jsonObject = {
      userName: localStorage.getItem("username")!,
      message: this.robotMessage,
      model: this.aiModel,
      dataList:historyMessage
    };
    this.socket.emit('AI_assistant', jsonObject);
    this.robotMessage = "";
  }
}
