//@ts-nocheck
import { Component } from '@angular/core';
import * as THREE from 'three';
import io from 'socket.io-client';
import { environment } from '../../app.module';

//如果报错,那么就从如下位置安装
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { randInt } from 'three/src/math/MathUtils';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  userName: string | null = localStorage.getItem('role') + '-' + localStorage.getItem('username');
  roomId: string = 'home';
  message = '';
  socket: any;
  constructor() {
  }
  //当页面view加载完成后，执行ngAfterViewInit方法
  ngAfterViewInit() {
    //修改页面的title
    document.title = '主页';

    const url = environment.socketPrefix;
    console.log(url);
    let opts = {
      query: 'roomId=' + this.roomId + '&userName=' + localStorage.getItem('role') + '-' + localStorage.getItem('username'),
      transports:['websocket']
    };
    this.socket = io(url,opts);
    this.timers = {};
    this.timers['timer'] = setTimeout(
      () => {
        console.log('timer');
      },5000
    )
    this.socket.connect();
    console.log(this.socket);
    this.socket.on('connect', () => {
      this.output(
        '<span class="connect-msg">The client has connected with the server. Username: ' +
        this.userName + ' Room: ' + this.roomId +
          '</span>'
      );
    });
    this.socket.on('chat', (data: { userName: string; message: string }) => {
      console.log(this.timers, 'timers');
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
    const platform = new Platform(platformDiv, this.socket);
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

  //监听用户的wasd输入
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
}



//platform
class Platform {
  constructor(platformDiv, socket) {

    this.socket = socket;

    this.container;
    this.player = {};
    this.animations = {};
    this.stats;
    this.controls;
    this.camera;
    this.cameras;
    this.scene;
    this.renderer;
    this.actionAnimation;
    this.remoteData;
    this.remotePlayers = {};
    this.remoteColliders;
    this.speechBubbles = {};
    //初始化div
    this.container = document.createElement('div');
    this.container.style.width = '100%';
    this.container.style.height = window.innerHeight * 0.9 + 'px';
    this.container.style.cursor = 'none';
    platformDiv.appendChild(this.container);

    const platform = this;
    //动画
    this.anims = ['Walking', 'Walking Backwards', 'Turn', 'Running', 'Pointing', 'Talking', 'Pointing Gesture'];
    this.clock = new THREE.Clock();

    //初始化
    this.init();
  }

  init() {
    //相机视角
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 10, 200000);
    this.camera.position.set(112, 100, 6000);
    //设置场景
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x00a0f0);
    //设置环境光
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

    //加载模型
    const loader = new FBXLoader();
    const platform = this;
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
      object.position.set(-500, 0, -2000);
      platform.scene.add(object);
      //设置用户的object就是这个形象
      platform.player.object = object;
      //设置动画
      platform.animations.Idle = object.animations[0];
      //设置下一个动画
      platform.loadNextAnim(loader);
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

    //加载地图
    this.loadEnvironment(loader);
    //设置渲染器
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight * 0.9);
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);



    // 设置远程位置同步
		this.socket.on('remoteData', function(data){
			// console.log("remoteData");
			// console.log(data);
			platform.remoteData = data;
      // 获取this.remotePlayers中的所有key
      var keys = Object.keys(platform.remotePlayers);
      var remoteNames = [];
      for (let i = 0; i < data.length; i++) {
        if (data[i].username == localStorage.getItem('role') + '-' + localStorage.getItem('username')) {
          continue;
        }
        remoteNames.push(data[i].username);
        platform.loadRemotePlayer(loader, data[i]);
      }
      // 删除多余的remotePlayers
      for (let i = 0; i < keys.length; i++) {
        if (remoteNames.indexOf(keys[i]) == -1) {
          platform.scene.remove(platform.remotePlayers[keys[i]].object);
          delete platform.remotePlayers[keys[i]];
        }
      }
      // console.log(remoteNames);
      // console.log(platform.remotePlayers)
      // console.log(platform.scene.children)
		});

  }

  loadRemotePlayer(loader, data) {
    var temp_player = {};
    const platform = this;
    // 处理初始位置的模型，存在bug
    if (data.x == -500 && data.y == 0 && data.z == -2000 && data.r == 0) {
      return;
    }
    // 检查是否remotePlayers是否已经存在，通过判断username
    if (this.remotePlayers[data.username]!=undefined && this.remotePlayers[data.username].hasOwnProperty('object')) {
      // 如果存在，就仅仅更新位置
      temp_player = this.remotePlayers[data.username];
      if(temp_player.object != null){
        console.log("exists:");
        console.log(temp_player);
        temp_player.object.position.set(data.x, data.y, data.z)
        temp_player.object.rotation.y = data.r;
        return;
      }
    }
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
        platform.scene.add(object);
        //设置用户的object就是这个形象
        temp_player.object = object;
      });
      this.remotePlayers[data.username] = temp_player;
  }

  //设置动画
  animate() {
    const dt = this.clock.getDelta();
    // console.log('animate');
    if (this.player.mixer !== undefined) this.player.mixer.update(dt);
    if (this.player.move !== false){

      this.movePlayer(this.player.forward,dt);
    }
    else{

    }
    //做一下相机的位置的线性插值
    if (this.player.cameras != undefined && this.player.cameras.active != undefined) {
      this.camera.position.lerp(this.player.cameras.active.getWorldPosition(new THREE.Vector3()), 0.05);
      const pos = this.player.object.position.clone();
      pos.y += 200;
      this.camera.lookAt(pos);
    }

    //确保太阳光的位置保证定向光线不断指向人物000
    if (this.sun != undefined) {
      this.sun.position.x = this.player.object.position.x;
      this.sun.position.y = this.player.object.position.y + 200;
      this.sun.position.z = this.player.object.position.z + 100;
      this.sun.target = this.player.object;
    }

    for (let name in this.speechBubbles) {
      this.speechBubbles[name].show(this.camera.position);
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
        platform.createCameras();
        delete platform.anims;
        platform.animate();
      }
    });
  }

  //get and set Action
  set action(name) {
    //设置一个动作
    const action = this.player.mixer.clipAction(this.animations[name]);
    action.time = 0.5;
    //停止所有动作
    this.player.mixer.stopAllAction();
    this.player.action = name;
    this.player.actionTime = Date.now();
    action.fadeIn(0);
    action.play();
  }

  get action() {
    //获取一个动作
    if (this.player === undefined || this.player.actionName === undefined) return "";
    return this.player.action;
  }

  //设置键盘带来的移动控制
  playerControl(forward) {
    if(forward=='w'){
      this.player.forward = 'w';
      this.player.move = true;
      if(this.actionAnimation!=='Walking'){
        window.platform.action = 'Walking'
        this.actionAnimation = 'Walking'
      }
    }
    if(forward=='stop'){
      this.player.forward = 'stop';
      this.player.move = false;
      if(this.actionAnimation!=='Idle'){
        window.platform.action = 'Idle'
        this.actionAnimation = 'Idle'
      }
    }
  }

  //设置鼠标带来的视角控制
  playerViewControl(dx,dy){
    dy = -dy;
    dx = -dx;
    this.player.object.rotation.y += dx * 0.002;
    this.player.object.rotation.y = Math.max(-Math.PI, Math.min(Math.PI, this.player.object.rotation.y));

    this.camera.rotation.x += dy * 0.002;
    this.camera.rotation.x = Math.max(-Math.PI, Math.min(Math.PI, this.camera.rotation.x));
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
    this.player.cameras = { front, back, wide, overhead, collect };
    //默认的相机是back
    platform.activeCamera = this.player.cameras.back;
    console.log(this.player.cameras.active,"this.player.cameras.active")
  }

  //移动角色
  movePlayer(direction,dt) {
    if(direction=='w'){
      this.player.object.translateZ(dt*400);
    }
    if(direction=='s'){
      this.player.object.translateZ(-dt*400);
    }
    if(direction=='a'){
      this.player.object.translateX(dt*400);
    }
    if(direction=='d'){
      this.player.object.translateX(-dt*400);
    }
    // 共享位置信息
    // console.log(this.player.object)
    this.socket.emit('move', {
      rolename: localStorage.getItem('roleName'),
      username: localStorage.getItem('role') + '-' + localStorage.getItem('username'),
      x: this.player.object.position.x,
      y: this.player.object.position.y,
      z: this.player.object.position.z,
      r: this.player.object.rotation.y
    });
  }

  //加载环境地图
  loadEnvironment(loader) {
    const platform = this;
    loader.load('assets/fbx/town.fbx', function (object) {
      platform.environment = object;
      platform.colliders = [];
      platform.scene.add(object);
      object.traverse(function (child) {
        if ( child.isMesh ) {
					if (child.name.startsWith("proxy")){
						platform.colliders.push(child);
						child.material.visible = false;
					}else{
						child.castShadow = true;
						child.receiveShadow = true;
					}
				}
			} );
      const tloader = new THREE.CubeTextureLoader();
			tloader.setPath( `assets/images/` );

			const textureCube = tloader.load( [
				'px.jpg', 'nx.jpg',
				'py.jpg', 'ny.jpg',
				'pz.jpg', 'nz.jpg'
			] );

			platform.scene.background = textureCube;

			platform.loadNextAnim(loader);
    });
  }
}

class SpeechBubble{
  constructor(game, msg, size=1){
    this.config = { font:'Calibri', size:24, padding:10, colour:'#222', width:256, height:256 };

    const planeGeometry = new THREE.PlaneGeometry(size, size);
    const planeMaterial = new THREE.MeshBasicMaterial()
    this.mesh = new THREE.Mesh(planeGeometry, planeMaterial);
    game.scene.add(this.mesh);

    const self = this;
    const loader = new THREE.TextureLoader();
    loader.load(
      // resource URL
      `assets/images/speech.png`,

      // onLoad callback
      function ( texture ) {
        // in this example we create the material when the texture is loaded
        self.img = texture.image;
        self.mesh.material.map = texture;
        self.mesh.material.transparent = true;
        self.mesh.material.needsUpdate = true;
        if (msg!==undefined) self.update(msg);
      },

      // onProgress callback currently not supported
      undefined,

      // onError callback
      function ( err ) {
        console.error( 'An error happened.' );
      }
    );
  }

  update(msg){
    if (this.mesh===undefined) return;

    let context = this.context;

    if (this.mesh.userData.context===undefined){
      const canvas = this.createOffscreenCanvas(this.config.width, this.config.height);
      this.context = canvas.getContext('2d');
      context = this.context;
      context.font = `${this.config.size}pt ${this.config.font}`;
      context.fillStyle = this.config.colour;
      context.textAlign = 'center';
      this.mesh.material.map = new THREE.CanvasTexture(canvas);
    }

    const bg = this.img;
    console.log(bg,"bg")
    context.clearRect(0, 0, this.config.width, this.config.height);
    context.drawImage(bg, 0, 0,512,512, 0, 0, this.config.width, this.config.height);
    this.wrapText(msg, context);

    this.mesh.material.map.needsUpdate = true;
  }

  createOffscreenCanvas(w, h) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    return canvas;
  }

  wrapText(text, context){
    const words = text.split(' ');
    let line = '';
    const lines = [];
    const maxWidth = this.config.width - 2*this.config.padding;
    const lineHeight = this.config.size + 8;

    words.forEach( function(word){
      const testLine = `${line}${word} `;
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth) {
        lines.push(line);
        line = `${word} `;
      }else {
        line = testLine;
      }
    });

    if (line != '') lines.push(line);

    let y = (this.config.height - lines.length * lineHeight)/2;

    lines.forEach( function(line){
      context.fillText(line, 128, y);
      y += lineHeight;
    });
  }

  show(pos){
    if (this.mesh!==undefined && this.player!==undefined){
      this.mesh.position.set(this.player.object.position.x, this.player.object.position.y + 380, this.player.object.position.z);
      this.mesh.lookAt(pos);
    }
  }
}
