package com.blooddragons.controller;

import com.blooddragons.model.Campaign;
import com.blooddragons.service.CampaignService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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
}
