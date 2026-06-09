package com.blooddragons.service;

import com.blooddragons.model.dto.ActionResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class DmgRulesServiceTest {

    private DmgRulesService service;
    private DndCoreEngineService engine;
    private DndMathService math;

    @BeforeEach
    void setUp() {
        math = new DndMathService();
        engine = new DndCoreEngineService(math);
        service = new DmgRulesService(engine, math);
    }

    @Test
    @DisplayName("Dano de Queda abaixo de 3m deve ser zero e conter log explicativo")
    void fallDamageUnder3m() {
        ActionResult result = service.calculateFallDamage(2.5);
        assertNotNull(result);
        assertEquals(0, result.getTotal());
        assertTrue(result.getLog().contains("sem dano"));
    }

    @Test
    @DisplayName("Dano de Queda de 10m deve causar 3d6 e registrar caído")
    void fallDamage10m() {
        ActionResult result = service.calculateFallDamage(10.0);
        assertNotNull(result);
        assertTrue(result.getTotal() >= 3 && result.getTotal() <= 18);
        assertTrue(result.getLog().contains("3d6 concussão"));
        assertTrue(result.getLog().contains("Caído"));
    }

    @Test
    @DisplayName("Dano de Queda deve ser limitado a 20d6 mesmo para alturas colossais")
    void fallDamageMax() {
        ActionResult result = service.calculateFallDamage(100.0);
        assertNotNull(result);
        assertTrue(result.getTotal() >= 20 && result.getTotal() <= 120);
        assertTrue(result.getLog().contains("20d6 concussão"));
    }

    @Test
    @DisplayName("Teste de Resistência de Armadilha com Sucesso e Dano Pela Metade")
    void resolveTrapSaveSuccess() {
        // Atributo 20 (+5), bônus +2, proficiente = +7 no save. CD 10 da armadilha.
        // Espera-se sucesso absoluto independente do d20 (mínimo 1+7=8, mas 99% das vezes >=10).
        // Para garantir 100% de sucesso sem depender de rng no teste unitário, vamos testar com CD baixa e atributo alto.
        DmgRulesService.TrapResult result = service.resolveTrapSave(30, 6, true, 5, "2d10", true);
        assertNotNull(result);
        assertTrue(result.saved());
        assertNotNull(result.log());
        assertTrue(result.log().contains("SUCESSO"));
        
        if (result.damage() != null) {
            // Dano deve ser metade de 2d10 (pois halfOnSuccess = true e salvou)
            int rawDamage = result.damage().getNaturalRoll();
            assertEquals((int) Math.floor(rawDamage * 0.5), result.damage().getTotal());
        }
    }

    @Test
    @DisplayName("Teste de Resistência de Armadilha com Falha e Dano Completo")
    void resolveTrapSaveFailure() {
        // Atributo 1 (-5), bônus +0, CD 30. Garantia de falha.
        DmgRulesService.TrapResult result = service.resolveTrapSave(1, 0, false, 30, "2d10", true);
        assertNotNull(result);
        assertFalse(result.saved());
        assertTrue(result.log().contains("FALHA"));
        assertNotNull(result.damage());
        assertEquals(result.damage().getNaturalRoll(), result.damage().getTotal());
    }

    @Test
    @DisplayName("Teste de Resistência contra Veneno Existente (Veneno de Serpente)")
    void resolvePoisonSaveExist() {
        // CD do Veneno de Serpente é 11. Dano 3d6 (metade no sucesso).
        // Testando com CON 30 (+10) para garantir sucesso na maior parte das vezes,
        // ou apenas validando a estrutura do log e dano.
        DmgRulesService.PoisonResult result = service.resolvePoisonSave(20, 2, true, "Veneno de Serpente");
        assertNotNull(result);
        assertTrue(result.log().contains("Veneno de Serpente"));
        assertNotNull(result.damage());
        
        if (result.saved()) {
            assertEquals((int) Math.floor(result.damage().getNaturalRoll() * 0.5), result.damage().getTotal());
        } else {
            assertEquals(result.damage().getNaturalRoll(), result.damage().getTotal());
        }
    }

    @Test
    @DisplayName("Teste de Resistência contra Veneno Inexistente deve retornar log amigável")
    void resolvePoisonSaveNotExist() {
        DmgRulesService.PoisonResult result = service.resolvePoisonSave(10, 2, false, "Veneno de Plutônio");
        assertNotNull(result);
        assertTrue(result.saved()); // Padrão se não achar
        assertTrue(result.log().contains("não encontrado"));
    }

    @Test
    @DisplayName("Dano Ambiental deve escalar conforme nível e gravidade")
    void rollEnvironmentalDamageScaling() {
        // Nível 3, Nuisance -> 1d10
        ActionResult result1 = service.rollEnvironmentalDamage(3, "nuisance");
        assertTrue(result1.getTotal() >= 1 && result1.getTotal() <= 10);
        assertTrue(result1.getLog().contains("1d10"));

        // Nível 3, Deadly -> 4d10
        ActionResult result2 = service.rollEnvironmentalDamage(3, "deadly");
        assertTrue(result2.getTotal() >= 4 && result2.getTotal() <= 40);
        assertTrue(result2.getLog().contains("4d10"));

        // Nível 18, Deadly -> 24d10
        ActionResult result3 = service.rollEnvironmentalDamage(18, "deadly");
        assertTrue(result3.getTotal() >= 24 && result3.getTotal() <= 240);
        assertTrue(result3.getLog().contains("24d10"));
    }

    @Test
    @DisplayName("Cálculo de XP de Encontro deve somar NDs e dividir pelo grupo")
    void calculateEncounterXP() {
        // Criaturas: ND 1 (200 XP), ND 2 (450 XP), ND 5 (1800 XP). Total = 2450 XP.
        // Grupo de 4 jogadores. 2450 / 4 = 612 XP por jogador.
        String[] crs = {"1", "2", "5"};
        DmgRulesService.XpResult result = service.calculateEncounterXP(crs, 4);
        assertNotNull(result);
        assertEquals(2450, result.totalXP());
        assertEquals(612, result.perPlayerXP());
        assertEquals(4, result.partySize());
        assertTrue(result.log().contains("2450 XP"));
        assertTrue(result.log().contains("612 XP"));
    }

    @Test
    @DisplayName("Estimativa de alvos pegos em áreas de efeito (sem grid)")
    void estimateAoeTargets() {
        // Cone de 9 metros -> 9 / 3 = 3 alvos
        assertEquals(3, service.estimateAoeTargets("cone", 9.0));
        // Esfera de 6 metros de raio -> 6 / 1.5 = 4 alvos
        assertEquals(4, service.estimateAoeTargets("sphere", 6.0));
        // Linha de 30 metros -> 30 / 9 = 4 alvos
        assertEquals(4, service.estimateAoeTargets("line", 30.0));
    }

    @Test
    @DisplayName("Sobrevivência — Dias sem comida conforme modificador de constituição")
    void daysWithoutFood() {
        // CON 10 (+0) -> 3 + 0 = 3 dias
        assertEquals(3, service.daysSurviveWithoutFood(10));
        // CON 16 (+3) -> 3 + 3 = 6 dias
        assertEquals(6, service.daysSurviveWithoutFood(16));
        // CON 4 (-3) -> 3 - 3 = 0, mas mínimo 1 dia
        assertEquals(1, service.daysSurviveWithoutFood(4));
    }

    @Test
    @DisplayName("Sobrevivência — Resolução de teste de forrageamento")
    void resolveForaging() {
        // Testando com mod muito alto para forçar sucesso
        DmgRulesService.ForageResult result = service.resolveForaging(20, 6, true, 5);
        assertNotNull(result);
        assertTrue(result.success());
        assertTrue(result.foodPoundsFound() >= 0);
        assertTrue(result.log().contains("Sucesso"));
    }

    @Test
    @DisplayName("Objetos — CA por material")
    void objectAC() {
        assertEquals(11, service.getObjectAC("papel"));
        assertEquals(15, service.getObjectAC("madeira"));
        assertEquals(17, service.getObjectAC("pedra"));
        assertEquals(19, service.getObjectAC("aço"));
        assertEquals(21, service.getObjectAC("mitral"));
        assertEquals(23, service.getObjectAC("adamante"));
    }

    @Test
    @DisplayName("Objetos — PV por tamanho e resiliência")
    void objectHP() {
        // Pequeno Frágil -> 3
        assertEquals(3, service.getObjectHP("small", false));
        // Pequeno Resistente -> 10
        assertEquals(10, service.getObjectHP("small", true));
        // Grande Resistente -> 27
        assertEquals(27, service.getObjectHP("large", true));
    }

    @Test
    @DisplayName("Sobrevivência — Efeito de Exaustão por nível")
    void exhaustionEffects() {
        // Nível 1: Desvantagem em testes de habilidade
        assertTrue(service.getExhaustionEffect(1).contains("Desvantagem"));
        // Nível 6: Morte
        assertTrue(service.getExhaustionEffect(6).contains("Morte"));
        // Nível fora do limite: vazio
        assertEquals("", service.getExhaustionEffect(7));
    }
}
