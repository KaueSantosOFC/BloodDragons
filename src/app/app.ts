import {ChangeDetectionStrategy, Component} from '@angular/core';
import {LayoutComponent} from './components/layout/layout.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [LayoutComponent],
  template: `<app-layout></app-layout>`,
})
export class App {}
