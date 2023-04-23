import * as THREE from 'three';
import {Object3D} from "three";
export type SelectPlayer = {
  mixer: THREE.AnimationMixer;
  root: THREE.Object3D;
  object: THREE.Object3D;
}

export type modes = {
  NONE: Symbol;
  PRELOAD: Symbol;
  INITIALISING:  Symbol;
  CREATING_LEVEL: Symbol;
  ACTIVE: Symbol;
  GAMEOVER: Symbol;
}

export type Animations = {
  [Idle:string]: THREE.AnimationClip;
}

export type remoteData = {
  id: number;
  x: number;
  y: number;
  z: number;
  pb: number;
  heading: number;
  action: string;

}

export type Cameras = {
  front: THREE.Object3D;
  back: THREE.Object3D;
  wide: THREE.Object3D;
  overhead: THREE.Object3D;
  collect: THREE.Object3D;
  chat: THREE.Object3D;
}

