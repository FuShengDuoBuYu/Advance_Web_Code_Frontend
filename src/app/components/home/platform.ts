//@ts-nocheck
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { GLTFLoader } from "node_modules/three/examples/jsm/loaders/GLTFLoader"
import { DRACOLoader } from "node_modules/three/examples/jsm/loaders/DRACOLoader"
import * as THREE from 'three';

export class Platform {
  constructor(platformDiv, socket, classroomDiv) {
    this.classroomDiv = classroomDiv;
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
      object.name = localStorage.getItem('roleName');
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
      object.position.set(3422, 0, -2053);
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
      x: 3422,
      y: 0,
      z: -2053,
      r: 0,
    });

    //加载地图
    this.loadEnvironment();
    //设置渲染器
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight * 0.9);
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);

    // 设置远程位置同步
		this.socket.on('remoteData', function(data){
			platform.remoteData = data;
      // 获取this.remotePlayers中的所有key
      var keys = Object.keys(platform.remotePlayers);
      var remoteNames = [];
      for (let i = 0; i < data.length; i++) {
        if (data[i].username == (localStorage.getItem('role') + '-' + localStorage.getItem('username'))) {
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
      platform.scene.add(object);
      //设置用户的object就是这个形象
      temp_player.object = object;
    });
  }

  //设置动画
  animate() {
    //设置本人和远程人物的走动或者静止动画
    const dt = this.clock.getDelta();
    if (this.player.mixer !== undefined) this.player.mixer.update(dt);
    for(let i in this.remotePlayers){
      if(this.remotePlayers[i].mixer !== undefined) this.remotePlayers[i].mixer.update(dt);
    }

    if (this.player.move !== false){
      this.movePlayer(this.player.forward,dt);
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

  setPlayerAction(player,name) {
    //设置动作
    const action = player.mixer.clipAction(this.animations[name]);
    action.time = 0.5;
    //停止所有动作
    player.mixer.stopAllAction();
    player.action = name;
    player.actionTime = Date.now();
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
        this.setPlayerAction(this.player,'Walking')
        this.actionAnimation = 'Walking'
      }
    }
    if(forward=='stop'){
      this.player.forward = 'stop';
      this.player.move = false;
      if(this.actionAnimation!=='Idle'){
        this.setPlayerAction(this.player,'Idle')
        this.actionAnimation = 'Idle'
      }
    }
  }

  //设置鼠标带来的视角控制
  playerViewControl(dx,dy){
    this.player.object.rotation.y -= dx * 0.002;
    this.camera.rotation.x -= dy * 0.002;
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
    //发生碰撞
    if(this.detectBorderCollisions(this.player.object.position)||this.detectBuildingCollisions(this.player.object.position)){
      console.log('碰撞了')
      return
    }
    //进入教学楼门口
    let gate = this.inBuildingGate(this.player.object.position)
    if(gate!=0){
      this.classroomDiv.style.display = 'block'
      //找到this.classroomDiv里面的id为teaching_building的元素
      let teach_building_title = this.classroomDiv.querySelector('#teach_building')
      //设置title
      teach_building_title.innerHTML = (gate==1?"第一教学楼":"第二教学楼")
    }
    else{
      this.classroomDiv.style.display = 'none'
    }
    if(direction=='w'){
      this.player.object.translateZ(dt*800);
    }
    // 共享位置信息
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
  loadEnvironment() {
    const platform = this;
    // 加载gltf模型
    let gltfLoader = new GLTFLoader();
    let dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('node_modules/three/examples/js/libs/draco/');
    gltfLoader.setDRACOLoader(dracoLoader);
    let ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    platform.scene.add(ambientLight);
    gltfLoader.load('assets/model/test.gltf', function (gltf) {
      gltf.scene.scale.set(100,100,100);
      gltf.scene.position.set(0,0,0);
      gltf.scene.traverse( function ( child ) {
        if ( child.isMesh ) {
          child.material.emissive =  child.material.color;
          child.material.emissiveMap = child.material.map ;
        }
      });
      platform.environment = gltf.scene;
      platform.colliders = [];
      platform.scene.add(gltf.scene);
    });    
  }

  //检测是否边框碰撞
  detectBorderCollisions(position) {
    //外部大边框(8100,0,-6500),(8100,0,3305),(-2150,0,-6500),(-2150,0,3305),需要在这个范围内，且设置为边界值
    return this.detectRectCollisions(position,-2150,-6500,8100,3305);
  }

  //检测是否教学楼碰撞
  detectBuildingCollisions(position) {
    //教学楼的边框
    //(-300,0,215),(-300,0,-5550),(3780,0,-5550),(3780,0,-4100),(1830,0,-4100),(1830,0,-1760),(6650,0,-1160),(6650,0,215)
    //将教学楼的边框分成三个矩形，分别检测
    let part1 = this.detectRectCollisions(position,-300,-5550,1830,230,false);
    let part2 = this.detectRectCollisions(position,1830,-5550,3780,-4100,false);
    let part3 = this.detectRectCollisions(position,1830,-1160,6650,230,false);
    return part1||part2||part3;
  }

  detectRectCollisions(position,minX,minZ,maxX,maxZ,ifIn=true){
    //检测是否在矩形内，但是用户需要在矩形内
    if(ifIn){
      if(position.x>maxX){
        position.x = maxX;
        return true;
      }
      if(position.x<minX){
        position.x = minX;
        return true;
      }
      if(position.z>maxZ){
        position.z = maxZ;
        return true;
      }
      if(position.z<minZ){
        position.z = minZ;
        return true;
      }
      return false;
    }
    //检测是否在矩形内，但是用户需要在矩形外
    else{
      if(position.x>minX&&position.x<maxX&&position.z>minZ&&position.z<maxZ){
        //检测穿越的是哪条边
        if(position.x-minX<30){
          position.x = minX;
        }
        if(maxX-position.x<30){
          position.x = maxX;
        }
        if(position.z-minZ<30){
          position.z = minZ;
        }
        if(maxZ-position.z<30){
          position.z = maxZ;
        }
        return true;
      }
      return false;
    }
  }
  //检测是否在教学楼门口
  inBuildingGate(position){
    //第一教学楼门口(1820,0,-1620),(1820,0,-2200),(2400,0,-2200),(2400,0,-1620)
    if(position.x>1820&&position.x<2400&&position.z>-2200&&position.z<-1620){
      return 1;
    }
    //第二教学楼门口(-300,0,-4400),(-300,0,-2950),(-650,0,-2950),(-650,0,-4400)
    if(position.x>-650&&position.x<-300&&position.z>-4400&&position.z<-2950){
      return 2;
    }
    return 0;
  }
}