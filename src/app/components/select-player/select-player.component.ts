import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three-orbitcontrols-ts';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import {SelectPlayer} from "../../type";

@Component({
  selector: 'app-select-player',
  templateUrl: './select-player.component.html',
  styleUrls: ['./select-player.component.css']
})
export class SelectPlayerComponent implements OnInit{

  @ViewChild('Three') three:ElementRef = new ElementRef(null);
  private renderer:any = new THREE.WebGLRenderer();
  private width:number = 500;
  private height:number = 500;
  private scene:THREE.Scene = new THREE.Scene();
  private camera:THREE.PerspectiveCamera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 1000);

  ngOnInit() {
    console.log(this.three);

  }

  ngAfterViewInit() {
    console.log(this.three);
    // this.width = this.three.nativeElement.offsetWidth;

    //创建背景
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0xFFFFFF);

    //绑定DOM
    this.three.nativeElement.append(this.renderer.domElement);

    // //创建一个具有透视效果的摄像机
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 1000)

    //设置摄像机的位置，并对准场景中心
    this.camera.position.x = 10
    this.camera.position.y = 10
    this.camera.position.z = 30
    this.camera.lookAt(this.scene.position)

    //创建一个长宽高均为4个单位的正方体
    const cubeGeometry:THREE.BoxGeometry = new THREE.BoxGeometry(4, 4, 4)

    //创建材质
    const cubMaterial:THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000
    })

    //创建一个Mesh，将材质包裹到立方体上
    var cube = new THREE.Mesh(cubeGeometry, cubMaterial)
    cube.name = '弟弟'

    //设置立方体的位置
    cube.position.x = 0
    cube.position.y = 0
    cube.position.z = 0

    this.scene.add(cube)

    //导入fbx模型
    const loader = new FBXLoader();
    loader.load('assets/source/Lila.FBX', (object:THREE.Object3D) => {
        console.log(object);
        // set model color
        object.traverse((child:THREE.Object3D) => {
            if (child instanceof THREE.Mesh) {
                child.material = new THREE.MeshBasicMaterial({color: 0xff0000});
            }
        })
        this.scene.add(object);

        // this.scene.add(object.children[0].clone());
    }
    );

    //渲染
    this.renderer.render(this.scene, this.camera)
  }
}
