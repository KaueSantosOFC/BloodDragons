package com.blooddragons.controller;

import com.blooddragons.model.Campaign;
import com.blooddragons.model.Token;
import com.blooddragons.service.CampaignService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Controller REST para CRUD de campanhas.
 */
@RestController
@RequestMapping("/api/campaigns")
public class CampaignController {

    private final CampaignService campaignService;

    public CampaignController(CampaignService campaignService) {
        this.campaignService = campaignService;
    }

    @GetMapping
    public ResponseEntity<List<Campaign>> list() {
        return ResponseEntity.ok(campaignService.getAllCampaigns());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Campaign> get(@PathVariable String id) {
        return campaignService.getCampaign(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Campaign> create(@RequestBody Map<String, String> req) {
        String name = req.getOrDefault("name", "Nova Campanha");
        Campaign campaign = campaignService.createCampaign(name);
        return ResponseEntity.ok(campaign);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Campaign> update(@PathVariable String id, @RequestBody Campaign updates) {
        return campaignService.updateCampaign(id, updates)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Boolean>> delete(@PathVariable String id) {
        boolean deleted = campaignService.deleteCampaign(id);
        if (!deleted) return ResponseEntity.badRequest().body(Map.of("deleted", false));
        return ResponseEntity.ok(Map.of("deleted", true));
    }

    /**
     * Retorna fichas salvas de todas as campanhas para importação cruzada.
     * Varre tokens que possuem sheet preenchido.
     */
    @GetMapping("/saved-characters")
    public ResponseEntity<List<Map<String, Object>>> getSavedCharacters() {
        List<Map<String, Object>> result = new ArrayList<>();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        for (Campaign campaign : campaignService.getAllCampaigns()) {
            if (campaign.getTokens() == null) continue;
            for (Token token : campaign.getTokens()) {
                if (token.getSheet() == null) continue;
                var sheet = token.getSheet();
                Map<String, Object> entry = new LinkedHashMap<>();
                entry.put("id", token.getId() + "_" + campaign.getId());
                entry.put("characterName", token.getName() != null ? token.getName() : "");
                entry.put("playerName", sheet.getPlayerName() != null ? sheet.getPlayerName() : "Mestre");
                entry.put("className", sheet.getClassName() != null ? sheet.getClassName() : "");
                entry.put("race", sheet.getRace() != null ? sheet.getRace() : "");
                entry.put("level", sheet.getLevel());
                entry.put("campaignName", campaign.getName());
                entry.put("saveDate", campaign.getLastPlayedAt() != null ? campaign.getLastPlayedAt().format(fmt) : "");
                entry.put("sheet", sheet);
                result.add(entry);
            }
        }
        return ResponseEntity.ok(result);
    }
}
