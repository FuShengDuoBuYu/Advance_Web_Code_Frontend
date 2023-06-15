import * as THREE from 'three';
export type SelectPlayer = {
  mixer: THREE.AnimationMixer;
  root: THREE.Object3D;
  object: THREE.Object3D;
}

export type modes = {
  NONE: symbol;
  PRELOAD: symbol;
  INITIALISING:  symbol;
  CREATING_LEVEL: symbol;
  ACTIVE: symbol;
  GAMEOVER: symbol;
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

export type userInfo = {
  user_name: string;
  role: number;
  last_login_time: string;
  total_chat_times: number;
  last_chat_message: string;
  total_duration: number;
  avatar: string;
}
