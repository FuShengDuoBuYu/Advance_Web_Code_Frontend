import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeUserinfoDialogComponent } from './change-userinfo-dialog.component';

describe('ChangeUserinfoDialogComponent', () => {
  let component: ChangeUserinfoDialogComponent;
  let fixture: ComponentFixture<ChangeUserinfoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChangeUserinfoDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangeUserinfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
