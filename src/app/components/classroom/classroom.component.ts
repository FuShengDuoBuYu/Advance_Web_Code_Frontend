//@ts-nocheck
import { Component } from '@angular/core';
import * as THREE from 'three';
import {Vector2} from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { JoyStick} from "./lib"
@Component({
  selector: 'app-classroom',
  templateUrl: './classroom.component.html',
  styleUrls: ['./classroom.component.css']
})
export class ClassroomComponent {
    constructor() {
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
      //动画
      const platform = this;
      this.anims = ['Walking', 'Walking Backwards', 'Turn', 'Running', 'Pointing', 'Talking', 'Pointing Gesture'];
      this.clock = new THREE.Clock();

    }
  ngAfterViewInit() {
    this.init();
    this.render();
  }

  init() {
    const platformDiv = document.getElementById('platform');
    this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 100, 200000 );
    this.camera.position.set( 500, 600, 600 );
    this.camera.lookAt( 0, 0, 0 );

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

    //
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
      object.position.set(300, 0, 300);
      object.scale.set(platform.scale, platform.scale, platform.scale);
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
    this.cubeMaterial = new THREE.MeshLambertMaterial( { color: 0xfeb74c, map: new THREE.TextureLoader().load( '/assets/textures/square-outline-textured.png' ) } );

    // grid

    const gridHelper = new THREE.GridHelper( 1000, 20 );
    this.scene.add( gridHelper );
    //

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

    window.addEventListener( 'resize', this.onWindowResize );

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

          this.scene.remove( intersect.object );

          this.objects.splice( this.objects.indexOf( intersect.object ), 1 );

        }

        // create cube

      } else {

        const voxel = new THREE.Mesh( this.cubeGeo, this.cubeMaterial );
        voxel.position.copy( intersect.point ).add( intersect.face.normal );
        voxel.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
        this.scene.add( voxel );

        this.objects.push( voxel );

      }

      this.render();

    }

  }

  onDocumentKeyDown( event ) {

    switch ( event.keyCode ) {

      case 16: this.isShiftDown = true; break;

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

    requestAnimationFrame(function () { platform.animate(); });
    if (this.player.mixer !== undefined) this.player.mixer.update(dt);
    //角色从走动自动转换为跑动
    if (this.player.action == 'Walking') {
      const elapsedTime = Date.now() - this.player.actionTime;
      if (elapsedTime > 1000 && this.player.move.forward > 0) {
        this.action = 'Running';
      }
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

    this.renderer.render(this.scene, this.camera);
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
    const action = this.player.mixer.clipAction(this.animations[name]);
    action.time = 0;
    this.player.mixer.stopAllAction();
    this.player.action = name;
    this.player.actionTime = Date.now();

    action.fadeIn(0.5);
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
    this.player.cameras = { front, back, wide, overhead, collect };
    //默认的相机是back
    platform.activeCamera = this.player.cameras.back;
  }

  //移动角色
  movePlayer(dt) {
    if (this.player.move.forward > 0) {
      const speed = (this.player.action == 'Running') ? 400 : 150;
      this.player.object.translateZ(dt * speed* this.scale);
    } else {
      this.player.object.translateZ(-dt * 30);
    }
    if(this.player.object.position.z < -500 || this.player.object.position.z > 500 ||
      (this.player.object.position.z < 300 && this.player.object.position.z > -300 &&
      this.player.object.position.x < 150 && this.player.object.position.x > -150) ||
      this.player.object.position.x < -500 || this.player.object.position.x > 500
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
  }

}

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
    //设置控制器
    this.joystick = new JoyStick({
      onMove:this.playerControl,
      platform:this
    })
    //设置渲染器
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight * 0.9);
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);

  }
  //设置动画
  animate() {
    const platform = this;
    const dt = this.clock.getDelta();

    requestAnimationFrame(function () { platform.animate(); });
    if (this.player.mixer !== undefined) this.player.mixer.update(dt);
    //角色从走动自动转换为跑动
    if (this.player.action == 'Walking') {
      const elapsedTime = Date.now() - this.player.actionTime;
      if (elapsedTime > 1000 && this.player.move.forward > 0) {
        this.action = 'Running';
      }
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

    this.renderer.render(this.scene, this.camera);
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
    const action = this.player.mixer.clipAction(this.animations[name]);
    action.time = 0;
    this.player.mixer.stopAllAction();
    this.player.action = name;
    this.player.actionTime = Date.now();

    action.fadeIn(0.5);
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
    this.player.cameras = { front, back, wide, overhead, collect };
    //默认的相机是back
    platform.activeCamera = this.player.cameras.back;
  }

  //移动角色
  movePlayer(dt) {
    if (this.player.move.forward > 0) {
      const speed = (this.player.action == 'Running') ? 400 : 150;
      this.player.object.translateZ(dt * speed);
    } else {
      this.player.object.translateZ(-dt * 30);
    }
    console.log(this.player.object.position);
    this.player.object.rotateY(this.player.move.turn * dt);
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
