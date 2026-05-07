package com.blooddragons.controller;

import com.blooddragons.data.CompendiumData;
import com.blooddragons.data.Dnd5eOptionsData;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller REST para dados estáticos do compêndio D&D 5e.
 */
@RestController
@RequestMapping("/api/compendium")
public class CompendiumController {

    @GetMapping("/weapons")
    public ResponseEntity<List<CompendiumData.CompendiumWeapon>> getWeapons() {
        return ResponseEntity.ok(CompendiumData.WEAPONS);
    }

    @GetMapping("/spells")
    public ResponseEntity<List<CompendiumData.CompendiumSpell>> getSpells() {
        return ResponseEntity.ok(CompendiumData.SPELLS);
    }

    @GetMapping("/classes")
    public ResponseEntity<List<Dnd5eOptionsData.Dnd5eClass>> getClasses() {
        return ResponseEntity.ok(Dnd5eOptionsData.CLASSES);
    }

    @GetMapping("/races")
    public ResponseEntity<List<Dnd5eOptionsData.Dnd5eRace>> getRaces() {
        return ResponseEntity.ok(Dnd5eOptionsData.RACES);
    }

    @GetMapping("/alignments")
    public ResponseEntity<List<Dnd5eOptionsData.Dnd5eAlignment>> getAlignments() {
        return ResponseEntity.ok(Dnd5eOptionsData.ALIGNMENTS);
    }

    @GetMapping("/backgrounds")
    public ResponseEntity<List<Dnd5eOptionsData.Dnd5eBackground>> getBackgrounds() {
        return ResponseEntity.ok(Dnd5eOptionsData.BACKGROUNDS);
    }
}
