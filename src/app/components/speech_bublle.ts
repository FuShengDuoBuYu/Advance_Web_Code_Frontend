//@ts-nocheck
import * as THREE from 'three';
export class SpeechBubble{
  constructor(game, msg, size=1,type="text",height = 380){
    this.config = { font:'Calibri', size:24, padding:10, colour:'#222', width:256, height:256 };

    const planeGeometry = new THREE.PlaneGeometry(size, size);
    const planeMaterial = new THREE.MeshBasicMaterial()
    this.mesh = new THREE.Mesh(planeGeometry, planeMaterial);
    game.scene.add(this.mesh);
    this.height = height;
    const self = this;
    const loader = new THREE.TextureLoader();
    loader.load(
      // resource URL
      `assets/images/speech.png`,

      // onLoad callback
      function ( texture ) {
        // in this example we create the material when the texture is loaded
        self.img = texture.image;
        self.mesh.material.map = texture;
        self.mesh.material.transparent = true;
        self.mesh.material.needsUpdate = true;
        if (msg!==undefined) self.update(msg,type);
      },

      // onProgress callback currently not supported
      undefined,

      // onError callback
      function ( err ) {
        console.error( 'An error happened.' );
      }
    );
  }

  update(msg,type){
    console.log(type);
    if (this.mesh===undefined) return;

    let context = this.context;

    if (this.mesh.userData.context===undefined){
      const canvas = this.createOffscreenCanvas(this.config.width, this.config.height);
      this.context = canvas.getContext('2d');
      context = this.context;
      context.font = `${this.config.size}pt ${this.config.font}`;
      context.fillStyle = this.config.colour;
      context.textAlign = 'center';
      this.mesh.material.map = new THREE.CanvasTexture(canvas);
    }

    const bg = this.img;
    if (bg===undefined) return;
    context.clearRect(0, 0, this.config.width, this.config.height);
    context.drawImage(bg, 0, 0,512,512, 0, 0, this.config.width, this.config.height);
    if(type=="text") this.wrapText(msg, context);
    //将base64转为ImageBitmap


    if(type=="image"){
      const img = new Image();
      img.src = msg;
      let that = this;
      img.onload = function(){
        context.drawImage(img, 0, 0,512,512, 0, 0, that.config.width, that.config.height);
      }
    }

    this.mesh.material.map.needsUpdate = true;
  }

  createOffscreenCanvas(w, h) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    return canvas;
  }

  wrapText(text, context){
    const words = text.split(' ');
    let line = '';
    const lines = [];
    const maxWidth = this.config.width - 2*this.config.padding;
    const lineHeight = this.config.size + 8;

    words.forEach( function(word){
      const testLine = `${line}${word} `;
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth) {
        lines.push(line);
        line = `${word} `;
      }else {
        line = testLine;
      }
    });

    if (line != '') lines.push(line);

    let y = (this.config.height - lines.length * lineHeight)/2;

    lines.forEach( function(line){
      context.fillText(line, 128, y);
      y += lineHeight;
    });
  }

  show(pos){
    if (this.mesh!==undefined && this.player!==undefined){
      this.mesh.position.set(this.player.object.position.x, this.player.object.position.y + this.height, this.player.object.position.z);
      this.mesh.lookAt(pos);
    }
  }
}
