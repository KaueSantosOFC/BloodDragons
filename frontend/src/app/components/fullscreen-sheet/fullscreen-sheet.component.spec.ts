import { TestBed, ComponentFixture } from '@angular/core/testing';
import { FullscreenSheetComponent } from './fullscreen-sheet.component';
import { CombatService } from '../../services/combat.service';
import { AuthService } from '../../services/auth.service';
import { DndMathService } from '../../services/dnd-math.service';
import { CampaignService } from '../../services/campaign.service';

describe('FullscreenSheetComponent', () => {
  let component: FullscreenSheetComponent;
  let fixture: ComponentFixture<FullscreenSheetComponent>;
  let combatService: CombatService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FullscreenSheetComponent],
      providers: [
        CombatService,
        AuthService,
        DndMathService,
        CampaignService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FullscreenSheetComponent);
    component = fixture.componentInstance;
    combatService = TestBed.inject(CombatService);
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve retornar a descrição do efeito de exaustão correta por nível', () => {
    expect(component.getExhaustionEffect(1)).toBe('Desvantagem em testes de habilidade');
    expect(component.getExhaustionEffect(3)).toBe('Desvantagem nas jogadas de ataque e salvaguardas');
    expect(component.getExhaustionEffect(6)).toBe('Morte');
    expect(component.getExhaustionEffect(0)).toBe('');
  });

  it('deve retornar valores padrão de rações e água caso indefinidos', () => {
    expect(component.currentRations()).toBe(4);
    expect(component.currentWater()).toBe(4);
  });
});
