package com.blooddragons.service;

import org.springframework.stereotype.Service;
import java.security.SecureRandom;

/**
 * Serviço de matemática e geometria D&D 5e.
 * Migrado de: src/app/services/dnd-math.service.ts
 */
@Service
public class DndMathService {

    private final SecureRandom random = new SecureRandom();

    /** Calcula distância em METROS (1 quadrado = 1.5m). */
    public double calculateDistanceMeters(int x1, int y1, int x2, int y2) {
        int dx = Math.abs(x2 - x1);
        int dy = Math.abs(y2 - y1);
        int diag = Math.min(dx, dy);
        int ortho = Math.max(dx, dy) - diag;
        return (ortho + diag + diag / 2) * 1.5;
    }

    public int rollDice(int sides, int count) {
        int total = 0;
        for (int i = 0; i < count; i++) total += random.nextInt(sides) + 1;
        return total;
    }

    public int rollDice(int sides) { return rollDice(sides, 1); }

    /** floor((score - 10) / 2) */
    public int calculateModifier(int score) { return Math.floorDiv(score - 10, 2); }

    /** ceil(level / 4) + 1 */
    public int calculateProficiencyBonus(int level) {
        return level < 1 ? 2 : (int) Math.ceil((double) level / 4) + 1;
    }

    public int calculateMaxHpGain(int hitDie, int conMod, boolean isFirst, boolean isRolled) {
        if (isFirst) return Math.max(1, hitDie + conMod);
        int avg = (int) Math.ceil(hitDie / 2.0) + 1;
        if (isRolled) return Math.max(1, rollDice(hitDie) + conMod);
        return Math.max(1, avg + conMod);
    }

    public int calculateTotalMaxHp(int level, int hitDie, int conScore) {
        int conMod = calculateModifier(conScore);
        int hp1 = calculateMaxHpGain(hitDie, conMod, true, false);
        if (level <= 1) return hp1;
        int hpN = calculateMaxHpGain(hitDie, conMod, false, false);
        return hp1 + (hpN * (level - 1));
    }

    public int calculateArmorClass(int dexScore, int conScore, int wisScore,
            String armorType, Integer baseAc, boolean hasShield,
            String unarmoredClass, boolean mediumMaster) {
        int dexMod = calculateModifier(dexScore);
        int conMod = calculateModifier(conScore);
        int wisMod = calculateModifier(wisScore);
        int shield = hasShield ? 2 : 0;
        int ac;
        switch (armorType) {
            case "none" -> {
                int std = 10 + dexMod;
                if ("monk".equals(unarmoredClass) && hasShield) ac = std;
                else if ("barbarian".equals(unarmoredClass)) ac = Math.max(std, 10 + dexMod + conMod);
                else if ("monk".equals(unarmoredClass)) ac = Math.max(std, 10 + dexMod + wisMod);
                else ac = std;
            }
            case "light" -> ac = (baseAc != null ? baseAc : 11) + dexMod;
            case "medium" -> ac = (baseAc != null ? baseAc : 12) + Math.min(dexMod, mediumMaster ? 3 : 2);
            case "heavy" -> ac = baseAc != null ? baseAc : 14;
            default -> ac = 10 + dexMod;
        }
        return ac + shield;
    }

    // Geometria AoE
    public boolean isPointInCircle(double px, double py, double cx, double cy, double r) {
        return Math.hypot(px - cx, py - cy) <= r;
    }

    public boolean isPointInCone(double px, double py, double ox, double oy,
            double tx, double ty, double range, double angleDeg) {
        double dist = Math.hypot(px - ox, py - oy);
        if (dist > range) return false;
        if (dist == 0) return true;
        double aTarget = Math.atan2(ty - oy, tx - ox);
        double aPoint = Math.atan2(py - oy, px - ox);
        double diff = aPoint - aTarget;
        while (diff <= -Math.PI) diff += 2 * Math.PI;
        while (diff > Math.PI) diff -= 2 * Math.PI;
        return Math.abs(diff) <= (angleDeg * Math.PI) / 360;
    }

    public boolean isPointInLine(double px, double py, double ox, double oy,
            double tx, double ty, double length, double width) {
        double dx = tx - ox, dy = ty - oy;
        double mag = Math.hypot(dx, dy);
        if (mag == 0) return false;
        double uX = dx / mag, uY = dy / mag;
        double dpx = px - ox, dpy = py - oy;
        double proj = dpx * uX + dpy * uY;
        if (proj < 0 || proj > length) return false;
        return Math.abs(dpx * uY - dpy * uX) <= (width / 2);
    }

    public boolean isPointInRect(double px, double py, double cx, double cy, double w, double h) {
        return Math.abs(px - cx) <= w / 2 && Math.abs(py - cy) <= h / 2;
    }
}
