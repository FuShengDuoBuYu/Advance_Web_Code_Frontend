//@ts-nocheck
import { Component, ElementRef, ViewChild } from '@angular/core';
import { Animations, Cameras, modes, remoteData } from "../../type";
import * as THREE from 'three';
//如果报错,那么就从如下位置安装
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
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
    //@ts-ignore
    window.platform = platform;
    //@ts-ignore
    console.log(window.platform);
  }

  // 点击按钮后跳转到个人中心
  navigateToPersonalCenter() {
    window.location.href = '/personalCenter';
  }

  //点击按钮后修改动作
  toggleAnimation(){
    if (platform.action=="Idle"){
        platform.action = "Pointing Gesture";
    }else{
        platform.action = "Idle";
    }
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
    this.scene;
    this.renderer;
    //初始化div
    this.container = document.createElement('div');
    this.container.style.width = '100%';
    this.container.style.height = window.innerHeight * 0.9 + 'px';
    platformDiv.appendChild(this.container);

    const platform = this;
    //动画
    this.anims = ['Pointing Gesture'];
    this.clock = new THREE.Clock();

    //初始化
    this.init();

  }

  init() {
    //相机视角
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    this.camera.position.set(112, 100, 400);
    //设置场景
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xa0a0a0);
    this.scene.fog = new THREE.Fog(0xa0a0a0, 700, 1800);
    //设置半球光
    let light = new THREE.HemisphereLight(0xffffff, 0x444444);
    light.position.set(0, 200, 0);
    this.scene.add(light);
    //设置方向光
    light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0, 200, 100);
    light.castShadow = true;
    light.shadow.camera.top = 180;
    light.shadow.camera.bottom = -100;
    light.shadow.camera.left = -120;
    light.shadow.camera.right = 120;
    this.scene.add(light);

    //铺设一个地面
    let mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(4000, 4000), new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false }));
    mesh.rotation.x = - Math.PI / 2;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    //添加网格
    let grid = new THREE.GridHelper(4000, 60, 0x000000, 0x000000);
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    this.scene.add(grid);

    //加载模型
    const loader = new FBXLoader();
    const platform = this;
    loader.load(`assets/fbx/people/FireFighter.fbx`, function (object) {
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
      const texture = new THREE.TextureLoader().load(`assets/images/SimplePeople_FireFighter_White.png`, (texture) => {
        object.traverse(function (child) {
          if (child.isMesh) {
            child.material.map = texture;
            child.material.needsUpdate = true;
          }
        });
      });

      //加入这个模型
      platform.scene.add(object);
      //设置用户的object就是这个形象
      platform.player.object = object;
      //设置动画
      platform.animations.Idle = object.animations[0];
      //设置下一个动画
      platform.loadNextAnim(loader);
    });
    //设置渲染器
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight*0.9);
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);
    //这样可以围绕鼠标旋转
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 150, 0);
    this.controls.update();

    // window.addEventListener( 'resize', function(){ platform.onWindowResize(); }, false );
  }
  //设置动画
  animate() {
    const platform = this;
    const dt = this.clock.getDelta();

    requestAnimationFrame(function () { platform.animate(); });
    if (this.player.mixer !== undefined) this.player.mixer.update(dt);
    this.renderer.render(this.scene, this.camera);
  }

  loadNextAnim(loader) {
    let anim = this.anims.pop();
    const platform = this;
    loader.load(`assets/fbx/anims/${anim}.fbx`, function (object) {
      platform.animations[anim] = object.animations[0];
      if (platform.anims.length > 0) {
        platform.loadNextAnim(loader);
      } else {
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
    this.player.actionName = name;

    action.fadeIn(0.5);
    action.play();
  }

  get action() {
    //获取一个动作
    if (this.player === undefined || this.player.actionName === undefined) return "";
    return this.player.actionName;
  }

  
}

