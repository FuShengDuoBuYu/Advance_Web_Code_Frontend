//@ts-nocheck
import { Component } from '@angular/core';
import io from 'socket.io-client';
import { environment } from '../../app.module';
import { SpeechBubble } from './speech_bublle';
import { Platform } from './platform';
import {HttpClient,HttpHeaders} from "@angular/common/http";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Course,Teacher } from './course';
import Recorder from 'js-audio-recorder';

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
  createCourseTitle = "";
  createCourseDescription = "";
  lastTeachingBuilding = 0;
  courseList :Course[] = [];
  showCourseList : Course[] = [];
  createCourseForm: FormGroup;

  recorder: Recorder;
  decoder: Recorder;

  constructor(private formBuilder: FormBuilder,public http:HttpClient) {}
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
        '<span class="connect-msg">The client has connected with the server. Username: ' +
        this.userName + ' Room: ' + this.roomId +
        '</span>'
      );
    });
    this.socket.on('chat', (data: { userName: string; message: string }) => {
      for (let name in platform.remotePlayers) {
        if (name == data.userName) {
          let speech = platform.speechBubbles[name];
          if (speech !== undefined) {
            speech.update(data.message);
          } else {
            platform.speechBubbles[name] = new SpeechBubble(platform, data.message, 150);
            platform.speechBubbles[name].player = platform.remotePlayers[name];
            this.timers[name] = setTimeout(function () {
              platform.speechBubbles[name].mesh.parent.remove(platform.speechBubbles[name].mesh);
              delete platform.speechBubbles[name];
            }, 5000);
            platform.speechBubbles[name].update(data.message)
          }
        }
      }
      let name = data.userName;
      if (data.userName == localStorage.getItem('role') + '-' + localStorage.getItem('username')) {
        let speech = platform.speechBubbles[name];
        if (speech !== undefined) {
          speech.update(data.message);
        } else {
          platform.speechBubbles[name] = new SpeechBubble(platform, data.message, 150);
          platform.speechBubbles[name].player = platform.player;
          this.timers[name] = setTimeout(function () {
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

    this.socket.on('speech', (data: { userName: string; message: string }) => {
      console.log(data);
      // 原来这么简单。。。。
      var snd = new Audio(data.message);
      snd.play();
    });

    this.socket.on('disconnect', () => {
      this.output('<span class="disconnect-msg">The client has disconnected!</span>');
    });
    this.socket.on('reconnect_attempt', (attempts: string) => {
      console.log('Try to reconnect at ' + attempts + ' attempt(s).');
    });

    const platformDiv = document.getElementById('platform');
    const classroomDiv = document.getElementById('classroom-dialog');
    this.observeClassroomDiv(classroomDiv!);
    const platform = new Platform(platformDiv, this.socket, classroomDiv);
    window.platform = platform;
    this.playerMove(platform);
    this.playerView(platform);

  }

  ngOnInit(){
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
    setInterval(function() {
      that.recorder.stop();
      let blob:Blob = that.recorder.getWAVBlob();
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
      // that.recorder.start();
    }, 2000);
  }

  stopRecording() {
    this.recorder.stop();
    let blob:Blob = this.recorder.getWAVBlob();
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
          this.lastTeachingBuilding = (buildingName=="第一教学楼"?1:2)
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
      if (isMove) return;
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
      if (isMouseMove) return;
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
      if (isMouseMove) return;
      if (lastX < 10) {
        platform.playerViewControl(-100, 0);
      }
      if (innerWidth - lastX < 10) {
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
  enterClass(index) {
    //todo:进入课程
    console.log(this.courseList[index]);
  }

  //创建课程
  onCreateCourseSubmit() {
    
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json','token':localStorage.getItem("token")! }),
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
      if(res.success){
        alert("创建成功");
        this.getCourseList(this.lastTeachingBuilding);
        this.createCourseTitle = "";
        this.createCourseDescription = "";
      }
      else{
        alert(res.message);
      }
    });
  }

  //获取当前某个教学楼的课程
  getCourseList(buildingIndex: number) {
    this.showCourseList = [];
    this.courseList = [];
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json','token':localStorage.getItem("token")! }),
    };
    const api = environment.apiPrefix + "/user/getCourseByBuilding/" + buildingIndex;
    this.http.get(api,httpOptions).subscribe((res: any) => {
      if(res.success){
        for (let i = 0; i < res.data.length; i++) {
          let teacher = new Teacher(res.data[i].teacher.userId, res.data[i].teacher.username,res.data[i].role);
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
      else{
        alert(res.message);
      }
    });
  }
}