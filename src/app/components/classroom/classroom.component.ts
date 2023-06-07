//@ts-nocheck
import { Component } from '@angular/core';
import * as THREE from 'three';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { JoyStick} from "./lib"
import {environment} from "../../app.module";
import io from 'socket.io-client';
import {Vector3} from "three";
import {Message} from "../message";
import { SpeechBubble } from '../speech_bublle';
import {animate, state, style, transition, trigger} from "@angular/animations";
import * as imageConversion from "image-conversion";
import { ActivatedRoute } from '@angular/router';
import Recorder from 'js-audio-recorder';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Name } from "../name";


@Component({
  selector: 'app-classroom',
  templateUrl: './classroom.component.html',
  styleUrls: ['./classroom.component.css'],
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
export class ClassroomComponent {
  message: string = '';
  messages: Message[] = [];
  isShowChat = false;
  isShowRobot = false;
  robotMessage: '';
  robotMessages: Message[] = [];
  aiModel = 'moss';
  // 录音相关
  recorder : Recorder;
  decoder : Recorder;
  courseName: string;
  // courseName = history.state.courseName;
    constructor(private route: ActivatedRoute) {
      this.camera;
      this.cameras;
      this.stats;
      this.scene;
      this.renderer;
      this.plane;
      this.pointer;
      this.raycaster;
      this.isShiftDown = false;
      this.rollOverMesh;
      this.rollOverMaterial;
      this.cubeGeo;
      this.cubeMaterial;
      this.objects = [];
      this.controls;
      this.player={};
      this.animations = {};
      this.scale = 0.6;
      this.actionAnimation;
      this.roomId = 6;
      //动画
      // const platform = this;
      this.anims = ['Walking', 'Walking Backwards', 'Turn', 'Running', 'Pointing', 'Talking', 'Pointing Gesture'];
      this.clock = new THREE.Clock();
      this.remotePlayers = {};
      this.speechBubbles = {};
      this.userName = localStorage.getItem('role') + '-' + localStorage.getItem('username');
      this.timers = {};
      this.remoteData = {};
      this.nameBubble;
      this.nameBubbles = {};
      this.showIdNames = {};

    }
  ngAfterViewInit() {
    document.title = "教室";
    const isReload = localStorage.getItem('isReload');
    if(isReload == 'true') {
      localStorage.setItem('isReload', 'false');
      window.location.reload();
    }
    this.courseName = history.state.courseName;
    this.roomId = history.state.courseId;
    this.recorder = new Recorder({
      sampleBits: 16,         // 采样位数，支持 8 或 16，默认是16
      sampleRate: 16000,      // 采样率，支持 11025、16000、22050、24000、44100、48000，默认是16000
      numChannels: 1,         // 声道，支持 1 或 2，默认是1
      compiling: true,       // 是否边录边转换，默认是false
    });
    // this.ifShowChat();
    this.init();
    this.initSocket();
    this.render();
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

  sendImageMessage(imageMessage:string,) {
    const jsonObject = {
      userName: this.userName,
      message: imageMessage,
      roomId: this.roomId,
      type: 'image'
    };
    this.socket.emit('chat', jsonObject);
  }

  initSocket(){
    let url = environment.socketPrefix
    let platform = this;
    let opts = {
      query: 'roomId=' + this.roomId + '&userName=' + localStorage.getItem('role') + '-' + localStorage.getItem('username'),
      transports:['websocket']
    };
    this.socket = io(url,opts);
    this.socket.connect();
    this.socket.on('connect', () => {
      console.log('connect')
      this.output(
        "您已连接到服务器!",localStorage.getItem('username'),"connect-msg"
      );
    });
    this.socket.on('chat', (data: { userName: string; message: string,type:string }) => {
      //为romatePlayer添加speechBubble
      for (let name in platform.remotePlayers) {
        if (name == data.userName) {
          let speech = platform.speechBubbles[name];
          if (speech !== undefined) {
            speech.update(data.message,data.type);
          } else {
            platform.speechBubbles[name] = new SpeechBubble(platform, data.message, 150,data.type,260);
            platform.speechBubbles[name].player = platform.remotePlayers[name];
            platform.speechBubbles[name].update(data.message,data.type)
          }
          clearTimeout(this.timers[name]);
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
          platform.speechBubbles[name] = new SpeechBubble(platform, data.message, 150,data.type,260);
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
    this.socket.on('disconnect', () => {
      this.output("您已断开连接!",localStorage.getItem('username'),"disconnect-msg");
    });
    this.socket.on('reconnect_attempt', (attempts: string) => {
      console.log('Try to reconnect at ' + attempts + ' attempt(s).');
    });
    this.socket.on("AI_assistant", (data: { message: string }) => {
      this.robotMessages.push(new Message(new Date().toLocaleTimeString(), data.message, this.aiModel, 'assistant',"","text"));
    });
    // 初始化user参数
    this.socket.emit('init',{
      rolename: localStorage.getItem('roleName'),
      username: localStorage.getItem('role') + '-' + localStorage.getItem('username'),
      x: -500,
      y: 0,
      z: -2000,
      r: 0,
    });

    this.socket.on('remoteData', function(data){

      platform.remoteData = data;
      // 获取this.remotePlayers中的所有key
      var keys = Object.keys(platform.remotePlayers);
      var remoteNames = [];
      for (let i = 0; i < data.length; i++) {
        if (data[i].username == localStorage.getItem('role') + '-' + localStorage.getItem('username')) {
          continue;
        }
        remoteNames.push(data[i].username);
        platform.loadRemotePlayer(new FBXLoader(), data[i]);
      }
      // 删除多余的remotePlayers
      for (let i = 0; i < keys.length; i++) {
        if (remoteNames.indexOf(keys[i]) == -1) {
          platform.scene.remove(platform.remotePlayers[keys[i]].object);
          delete platform.remotePlayers[keys[i]];
        }
      }
      // 添加新的remoteNameBubble
      let names = Object.keys(platform.showIdNames);
      platform.showIdNames[localStorage.getItem('role') + '-' + localStorage.getItem('username')]
        = localStorage.getItem('username');
      for(let i = 0; i < remoteNames.length; i++){
        if(names.indexOf(remoteNames[i]) == -1){
          platform.showIdNames[remoteNames[i]] = remoteNames[i].split('-')[1];
        }else {
          names.splice(names.indexOf(remoteNames[i]),1);
        }
      }
      for(let i = 0; i < names.length; i++){
        if (names[i] == localStorage.getItem('role') + '-' + localStorage.getItem('username')) {
          continue;
        }
        // platform.scene.remove(platform.nameBubbles[names[i]].mesh);
        delete platform.showIdNames[names[i]];
      }
      let nameKeys = Object.keys(platform.speechBubbles);
      for(let i = 0; i < nameKeys.length; i++){
        // platform.scene.remove(platform.nameBubbles[nameKeys[i]].mesh);
        delete platform.showIdNames[nameKeys[i]];
      }
      const showIdNamesKeys = Object.keys(platform.showIdNames);
      const tempKeys = Object.keys(platform.nameBubbles);
      const nameBubblesKeys = Object.keys(platform.nameBubbles);
      for(let i = 0; i < showIdNamesKeys.length; i++){
        if (nameBubblesKeys.indexOf(showIdNamesKeys[i]) == -1) {
          platform.nameBubbles[showIdNamesKeys[i]] = new Name(platform, platform.showIdNames[showIdNamesKeys[i]], 150,200);
          if (showIdNamesKeys[i] == localStorage.getItem('role') + '-' + localStorage.getItem('username')) {
            platform.nameBubbles[showIdNamesKeys[i]].player = platform.player;
          }else{
            platform.nameBubbles[showIdNamesKeys[i]].player = platform.remotePlayers[showIdNamesKeys[i]];
          }
        }else {}
        tempKeys.splice(tempKeys.indexOf(showIdNamesKeys[i]), 1);
      }
      for(let i = 0; i < tempKeys.length; i++){
        platform.scene.remove(platform.nameBubbles[tempKeys[i]].mesh);
        delete platform.nameBubbles[tempKeys[i]];
      }
    });
    let _this = this;
    // 初始化block参数
    this.socket.on('addBlock', function(data){
      const voxel = new THREE.Mesh( _this.cubeGeo, _this.cubeMaterial );
      voxel.position.set(data.x1, data.y1, data.z1)
      voxel.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
      _this.scene.add( voxel );
      _this.objects.push( voxel );
    })

    this.socket.on('deleteBlock', function(data){
      for(let i = 0; i < _this.objects.length; i++){
        if(_this.objects[i].position.x == data.x1 && _this.objects[i].position.y1 == data.y && _this.objects[i].position.z == data.z1){
          _this.scene.remove(_this.objects[i]);
          _this.objects.splice(i,1);
          break;
        }
      }
    })
    this.socket.on('speech', (data: { userName: string; message: string }) => {;
      var snd = new Audio(data.message);
      snd.play();
    });

  }

  loadRemotePlayer(loader, data) {
    var temp_player = {};
    const platform = this;
    // 检查是否remotePlayers是否已经存在，通过判断username
    if (this.remotePlayers[data.username]!=undefined && this.remotePlayers[data.username].hasOwnProperty('object')) {
      // 如果存在，就仅仅更新位置
      temp_player = this.remotePlayers[data.username];
      if(temp_player.object != null){
        //当位置变化时,更新位置,设置走动动画
        if(temp_player.object.position.x != data.x || temp_player.object.position.z != data.z || temp_player.object.rotation.y != data.r){
          temp_player.object.position.set(data.x, data.y, data.z)
          temp_player.object.rotation.y = data.r;
          if(temp_player.action != 'Walking')
            this.setPlayerAction(temp_player, 'Walking');
        }
        else{
          if(temp_player.action != 'Idle')
            this.setPlayerAction(temp_player, 'Idle');
        }
      }
      return;
    }

    temp_player.object = null;
    this.remotePlayers[data.username] = temp_player;
    loader.load(`assets/fbx/people/`+data.rolename+`.fbx`, function (object) {
      object.mixer = new THREE.AnimationMixer(object);
      temp_player.mixer = object.mixer;
      temp_player.root = object.mixer.getRoot();
      object.name = data.rolename;
      //添加对应内容
      object.traverse(function (child) {
        if (child.isMesh) {
          child.material.map = null;
          child.castShadow = true;
          child.receiveShadow = false;
        }
      });
      //贴图纹理
      const texture = new THREE.TextureLoader().load(`assets/images/SimplePeople_`+data.rolename+`_Brown.png`, (texture) => {
        object.traverse(function (child) {
          if (child.isMesh) {
            child.material.map = texture;
            child.material.needsUpdate = true;
          }
        });
      });

      //加入这个模型,设置模型的位置
      object.position.set(data.x, data.y, data.z);
      object.scale.set(platform.scale, platform.scale, platform.scale);
      platform.scene.add(object);
      //设置用户的object就是这个形象
      temp_player.object = object;
      console.log("loadRemotePlayer",temp_player);
      console.log("loadRemotePlayer",platform.remotePlayers);
    });

  }

  setPlayerAction(player,name) {
    console.log(this.animations[name],"setPlayerAction");
    //设置动作
    const action = player.mixer.clipAction(this.animations[name]);
    console.log(action,"action")
    action.time = 0.5;
    //停止所有动作
    player.mixer.stopAllAction();
    player.action = name;
    player.actionTime = Date.now();
    action.fadeIn(0);
    action.play();
  }

  onSubmit() {
    // 获取到表单里的数据
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
  //点击选择图片,展示本机图片文件夹
  onChooseImage() {
    document.getElementById('input_image')!.click();
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

  init() {
    const platformDiv = document.getElementById('platform');
    this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 10, 200000 );
    this.camera.position.set( 500, 600, 600 );
    // this.camera.lookAt( 0, 0, 0 );

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0x00a0f0 );
    const ambient = new THREE.AmbientLight(0xffffff);
    this.scene.add(ambient);
    //设置方向光
    const light = new THREE.DirectionalLight(0xaaaaaa);
    light.position.set(30, 100, 40);
    light.castShadow = true;
    light.target.position.set(0, 0, 0);
    //设置光源的阴影
    const shadowSize = 500;
    light.shadow.camera.near = 1;
    light.shadow.camera.far = 500;
    light.shadow.camera.top = shadowSize;
    light.shadow.camera.bottom = -shadowSize;
    light.shadow.camera.left = -shadowSize;
    light.shadow.camera.right = shadowSize;
    light.shadow.bias = 0.0039;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    this.sun = light;
    this.scene.add(light);
    this.intersect;
    //
    //加载模型
    const loader = new FBXLoader();
    const platform = this;
    loader.load(`assets/fbx/CLASSROOM.fbx`, function (object) {
      object.scale.set(0.5, 0.5, 0.5);
      object.position.set(-100,45,0);
       platform.scene.add(object);

    });

    loader.load(`assets/fbx/people/`+localStorage.getItem('roleName')+`.fbx`, function (object) {
      object.mixer = new THREE.AnimationMixer(object);
      platform.player.mixer = object.mixer;
      platform.player.root = object.mixer.getRoot();
      object.name = "FireFighter";
      //添加对应内容
      object.traverse(function (child) {
        if (child.isMesh) {
          child.material.map = null;
          child.castShadow = true;
          child.receiveShadow = false;
        }
      });
      //贴图纹理
      const texture = new THREE.TextureLoader().load(`assets/images/SimplePeople_`+localStorage.getItem('roleName')+`_Brown.png`, (texture) => {
        object.traverse(function (child) {
          if (child.isMesh) {
            child.material.map = texture;
            child.material.needsUpdate = true;
          }
        });
      });

      //加入这个模型,设置模型的位置
      object.position.set(300, 0, 300);
      object.scale.set(platform.scale, platform.scale, platform.scale);
      platform.camera.lookAt(object.position);
      platform.scene.add(object);
      //设置用户的object就是这个形象
      platform.player.object = object;
      //设置动画
      platform.animations.Idle = object.animations[0];
      //设置下一个动画
      platform.loadNextAnim(loader);
    });
    // roll-over helpers
    const rollOverGeo = new THREE.BoxGeometry( 50, 50, 50 );
    this.rollOverMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 0.5, transparent: true } );
    this.rollOverMesh = new THREE.Mesh( rollOverGeo, this.rollOverMaterial );
    this.scene.add( this.rollOverMesh );

    // cubes

    this.cubeGeo = new THREE.BoxGeometry( 50, 50, 50 );
    this.cubeMaterial = new THREE.MeshStandardMaterial( {
      color: 0xfeb74c,
      roughness: 0.7,
      metalness: 0.2,
      bumpScale: 0.002
    } );
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('assets/texture/brick_diffuse.jpg', (map) => {
      map.wrapS = map.wrapT = THREE.RepeatWrapping;
      map.anisotropy = 4;
      map.repeat.set(1, 1);
      this.cubeMaterial.map = map;
      this.cubeMaterial.needsUpdate = true;
    })

    textureLoader.load('assets/texture/brick_bump.jpg', (map) => {
      map.wrapS = map.wrapT = THREE.RepeatWrapping;
      map.anisotropy = 4;
      map.repeat.set(1, 1);
      this.cubeMaterial.bumpMap = map;
      this.cubeMaterial.needsUpdate = true;
    })

    textureLoader.load('assets/texture/brick_roughness.jpg', (map) => {
      map.wrapS = map.wrapT = THREE.RepeatWrapping;
      map.anisotropy = 4;
      map.repeat.set(10, 24);
      this.cubeMaterial.roughnessMap = map;
      this.cubeMaterial.needsUpdate = true;
    })

    const gridHelper = new THREE.GridHelper( 1000, 20 );
    this.scene.add( gridHelper );


    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    const geometry = new THREE.PlaneGeometry( 300, 600 );

    geometry.rotateX( - Math.PI / 2 );
    this.plane = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { visible: true } ) );
    this.scene.add( this.plane );
    const geometry1 = new THREE.PlaneGeometry( 300, 600);
    geometry1.rotateX( - Math.PI / 2 );
    //set aside of the plane
    this.scene.add( new THREE.Mesh( geometry1, new THREE.MeshBasicMaterial( { color: 0x957272, visible: false } ) ) );

    this.objects.push( this.plane );
    this.joystick = new JoyStick({
      onMove:this.playerControl,
      platform:this
    })
    // // lights
    //
    // const ambientLight = new THREE.AmbientLight( 0x606060 );
    // this.scene.add( ambientLight );
    //
    // const directionalLight = new THREE.DirectionalLight( 0xffffff );
    // directionalLight.position.set( 1, 0.75, 0.5 ).normalize();
    // this.scene.add( directionalLight );

    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.shadowMap.enabled = true;
    this.controls = new OrbitControls( this.camera, this.renderer.domElement );
    platformDiv.appendChild( this.renderer.domElement );

    document.addEventListener( 'pointermove', this.onPointerMove.bind(this) );
    document.addEventListener( 'pointerdown', this.onPointerDown.bind(this) );
    document.addEventListener( 'keydown', this.onDocumentKeyDown.bind(this) );
    document.addEventListener( 'keyup', this.onDocumentKeyUp.bind(this) );

    //

    window.addEventListener( 'resize', this.onWindowResize.bind(this) );

  }

  onWindowResize() {

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( window.innerWidth, window.innerHeight );

    this.render();

  }

  onPointerMove( event ) {
    this.pointer.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );
    this.raycaster.setFromCamera( this.pointer, this.camera );

    const intersects = this.raycaster.intersectObjects( this.objects, false );

    if ( intersects.length > 0 ) {

      const intersect = intersects[ 0 ];

      this.rollOverMesh.position.copy( intersect.point ).add( intersect.face.normal );
      this.rollOverMesh.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
      this.render();

    }

  }

  onPointerDown( event ) {

    this.pointer.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );

    this.raycaster.setFromCamera( this.pointer, this.camera );

    const intersects = this.raycaster.intersectObjects( this.objects, false );

    if ( intersects.length > 0 ) {
      const intersect = intersects[ 0 ];

      // delete cube

      if ( this.isShiftDown ) {

        if ( intersect.object !== this.plane ) {

          console.log(intersect);
          // this.scene.remove( intersect.object );
          //
          // this.objects.splice( this.objects.indexOf( intersect.object ), 1 );
          this.socket.emit('deleteBlock', {
            roomId: this.roomId,
            x1: intersect.object.position.x,
            y1: intersect.object.position.y,
            z1: intersect.object.position.z,
            x2: intersect.point.x,
            y2: intersect.point.y,
            z2: intersect.point.z,
          });

        }

        // create cube

      } else {
        const voxel = new THREE.Mesh( this.cubeGeo, this.cubeMaterial );
        voxel.position.copy( intersect.point ).add( intersect.face.normal );
        voxel.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
        this.socket.emit('addBlock', {
          roomId: this.roomId,
          x1: voxel.position.x,
          y1: voxel.position.y,
          z1: voxel.position.z,
          x2: intersect.face.normal.x,
          y2: intersect.face.normal.y,
          z2: intersect.face.normal.z,
        });

      }

      this.render();

    }

  }

  onDocumentKeyDown( event ) {

    switch ( event.keyCode ) {

      case 16: this.isShiftDown = true; break;
      //c
      case 67:
        this.ifShowChat();
        break;
      //r
      case 82:
        this.ifShowRobot();
        break;

    }

  }

  onDocumentKeyUp( event ) {

    switch ( event.keyCode ) {

      case 16: this.isShiftDown = false; break;

    }

  }

  render() {

    this.renderer.render( this.scene, this.camera );

  }

  //设置动画
  animate() {
    const platform = this;
    const dt = this.clock.getDelta();
    // console.log(this);

    if (this.player.mixer !== undefined) this.player.mixer.update(dt);

    for(let i in this.remotePlayers){
      if(this.remotePlayers[i].mixer !== undefined) this.remotePlayers[i].mixer.update(dt);
    }

    if (this.player.move !== undefined) this.movePlayer(dt);
    //做一下相机的位置的线性插值
    if (this.player.cameras != undefined && this.player.cameras.active != undefined) {
      this.camera.position.lerp(this.player.cameras.active.getWorldPosition(new THREE.Vector3()), 0.05);
      const pos = this.player.object.position.clone();
      pos.y += 200;
      this.camera.lookAt(pos);
    }

    //确保太阳光的位置保证定向光线不断指向人物
    if (this.sun != undefined) {
      this.sun.position.x = this.player.object.position.x;
      this.sun.position.y = this.player.object.position.y + 200;
      this.sun.position.z = this.player.object.position.z + 100;
      this.sun.target = this.player.object;
    }

    for (let name in this.speechBubbles) {
      this.speechBubbles[name].show(this.camera.position);
    }
    for (let name in this.nameBubbles) {
      this.nameBubbles[name].show(this.camera.position);
    }
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(function () { platform.animate(); });
  }

  loadNextAnim(loader) {
    const anim = this.anims.pop();
    const platform = this;
    loader.load(`assets/fbx/anims/${anim}.fbx`, function (object) {
      platform.animations[anim] = object.animations[0];
      if (platform.anims.length > 0) {
        platform.loadNextAnim(loader);
      }
      else {
        console.log("createCameras")
        platform.createCameras();
        platform.joystick = new JoyStick({
          onMove: platform.playerControl,
          platform: platform
        })
        delete platform.anims;
        platform.action = "Idle";
        platform.animate();
      }
    });
  }

  //get and set Action
  set action(name) {
    //设置一个动作
    console.log(name)
    const action = this.player.mixer.clipAction(this.animations[name]);
    action.time = 0;
    this.player.mixer.stopAllAction();
    this.player.action = name;
    this.player.actionTime = Date.now();
    console.log(this.player.action)
    action.fadeIn(0);
    action.play();
  }

  get action() {
    //获取一个动作
    if (this.player === undefined || this.player.actionName === undefined) return "";
    return this.player.action;
  }

  //设置滑竿带来的移动控制
  playerControl(forward, turn) {
    turn = -turn;

    if (forward > 0.3) {
      if (this.player.action != 'Walking' && this.player.action != 'Running') this.action = 'Walking';
    } else if (forward < -0.3) {
      if (this.player.action != 'Walking Backwards') this.action = 'Walking Backwards';
    } else {
      forward = 0;
      if (Math.abs(turn) > 0.1) {
        if (this.player.action != 'Turn') this.action = 'Turn';
      } else if (this.player.action != "Idle") {
        this.action = 'Idle';
      }
    }

    if (forward == 0 && turn == 0) {
      delete this.player.move;
    }
    else {
      this.player.move = { forward, turn };
    }
  }
  //设置相机
  set activeCamera(object) {
    this.player.cameras.active = object;
  }
  //创建一个相机视角
  createCameras() {
    const offset = new THREE.Vector3(0, 80, 0);
    const front = new THREE.Object3D();
    front.position.set(112, 100, 600);
    front.parent = this.player.object;
    const back = new THREE.Object3D();
    back.position.set(0, 300, -1050);
    back.parent = this.player.object;
    const wide = new THREE.Object3D();
    wide.position.set(178,139,1665);
    wide.parent = this.player.object;
    const overhead = new THREE.Object3D();
    overhead.position.set(0, 400, 0);
    overhead.parent = this.player.object;
    const collect = new THREE.Object3D();
    collect.position.set(40, 82, 94);
    collect.parent = this.player.object;
    //设置相机,是用户的各个视角
    this.player.cameras = { front, back, wide, overhead, collect, active: back };
    //默认的相机是back
    platform.activeCamera = this.player.cameras.overhead;
  }

  //移动角色
  movePlayer(dt) {
    // console.log(this.player.object.position)
    if (this.player.move.forward > 0) {
      const speed = (this.player.action == 'Running') ? 400 : 150;
      this.player.object.translateZ(dt * speed* this.scale);
    } else {
      this.player.object.translateZ(-dt * 30);
    }
    if(this.player.object.position.z < -860 || this.player.object.position.z > 792 ||
      (this.player.object.position.z < 300 && this.player.object.position.z > -300 &&
      this.player.object.position.x < 150 && this.player.object.position.x > -150) ||
      this.player.object.position.x < -364 || this.player.object.position.x > 860
    ){
      if (this.player.move.forward > 0) {
        const speed = (this.player.action == 'Running') ? 400 : 150;
        this.player.object.translateZ(-dt * speed* this.scale);
      } else {
        this.player.object.translateZ(dt * 30);
      }
    }
    this.player.object.rotateY(this.player.move.turn * dt);
    this.camera.lookAt(this.player.object.position);
    this.socket.emit('move', {
      rolename: localStorage.getItem('roleName'),
      username: localStorage.getItem('role') + '-' + localStorage.getItem('username'),
      x: this.player.object.position.x,
      y: this.player.object.position.y,
      z: this.player.object.position.z,
      r: this.player.object.rotation.y
    });
  }
  //监听用户的wasd输入
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
  playerView(platform,event, platformDiv) {
    //监听一次鼠标移动的距离
    //判断当前鼠标是否被锁定
    if(document.pointerLockElement === platformDiv || document.mozPointerLockElement === platformDiv) {
      //鼠标被锁定
      let movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
      let movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
      platform.playerViewControl(movementX, movementY);
    }

  }

  //设置键盘带来的移动控制
  playerControl1(forward) {
    if(forward=='w'){
      this.player.forward = 'w';
      this.player.move = { forward: 300, turn: 0 };
      if(this.actionAnimation!=='Walking'){
        this.action = 'Walking'
        this.actionAnimation = 'Walking'
      }
    }
    if(forward=='stop'){
      this.player.forward = 'stop';
      delete this.player.move;
      if(this.actionAnimation!=='Idle'){
        this.action = 'Idle'
        this.actionAnimation = 'Idle'
      }
    }
  }

  //设置鼠标带来的视角控制
  playerViewControl(dx,dy){
    this.player.object.rotation.y -= dx * 0.002;
    this.camera.rotation.x -= dy * 0.002;
  }
}


class JoyStick{
  constructor(options){
    const circle = document.createElement("div");
    circle.style.cssText = "position:absolute; bottom:35px; width:80px; height:80px; background:rgba(126, 126, 126, 0.5); border:#444 solid medium; border-radius:50%; left:50%; transform:translateX(-50%);";
    const thumb = document.createElement("div");
    thumb.style.cssText = "position: absolute; left: 20px; top: 20px; width: 40px; height: 40px; border-radius: 50%; background: #fff;";
    circle.appendChild(thumb);
    document.body.appendChild(circle);
    this.domElement = thumb;
    this.maxRadius = options.maxRadius || 40;
    this.maxRadiusSquared = this.maxRadius * this.maxRadius;
    this.onMove = options.onMove;
    this.platform = options.platform;
    this.origin = { left:this.domElement.offsetLeft, top:this.domElement.offsetTop };
    this.rotationDamping = options.rotationDamping || 0.06;
    this.moveDamping = options.moveDamping || 0.01;
    if (this.domElement!=undefined){
      const joystick = this;
      if ('ontouchstart' in window){
        this.domElement.addEventListener('touchstart', function(evt){ evt.preventDefault(); joystick.tap(evt); evt.stopPropagation();});
      }else{
        this.domElement.addEventListener('mousedown', function(evt){ evt.preventDefault(); joystick.tap(evt); evt.stopPropagation();});
      }
    }
  }

  getMousePosition(evt){
    const clientX = evt.targetTouches ? evt.targetTouches[0].pageX : evt.clientX;
    const clientY = evt.targetTouches ? evt.targetTouches[0].pageY : evt.clientY;
    return { x:clientX, y:clientY };
  }

  tap(evt){
    evt = evt || window.event;
    // get the mouse cursor position at startup:
    this.offset = this.getMousePosition(evt);
    const joystick = this;
    if ('ontouchstart' in window){
      document.ontouchmove = function(evt){ evt.preventDefault(); joystick.move(evt); };
      document.ontouchend =  function(evt){ evt.preventDefault(); joystick.up(evt); };
    }else{
      document.onmousemove = function(evt){ evt.preventDefault(); joystick.move(evt); };
      document.onmouseup = function(evt){ evt.preventDefault(); joystick.up(evt); };
    }
  }

  move(evt){
    evt = evt || window.event;
    const mouse = this.getMousePosition(evt);
    // calculate the new cursor position:
    let left = mouse.x - this.offset.x;
    let top = mouse.y - this.offset.y;
    //this.offset = mouse;

    const sqMag = left*left + top*top;
    if (sqMag>this.maxRadiusSquared){
      //Only use sqrt if essential
      const magnitude = Math.sqrt(sqMag);
      left /= magnitude;
      top /= magnitude;
      left *= this.maxRadius;
      top *= this.maxRadius;
    }
    // set the element's new position:
    this.domElement.style.top = `${top + this.domElement.clientHeight/2}px`;
    this.domElement.style.left = `${left + this.domElement.clientWidth/2}px`;

    const forward = -(top - this.origin.top + this.domElement.clientHeight/2)/this.maxRadius;
    const turn = (left - this.origin.left + this.domElement.clientWidth/2)/this.maxRadius;

    if (this.onMove!=undefined) this.onMove.call(this.platform, forward, turn);
  }

  up(evt){
    if ('ontouchstart' in window){
      document.ontouchmove = null;
      document.touchend = null;
    }else{
      document.onmousemove = null;
      document.onmouseup = null;
    }
    this.domElement.style.top = `${this.origin.top}px`;
    this.domElement.style.left = `${this.origin.left}px`;

    this.onMove.call(this.platform, 0, 0);
  }
}
