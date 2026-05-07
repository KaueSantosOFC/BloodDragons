import { TestBed } from '@angular/core/testing';
import { DamageModalComponent } from './damage-modal.component';
import { DndMathService } from '../../services/dnd-math.service';
import { CombatService } from '../../services/combat.service';

describe('DamageModalComponent', () => {
  let component: DamageModalComponent;

  // Criando mocks manuais para as dependências cruciais
  const mockCombatService = {
    // Adicione propriedades do combat service usadas no modal se necessário.
    addNotification: vi.fn()
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DndMathService,
        { provide: CombatService, useValue: mockCombatService }
      ]
    });
    
    TestBed.runInInjectionContext(() => {
      component = new DamageModalComponent();
    });
  });

  describe('parseDamageString (Validação e Separação de Dados)', () => {
    it('deve extrair a quantidade e o tipo de dado corretamente no formato comum', () => {
      const result = component.parseDamageString('2d6');
      expect(result.diceCount).toBe(2);
      expect(result.diceType).toBe('d6');
      expect(result.modifier).toBe(0);
    });

    it('deve extrair corretamente quando houver modificador embutido para retrocompatibilidade', () => {
      // O sistema barra a entrada nova na ficha, mas a engine deve garantir parsing de strings velhas
      const result = component.parseDamageString('1d8+3');
      expect(result.diceCount).toBe(1);
      expect(result.diceType).toBe('d8');
      expect(result.modifier).toBe(3);
    });

    it('deve extrair a quantidade de dados sem prefixo sendo 1', () => {
      const result = component.parseDamageString('d10');
      expect(result.diceCount).toBe(1);
      expect(result.diceType).toBe('d10');
      expect(result.modifier).toBe(0);
    });

    it('deve suportar dano fixo perfeitamente (itens estáticos sem dados)', () => {
      const result = component.parseDamageString('5');
      expect(result.diceCount).toBe(0);
      expect(result.diceType).toBe('');
      expect(result.modifier).toBe(5);
    });

    it('deve suportar modificadores negativos', () => {
      const result = component.parseDamageString('1d4-1');
      expect(result.diceCount).toBe(1);
      expect(result.diceType).toBe('d4');
      expect(result.modifier).toBe(-1);
    });

    it('deve retornar zero default caso string seja puramente inválida', () => {
      const result = component.parseDamageString('inválido');
      expect(result.diceCount).toBe(0);
      expect(result.diceType).toBe('');
      expect(result.modifier).toBe(0);
    });

    it('deve ignorar espaços em branco extras e validar normalmente', () => {
      const result = component.parseDamageString(' 3 d 6 + 2 ');
      expect(result.diceCount).toBe(3);
      expect(result.diceType).toBe('d6');
      expect(result.modifier).toBe(2);
    });
  });
});
