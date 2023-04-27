//@ts-nocheck
import { Component } from '@angular/core';
import * as THREE from 'three';
//如果报错,那么就从如下位置安装
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  //当页面view加载完成后，执行ngAfterViewInit方法
  ngAfterViewInit() {
    const platformDiv = document.getElementById('platform');
    const platform = new Platform(platformDiv);
    window.platform = platform;
    this.playerMove(platform);
    this.playerView(platform);
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
  constructor(platformDiv) {

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
    this.camera.position.set(112, 100, 600);
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
    //加载地图
    this.loadEnvironment(loader);
    //设置渲染器
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight * 0.9);
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);
  }
  //设置动画
  animate() {
    const dt = this.clock.getDelta();
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

    //确保太阳光的位置保证定向光线不断指向人物
    if (this.sun != undefined) {
      this.sun.position.x = this.player.object.position.x;
      this.sun.position.y = this.player.object.position.y + 200;
      this.sun.position.z = this.player.object.position.z + 100;
      this.sun.target = this.player.object;
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