import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  @ViewChild('canvasEl')
  canvasEl!: ElementRef;
  ngAfterViewInit() {
    const canvas = this.canvasEl.nativeElement;
    const context = canvas.getContext('2d');
  
    //绘制一个矩形,黑色
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  navigateToPersonalCenter() {
    window.location.href = '/personalCenter';
  }
}
