package com.blooddragons.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Controller REST para informar a versão atual do sistema.
 */
@RestController
@RequestMapping("/api")
public class VersionController {

    private static final String SYSTEM_VERSION = "2.2.1";

    @GetMapping("/version")
    public ResponseEntity<Map<String, String>> getVersion() {
        return ResponseEntity.ok(Map.of("version", SYSTEM_VERSION));
    }
}
