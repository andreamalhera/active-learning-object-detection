import { TestBed, inject } from '@angular/core/testing';

import { CanvasConfigsService } from './canvas-configs.service';

describe('CanvasConfigsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CanvasConfigsService]
    });
  });

  it('should be created', inject([CanvasConfigsService], (service: CanvasConfigsService) => {
    expect(service).toBeTruthy();
  }));
});
