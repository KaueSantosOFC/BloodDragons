package com.blooddragons.service;

import com.blooddragons.model.Campaign;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Serviço de campanhas — CRUD com persistência em arquivo JSON.
 * Migrado de: src/app/services/campaign.service.ts
 */
@Service
public class CampaignService {

    @Value("${blooddragons.data-dir:./data}")
    private String dataDir;

    private final Map<String, Campaign> campaigns = new ConcurrentHashMap<>();
    private final ObjectMapper mapper;

    public CampaignService() {
        this.mapper = new ObjectMapper();
        this.mapper.registerModule(new JavaTimeModule());
    }

    @PostConstruct
    public void init() {
        File dir = new File(dataDir);
        if (!dir.exists()) dir.mkdirs();
        loadCampaigns();
        if (campaigns.isEmpty()) {
            Campaign test = Campaign.builder()
                    .id("test-campaign")
                    .name("Campanha Teste (Tutorial)")
                    .build();
            campaigns.put(test.getId(), test);
            saveCampaigns();
        }
    }

    public List<Campaign> getAllCampaigns() {
        return new ArrayList<>(campaigns.values());
    }

    public Optional<Campaign> getCampaign(String id) {
        return Optional.ofNullable(campaigns.get(id));
    }

    public Campaign createCampaign(String name) {
        Campaign campaign = Campaign.builder()
                .id("camp_" + System.currentTimeMillis())
                .name(name)
                .build();
        campaigns.put(campaign.getId(), campaign);
        saveCampaigns();
        return campaign;
    }

    public Optional<Campaign> updateCampaign(String id, Campaign updates) {
        Campaign existing = campaigns.get(id);
        if (existing == null) return Optional.empty();

        if (updates.getName() != null) existing.setName(updates.getName());
        if (updates.getTokens() != null) existing.setTokens(updates.getTokens());
        if (updates.getMapBackgroundImage() != null) existing.setMapBackgroundImage(updates.getMapBackgroundImage());
        if (updates.getFogOfWar() != null) existing.setFogOfWar(updates.getFogOfWar());
        if (updates.getIsFogEnabled() != null) existing.setIsFogEnabled(updates.getIsFogEnabled());
        if (updates.getScenes() != null) existing.setScenes(updates.getScenes());
        if (updates.getActiveSceneId() != null) existing.setActiveSceneId(updates.getActiveSceneId());
        existing.setLastPlayedAt(LocalDateTime.now());

        campaigns.put(id, existing);
        saveCampaigns();
        return Optional.of(existing);
    }

    public boolean deleteCampaign(String id) {
        if ("test-campaign".equals(id)) return false;
        Campaign removed = campaigns.remove(id);
        if (removed != null) saveCampaigns();
        return removed != null;
    }

    // --- Persistência em JSON ---

    private void loadCampaigns() {
        File file = new File(dataDir, "campaigns.json");
        if (!file.exists()) return;
        try {
            List<Campaign> list = mapper.readValue(file, new TypeReference<>() {});
            for (Campaign c : list) campaigns.put(c.getId(), c);
        } catch (IOException e) {
            System.err.println("Failed to load campaigns: " + e.getMessage());
        }
    }

    private void saveCampaigns() {
        File file = new File(dataDir, "campaigns.json");
        try {
            mapper.writerWithDefaultPrettyPrinter().writeValue(file, new ArrayList<>(campaigns.values()));
        } catch (IOException e) {
            System.err.println("Failed to save campaigns: " + e.getMessage());
        }
    }
}
