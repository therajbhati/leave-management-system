import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageLeaves } from './manage-leaves';

describe('ManageLeaves', () => {
  let component: ManageLeaves;
  let fixture: ComponentFixture<ManageLeaves>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageLeaves]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageLeaves);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
