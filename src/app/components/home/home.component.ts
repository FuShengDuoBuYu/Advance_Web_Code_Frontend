import {Component, ElementRef, ViewChild} from '@angular/core';
import {Animations, Cameras, modes, remoteData} from "../../type";
import * as THREE from 'three';
import {Object3D} from 'three';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader.js';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  @ViewChild('canvasEl')
  canvasEl!: ElementRef;
  modes: modes = {
    NONE:   Symbol("none"),
    PRELOAD: Symbol("preload"),
    INITIALISING:  Symbol("initialising"),
    CREATING_LEVEL: Symbol("creating_level"),
    ACTIVE: Symbol("active"),
    GAMEOVER: Symbol("gameover")
  }
  mode: Symbol = this.modes.NONE;
  container: HTMLElement;
  animations:Animations;
  assetsPath:string = 'assets/';
  scene: THREE.Scene = new THREE.Scene();
  sun: THREE.DirectionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
  player: PlayerLocal;
  remoteData: remoteData[] = [];
  anims: string[];
  clock: THREE.Clock;
  camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
  cameras: Cameras|undefined;
  renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
  environment: THREE.Object3D = new THREE.Object3D();
  colliders: Object3D[] = [];
  action:string = 'Walking';
  constructor() {
    this.container = document.createElement( 'div' );
    console.log(this.container)
    this.animations = {};
    this.container.style.height = '100%';
    document.body.appendChild( this.container );
    console.log(document.body)
    const game = this;
    this.anims= ['Walking', 'Walking Backwards', 'Turn', 'Running', 'Pointing', 'Talking', 'Pointing Gesture'];
    const options = {
      assets:[
        `${this.assetsPath}images/nx.jpg`,
        `${this.assetsPath}images/px.jpg`,
        `${this.assetsPath}images/ny.jpg`,
        `${this.assetsPath}images/py.jpg`,
        `${this.assetsPath}images/nz.jpg`,
        `${this.assetsPath}images/pz.jpg`
      ],
      oncomplete: function(){
        console.log('oncomplete')
        game.init();
      }
    }
    this.anims.forEach( function(anim){ options.assets.push(`${game.assetsPath}fbx/anims/${anim}.fbx`)});
    options.assets.push(`${game.assetsPath}fbx/town.fbx`);
    this.mode = this.modes.PRELOAD;
    this.clock = new THREE.Clock();
    this.player = new PlayerLocal(this,undefined);
    // const preloader = new Preloader(options);
    window.onerror = function (msg, url, lineNo, columnNo, error) {
      console.log(msg, url, lineNo, columnNo, error);
    }
    game.init();
  }

  set activeCamera(Object3D: object) {

  }

  ngAfterViewInit() {
    // const canvas = this.canvasEl.nativeElement;
    // const context = canvas.getContext('2d');
    //
    // //绘制一个矩形,黑色
    // context.fillStyle = 'black';
    // context.fillRect(0, 0, canvas.width, canvas.height);
    // console.log(window.localStorage.getItem('playerIndex'));
  }

  navigateToPersonalCenter() {
    window.location.href = '/personalCenter';
  }

  init(){
    this.mode = this.modes.INITIALISING;

    this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 10, 200000 );

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0x00a0f0 );

    const ambient = new THREE.AmbientLight( 0xaaaaaa );
    this.scene.add( ambient );

    const light = new THREE.DirectionalLight( 0xaaaaaa );
    light.position.set( 30, 100, 40 );
    light.target.position.set( 0, 0, 0 );

    light.castShadow = true;

    const lightSize = 500;
    light.shadow.camera.near = 1;
    light.shadow.camera.far = 500;
    light.shadow.camera.left = light.shadow.camera.bottom = -lightSize;
    light.shadow.camera.right = light.shadow.camera.top = lightSize;

    light.shadow.bias = 0.0039;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;

    this.sun = light;
    this.scene.add(light);

    // model
    const loader = new FBXLoader();
    const game = this;
    this.player = new PlayerLocal(this,undefined);
    this.loadEnvironment(loader);

    // this.speechBubble = new SpeechBubble(this, "", 150);
    // this.speechBubble.mesh.position.set(0, 350, 0);

    // this.joystick = new JoyStick({
    //   onMove: this.playerControl,
    //   game: this
    // });

    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild( this.renderer.domElement );

    // if ('ontouchstart' in window){
    //   window.addEventListener( 'touchdown', (event) => game.onMouseDown(event), false );
    // }else{
    //   window.addEventListener( 'mousedown', (event) => game.onMouseDown(event), false );
    // }

    window.addEventListener( 'resize', () => game.onWindowResize(), false );
  }

  createCameras(){
    const offset = new THREE.Vector3(0, 80, 0);
    const front = new THREE.Object3D();
    front.position.set(112, 100, 600);
    front.parent = this.player.object;
    const back = new THREE.Object3D();
    back.position.set(0, 300, -1050);
    back.parent = this.player.object;
    const chat = new THREE.Object3D();
    chat.position.set(0, 200, -450);
    chat.parent = this.player.object;
    const wide = new THREE.Object3D();
    wide.position.set(178, 139, 1665);
    wide.parent = this.player.object;
    const overhead = new THREE.Object3D();
    overhead.position.set(0, 400, 0);
    overhead.parent = this.player.object;
    const collect = new THREE.Object3D();
    collect.position.set(40, 82, 94);
    collect.parent = this.player.object;
    this.cameras = { front, back, wide, overhead, collect, chat };
    this.activeCamera = this.cameras.back;
  }

  loadEnvironment(loader: FBXLoader){
    const game = this;
    loader.load(`${this.assetsPath}fbx/town.fbx`, function(object){
      game.environment = object;
      game.colliders = [];
      game.scene.add(object);
      object.traverse( function ( child ) {
        // @ts-ignore
        if ( child.isMesh ) {
          if (child.name.startsWith("proxy")){
            game.colliders.push(child);
            // @ts-ignore
            child.material.visible = false;
          }else{
            child.castShadow = true;
            child.receiveShadow = true;
          }
        }
      } );

      const tloader = new THREE.CubeTextureLoader();
      tloader.setPath( `${game.assetsPath}/images/` );

      game.scene.background = tloader.load([
        'px.jpg', 'nx.jpg',
        'py.jpg', 'ny.jpg',
        'pz.jpg', 'nz.jpg'
      ]);
      console.log("load environment");
      game.loadNextAnim(loader);
    })
  }

  loadNextAnim(loader: FBXLoader){
    let anim = this.anims.pop();
    const game = this;
    loader.load( `${this.assetsPath}fbx/anims/${anim}.fbx`, function( object ){
      // @ts-ignore
      game.player.animations[anim] = object.animations[0];
      if (game.anims.length>0){
        game.loadNextAnim(loader);
      }else{
        // @ts-ignore
        delete game.anims;
        game.action = "Idle";
        game.mode = game.modes.ACTIVE;
        game.animate();
      }
    });
  }
  playerControl(forward:number, turn:number){
    turn = -turn;
    if (forward>0.3){
      if (this.player.action!='Walking' && this.player.action!='Running') this.player.action = 'Walking';
    }else if (forward<-0.3){
      if (this.player.action!='Walking Backwards') this.player.action = 'Walking Backwards';
    }else{
      forward = 0;
      if (Math.abs(turn)>0.1){
        if (this.player.action != 'Turn') this.player.action = 'Turn';
      }else if (this.player.action!="Idle"){
        this.player.action = 'Idle';
      }
    }

    if (forward==0 && turn==0){
      delete this.player.motion;
    }else{
      this.player.motion = { forward, turn };
    }

    // this.player.updateSocket();
  }

  showMessage(msg:string, fontSize=20, onOK=null){
    const txt = document.getElementById('message_text');
    // @ts-ignore
    txt.innerHTML = msg;
    // @ts-ignore
    txt.style.fontSize = fontSize + 'px';
    const btn = document.getElementById('message_ok');
    const panel = document.getElementById('message');
    const game = this;
    if (onOK!=null){
      // @ts-ignore
      btn.onclick = function(){
        // @ts-ignore
        panel.style.display = 'none';
        // @ts-ignore
        onOK.call(game);
      }
    }else{
      // @ts-ignore
      btn.onclick = function(){
        // @ts-ignore
        panel.style.display = 'none';
      }
    }
    // @ts-ignore
    panel.style.display = 'flex';
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( window.innerWidth, window.innerHeight );

  }

  animate() {
    const game = this;
    const dt = this.clock.getDelta();
    requestAnimationFrame( function(){ game.animate(); } );

    if (this.player.mixer!=undefined && this.mode==this.modes.ACTIVE) this.player.mixer.update(dt);

    if (this.player.action=='Walking'){
      const elapsedTime = Date.now() - this.player.actionTime;
      if (elapsedTime>1000 && this.player.motion.forward>0){
        this.player.action = 'Running';
      }
    }

    // if (this.player.motion !== undefined) this.player.move(dt);

    // if (this.cameras!=undefined && this.cameras.active!=undefined && this.player!==undefined && this.player.object!==undefined){
    //   this.camera.position.lerp(this.cameras.active.getWorldPosition(new THREE.Vector3()), 0.05);
    //   const pos = this.player.object.position.clone();
    //   if (this.cameras.active==this.cameras.chat){
    //     pos.y += 200;
    //   }else{
    //     pos.y += 300;
    //   }
    //   this.camera.lookAt(pos);
    // }

    if (this.sun !== undefined){
      this.sun.position.copy( this.camera.position );
      this.sun.position.y += 10;
    }

    // if (this.speechBubble!==undefined) this.speechBubble.show(this.camera.position);

    this.renderer.render( this.scene, this.camera );
  }

}



class Player{
  local:boolean;
  model:string;
  colour:string;
  animations: Animations;
  options: any;
  id: any;
  game: HomeComponent;
  mixer: THREE.AnimationMixer = new THREE.AnimationMixer(new THREE.Object3D());
  root: THREE.Object3D = new THREE.Object3D();
  object: THREE.Object3D = new THREE.Object3D();
  collider: THREE.Mesh = new THREE.Mesh();
  actionName: string = '';
  actionTime: number = 0;
  motion: any;
  constructor(game: HomeComponent,options:any){
    this.local = true;
    let model:string,colour:string;
    const colours = ['Black', 'Brown', 'White'];
    colour = colours[Math.floor(Math.random() * colours.length)];
    // if (options && typeof options === undefined){
    //   const people = ['BeachBabe', 'BusinessMan', 'Doctor', 'FireFighter', 'Housewife', 'Policeman', 'Prostitute', 'Punk', 'RiotCop', 'Roadworker', 'Robber', 'Sheriff', 'Streetman', 'Waitress'];
    //   model = people[Math.floor(Math.random()*people.length)];
    // }else if (typeof options =='object'){
    //   this.local = false;
    //   this.options = options;
    //   this.id = options.id;
    //   model = options.model;
    //   colour = options.colour;
    // }else{
    //   model = options;
    // }
    const people = ['BeachBabe', 'BusinessMan', 'Doctor', 'FireFighter', 'Housewife', 'Policeman', 'Prostitute', 'Punk', 'RiotCop', 'Roadworker', 'Robber', 'Sheriff', 'Streetman', 'Waitress'];
    model = people[Math.floor(Math.random()*people.length)];
    this.model = model;
    this.colour = colour;
    this.game = game;

    this.animations = this.game.animations;
    const loader = new FBXLoader();
    const player = this;
    console.log("model")
    console.log(model);
    loader.load(`${game.assetsPath}fbx/people/${model}.fbx`, (object) => {
        let mixer = new THREE.AnimationMixer( object );
        player.root = object;
        player.mixer = mixer;
        object.name = "Person";
        object.traverse( function ( child ) {
          // @ts-ignore
          if ( child.isMesh ) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(`${game.assetsPath}images/SimplePeople_${model}_${colour}.png`, function ( texture ) {
          object.traverse( function ( child ) {
            // @ts-ignore
            if ( child.isMesh ) {
              // @ts-ignore
              child.material.map = texture;
            }
          });
      });

      player.object = new THREE.Object3D();
      player.object.position.set(3122, 0, -173);
      player.object.rotation.set(0, 2.6, 0);
      player.object.add(object);
      player.game.scene.add(player.object);
      // if (player.deleted === undefined){
      //
      // }

      if (player.local){
        game.createCameras();
        game.sun.target = game.player.object;
        game.animations['Idle'] = object.animations[0];
        // if (player.initSocket!==undefined) player.initSocket();
      }else{
        const geometry = new THREE.BoxGeometry(100,300,100);
        const material = new THREE.MeshBasicMaterial({visible:false});
        const box = new THREE.Mesh(geometry, material);
        box.name = "Collider";
        box.position.set(0, 150, 0);
        player.object.add(box);
        player.collider = box;
        // player.object.userData.id = player.id;
        // player.object.userData.remotePlayer = true;
        // const players = game.initialisingPlayers.splice(game.initialisingPlayers.indexOf(this), 1);
        // game.remotePlayers.push(players[0]);
      }

      if (game.animations['Idle']!==undefined) player.action = "Idle";

    });
  }

  set action(name:string){
    //Make a copy of the clip if this is a remote player
    if (this.actionName == name) return;
    console.log(this.animations[name], name)
    const clip = (this.local) ? this.animations[name] : THREE.AnimationClip.parse(THREE.AnimationClip.toJSON(this.animations[name]));
    const action = this.mixer.clipAction( clip );
    action.time = 0;
    this.mixer.stopAllAction();
    this.actionName = name;
    this.actionTime = Date.now();
    action.fadeIn(0.5);
    // action.play();
  }

  get action(){
    return this.actionName;
  }

  update(dt:number){
    this.mixer.update(dt);

    if (this.game.remoteData.length>0){
      let found = false;
      for(let data of this.game.remoteData){
        if (data.id != this.id) continue;
        //Found the player
        this.object.position.set( data.x, data.y, data.z );
        const euler = new THREE.Euler(data.pb, data.heading, data.pb);
        this.object.quaternion.setFromEuler( euler );
        this.action = data.action;
        found = true;
      }
      // if (!found) this.game.removePlayer(this);
    }
  }
}

class PlayerLocal extends Player{
    socket: any;
    constructor(game: HomeComponent,options:any) {
      super(game,options);
    }
}

