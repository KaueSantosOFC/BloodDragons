import { TestBed } from '@angular/core/testing';
import { DndMathService } from './dnd-math.service';

describe('DndMathService - Cálculos Base (D&D 5e)', () => {
  let service: DndMathService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DndMathService);
  });

  it('deve calcular o Modificador de Atributo baseado nas regras oficiais', () => {
    // Math.floor((Score - 10) / 2)
    expect(service.calculateModifier(1)).toBe(-5);
    expect(service.calculateModifier(8)).toBe(-1);
    expect(service.calculateModifier(10)).toBe(0);
    expect(service.calculateModifier(11)).toBe(0);
    expect(service.calculateModifier(12)).toBe(1);
    expect(service.calculateModifier(15)).toBe(2);
    expect(service.calculateModifier(16)).toBe(3);
    expect(service.calculateModifier(20)).toBe(5);
    expect(service.calculateModifier(30)).toBe(10);
  });

  it('deve calcular o Bónus de Proficiência com base no nível (Math.ceil(level / 4) + 1)', () => {
    // Minimum lvl scenario
    expect(service.calculateProficiencyBonus(0)).toBe(2);
    
    // Tiers according to PHB
    expect(service.calculateProficiencyBonus(1)).toBe(2);
    expect(service.calculateProficiencyBonus(4)).toBe(2);
    
    expect(service.calculateProficiencyBonus(5)).toBe(3);
    expect(service.calculateProficiencyBonus(8)).toBe(3);
    
    expect(service.calculateProficiencyBonus(9)).toBe(4);
    expect(service.calculateProficiencyBonus(12)).toBe(4);
    
    expect(service.calculateProficiencyBonus(13)).toBe(5);
    expect(service.calculateProficiencyBonus(16)).toBe(5);
    
    expect(service.calculateProficiencyBonus(17)).toBe(6);
    expect(service.calculateProficiencyBonus(20)).toBe(6);
  });

  it('deve calcular os Pontos de Vida corretamente - Lvl 1: Dado Max + Mod. Con', () => {
    // 1D8 + 3 (CON mod is +3)
    const hp = service.calculateMaxHpGain(8, 3, true, false);
    expect(hp).toBe(11); // 8 + 3 = 11

    // Weak constitution edge case (Min 1)
    const hpWeak = service.calculateMaxHpGain(6, -6, true, false);
    expect(hpWeak).toBe(1);
  });

  it('deve calcular os Pontos de Vida (Subsequente Médio arredondado p/ cima) corretamente', () => {
    // HitDie 8 (avg 4.5 -> 5) + Mod Con 2 => 5 + 2 = 7
    const hpd8 = service.calculateMaxHpGain(8, 2, false, false);
    expect(hpd8).toBe(7);

    // HitDie 10 (avg 5.5 -> 6) + Mod Con 3 => 6 + 3 = 9
    const hpd10 = service.calculateMaxHpGain(10, 3, false, false);
    expect(hpd10).toBe(9);

    // HitDie 6 (avg 3.5 -> 4) + Mod Con -1 => 4 - 1 = 3
    const hpd6 = service.calculateMaxHpGain(6, -1, false, false);
    expect(hpd6).toBe(3);
  });

  it('deve calcular HP somado correto até do nível do jogador (Teórico)', () => {
    const fighterHp = service.calculateTotalMaxHp(3, 10, 14);
    expect(fighterHp).toBe(28);

    const wizardHp = service.calculateTotalMaxHp(5, 6, 10);
    expect(wizardHp).toBe(22);
  });

  it('deve calcular CA: Unarmored (10 + Dex)', () => {
     // DEX 14 (+2)
     const ac = service.calculateArmorClass(14, 10, 10, { armorType: 'none', hasShield: false });
     expect(ac).toBe(12);
  });

  it('deve calcular CA: Light Armor (Base + Dex)', () => {
     // DEX 16 (+3), Leather Armor (Base 11)
     const ac = service.calculateArmorClass(16, 10, 10, { armorBaseAc: 11, armorType: 'light', hasShield: false });
     expect(ac).toBe(14); // 11 + 3
  });

  it('deve calcular CA: Medium Armor (Base + Dex máx 2)', () => {
     // DEX 18 (+4), Hide Armor (Base 12) => O Modificador deve ser capado em +2
     const ac = service.calculateArmorClass(18, 10, 10, { armorBaseAc: 12, armorType: 'medium', hasShield: false });
     expect(ac).toBe(14); // 12 + 2 = 14
  });

  it('deve calcular CA: Medium Armor MAster (Base + Dex máx 3)', () => {
     // DEX 18 (+4), Medium Armor Master (máx 3), Hide Armor (12)
     const ac = service.calculateArmorClass(18, 10, 10, { armorBaseAc: 12, armorType: 'medium', hasMediumArmorMaster: true, hasShield: false });
     expect(ac).toBe(15); // 12 + 3 = 15
  });

  it('deve calcular CA: Heavy Armor ignorando o modificador de destreza positivo e negativo', () => {
     // DEX 8 (-1), Plate Armor (Base 18)
     const acNeg = service.calculateArmorClass(8, 10, 10, { armorBaseAc: 18, armorType: 'heavy', hasShield: false });
     expect(acNeg).toBe(18); // 18 + 0

     // DEX 20 (+5), Chain Mail (Base 16)
     const acPos = service.calculateArmorClass(20, 10, 10, { armorBaseAc: 16, armorType: 'heavy', hasShield: false });
     expect(acPos).toBe(16); // 16 + 0
  });

  it('deve calcular CA: Defesa Natural de Bárbaro', () => {
     const ac = service.calculateArmorClass(14, 16, 10, { armorType: 'none', hasShield: false, unarmoredDefenseClass: 'barbarian' });
     expect(ac).toBe(15); // 10 + 2 (Dex) + 3 (Con)
  });

  it('deve calcular CA: Defesa Natural de Monge', () => {
     const ac = service.calculateArmorClass(16, 10, 16, { armorType: 'none', hasShield: false, unarmoredDefenseClass: 'monk' });
     expect(ac).toBe(16); // 10 + 3 (Dex) + 3 (Wis)
  });

  it('deve anular a Defesa Natural de Monge se equipar escudo e regressar à CA básica 10 + DEX', () => {
     const ac = service.calculateArmorClass(16, 10, 18, { armorType: 'none', hasShield: true, unarmoredDefenseClass: 'monk' });
     // Basic Unarmored = 10 + 3 (Dex) = 13
     // Adds Shield (+2) = 15. The Wisdom is ignored because monks drop defense when holding shield!
     expect(ac).toBe(15); 
  });

  it('Bárbaros podem usar escudo juntamente com Unarmored defense', () => {
     const ac = service.calculateArmorClass(14, 16, 10, { armorType: 'none', hasShield: true, unarmoredDefenseClass: 'barbarian' });
     // 10 + 2 (Dex) + 3 (Con) + 2 (Shield) = 17
     expect(ac).toBe(17);
  });
});
