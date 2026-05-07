import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {LayoutComponent} from './components/layout/layout.component';
import {LobbyComponent} from './components/lobby/lobby.component';
import {CampaignService} from './services/campaign.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [LayoutComponent, LobbyComponent],
  template: `
    @if (campaignService.activeCampaign()) {
      <app-layout></app-layout>
    } @else {
      <app-lobby></app-lobby>
    }
  `,
})
export class App {
  campaignService = inject(CampaignService);
}
