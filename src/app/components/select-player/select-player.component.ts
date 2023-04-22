import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
@Component({
  selector: 'app-select-player',
  templateUrl: './select-player.component.html',
  styleUrls: ['./select-player.component.css']
})
export class SelectPlayerComponent implements OnInit {


  @ViewChild('virtual_player') three:ElementRef = new ElementRef(null);
  private renderer:any = new THREE.WebGLRenderer();
  private width = window.innerWidth*0.4;
  private height = window.innerHeight * 0.9;
  private scene:THREE.Scene = new THREE.Scene();
  private currentPlayerName:string = 'LiLa';
  private camera:THREE.PerspectiveCamera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 1000);
  //各个模型的url

  public players = [
    {
      "name": "Lila",
      "url": "assets/source/Lila.FBX",
      "description": "A 3D model of a female character, no specific profession or role mentioned.",
      "image": "assets/images/SimplePeople_Lila_Brown.png"
    },
    {
      "name": "BeachBabe",
      "url": "assets/fbx/people/BeachBabe.fbx",
      "description": "A 3D model of a young woman wearing a bikini, likely intended for beach or summer-themed visualizations.",
      "image": "assets/images/SimplePeople_BeachBabe_Brown.png"
    },
    {
      "name": "BusinessMan",
      "url": "assets/fbx/people/BusinessMan.fbx",
      "description": "A 3D model of a male executive, likely intended for business-related visualizations.",
      "image": "assets/images/SimplePeople_BusinessMan_Brown.png"
    },
    {
      "name": "Doctor",
      "url": "assets/fbx/people/Doctor.fbx",
      "description": "A 3D model of a male doctor in scrubs, likely intended for medical-related visualizations.",
      "image": "assets/images/SimplePeople_Doctor_Brown.png"
    },
    {
      "name": "FireFighter",
      "url": "assets/fbx/people/FireFighter.fbx",
      "description": "A 3D model of a male firefighter in full gear, likely intended for emergency response or fire simulation visualizations.",
      "image": "assets/images/SimplePeople_FireFighter_Brown.png"
    },
    {
      "name": "Housewife",
      "url": "assets/fbx/people/Housewife.fbx",
      "description": "A 3D model of a female character, likely intended for domestic or household-themed visualizations.",
      "image": "assets/images/SimplePeople_HouseWife_Brown.png"
    },
    {
      "name": "PoliceMan",
      "url": "assets/fbx/people/Policeman.fbx",
      "description": "A 3D model of a male police officer in uniform, likely intended for law enforcement or crime simulation visualizations.",
      "image": "assets/images/SimplePeople_Policeman_Brown.png"
    },
    {
      "name": "Prostitute",
      "url": "assets/fbx/people/Prostitute.fbx",
      "description": "A 3D model of a female character, likely intended for adult-themed visualizations. Note that the use of this term may be considered derogatory or offensive by some.",
      "image": "assets/images/SimplePeople_Prostitute_Brown.png"
    },
    {
      "name": "Punk",
      "url": "assets/fbx/people/Punk.fbx",
      "description": "A 3D model of a male punk rocker, likely intended for music-related visualizations.",
      "image": "assets/images/SimplePeople_Punk_Brown.png"
    },
    {
      "name": "RiotCop",
      "url": "assets/fbx/people/RiotCop.fbx",
      "description": "A 3D model of a male police officer in riot gear, likely intended for riot or protest simulation visualizations.",
      "image": "assets/images/SimplePeople_RiotCop_Brown.png"
    },
    {
      "name": "RoadWorker",
      "url": "assets/fbx/people/RoadWorker.fbx",
      "description": "A 3D model of a male road worker in safety gear, likely intended for construction or infrastructure-related visualizations.",
      "image": "assets/images/SimplePeople_Roadworker_Brown.png"
    },
    {
      "name": "Robber",
      "url": "assets/fbx/people/Robber.fbx",
      "description": "A 3D model of a male criminal in a black ski mask, likely intended for crime or heist simulation visualizations.",
      "image": "assets/images/SimplePeople_Robber_Brown.png"
    },
    {
      "name": "Sheriff",
      "url": "assets/fbx/people/Sheriff.fbx",
      "description": "A 3D model of a male sheriff in western-style attire, likely intended for western or cowboy-themed visualizations.",
      "image": "assets/images/SimplePeople_Sheriff_Brown.png"
    },
    {
      "name": "Streetman",
      "url": "assets/fbx/people/Streetman.fbx",
      "description": "A 3D model of a male character dressed in streetwear, no specific profession or role mentioned.",
      "image": "assets/images/SimplePeople_StreetMan_Brown.png"
    },
    {
      "name": "Waitress",
      "url": "assets/fbx/people/Waitress.fbx",
      "description": "A 3D model of a female waitress in uniform, likely intended for food or restaurant-related visualizations.",
      "image": "assets/images/SimplePeople_Waitress_Brown.png"
    }
  ]

  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  ngAfterViewInit() {

    //创建背景
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0xFFFFFF);

    //绑定DOM
    this.three.nativeElement.append(this.renderer.domElement);

    //创建一个具有透视效果的摄像机
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 1000)

    //设置摄像机的位置，并对准场景中心
    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = 100;
    this.camera.lookAt(this.scene.position)

    //导入fbx模型
    const loader = new FBXLoader();
    loader.load('assets/source/Lila.FBX', (object:THREE.Object3D) => {
        console.log(object);
        object.scale.set(0.5, 0.5, 0.5);
        object.name=this.currentPlayerName;
        this.scene.add(object);
        //渲染
        this.renderer.render(this.scene, this.camera)
    }
    );
  }

  //渲染模型
  renderPlayer(playerIndex:number){
    //清除sence之前的Object
    let obj:any = this.scene.getObjectByName(this.currentPlayerName);
    this.scene.remove(obj);

    //导入fbx模型并贴图
    const loader = new FBXLoader();
    loader.load(this.players[playerIndex].url, (object:THREE.Object3D) => {
        this.currentPlayerName = this.players[playerIndex].name;
        object.name=this.currentPlayerName;
        object.scale.set(0.1, 0.1, 0.1);
        
        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
              const textureLoader = new THREE.TextureLoader();
              const texture = textureLoader.load(this.players[playerIndex].image,
                (texture) => {
                  const material = new THREE.MeshBasicMaterial({ map: texture });
                  child.material = material;
                  this.renderer.render(this.scene, this.camera)
              },
              // 加载失败的回调函数
              (xhr) => {
                  console.error("Texture loading error:", xhr);
              });
              const material = new THREE.MeshBasicMaterial({map: texture});
              child.material = material; // 将材质应用于子网格对象
          }
        });

        this.scene.add(object);
        //渲染
        this.renderer.render(this.scene, this.camera)
    }
    );
  }

  selectPlayer(playerIndex:number) {
    this.renderPlayer(playerIndex);
  }

  // 用户确定选中角色
  comfirmPlayer() {
    window.localStorage.setItem('player', this.currentPlayerName);
    window.location.href = '/home';
  }
}
