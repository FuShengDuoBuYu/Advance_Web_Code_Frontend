//@ts-nocheck
import { Component } from '@angular/core';
import * as THREE from 'three';
import {Vector2} from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
@Component({
  selector: 'app-classroom',
  templateUrl: './classroom.component.html',
  styleUrls: ['./classroom.component.css']
})
export class ClassroomComponent {
    constructor() {
      this.camera;
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
      this.init();
      this.render();
    }

  init() {

    this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
    this.camera.position.set( 500, 800, 1300 );
    this.camera.lookAt( 0, 0, 0 );

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0xf0f0f0 );

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
    const geometry = new THREE.PlaneGeometry( 1000, 1000 );
    geometry.rotateX( - Math.PI / 2 );

    this.plane = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { visible: true } ) );
    this.scene.add( this.plane );

    this.objects.push( this.plane );

    // lights

    const ambientLight = new THREE.AmbientLight( 0x606060 );
    this.scene.add( ambientLight );

    const directionalLight = new THREE.DirectionalLight( 0xffffff );
    directionalLight.position.set( 1, 0.75, 0.5 ).normalize();
    this.scene.add( directionalLight );

    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    // this.controls = new OrbitControls( this.camera, this.renderer.domElement );
    document.body.appendChild( this.renderer.domElement );

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
    console.log(this.pointer)
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
}
