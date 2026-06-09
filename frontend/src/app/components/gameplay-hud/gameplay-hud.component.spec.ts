import { TestBed, ComponentFixture } from '@angular/core/testing';
import { GameplayHudComponent } from './gameplay-hud.component';
import { CombatService } from '../../services/combat.service';
import { AuthService } from '../../services/auth.service';
import { DndMathService } from '../../services/dnd-math.service';
import { CampaignService } from '../../services/campaign.service';

describe('GameplayHudComponent', () => {
  let component: GameplayHudComponent;
  let fixture: ComponentFixture<GameplayHudComponent>;
  let combatService: CombatService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameplayHudComponent],
      providers: [
        CombatService,
        AuthService,
        DndMathService,
        CampaignService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GameplayHudComponent);
    component = fixture.componentInstance;
    combatService = TestBed.inject(CombatService);
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve formatar o horário de forma correta', () => {
    combatService.currentHour.set(8);
    combatService.currentMinute.set(30);
    expect(component.formattedTime()).toBe('08:30');

    combatService.currentHour.set(20);
    combatService.currentMinute.set(0);
    expect(component.formattedTime()).toBe('20:00');
  });

  it('deve retornar o período do dia correto', () => {
    combatService.currentHour.set(7);
    expect(component.timePeriod()).toBe('Amanhecer');

    combatService.currentHour.set(10);
    expect(component.timePeriod()).toBe('Manhã');

    combatService.currentHour.set(15);
    expect(component.timePeriod()).toBe('Tarde');

    combatService.currentHour.set(18);
    expect(component.timePeriod()).toBe('Anoitecer');

    combatService.currentHour.set(22);
    expect(component.timePeriod()).toBe('Noite');

    combatService.currentHour.set(3);
    expect(component.timePeriod()).toBe('Madrugada');
  });

  it('deve retornar o ícone adequado para o período', () => {
    combatService.currentHour.set(12);
    expect(component.timeIcon()).toBe('wb_sunny');

    combatService.currentHour.set(23);
    expect(component.timeIcon()).toBe('nights_stay');
  });
});
