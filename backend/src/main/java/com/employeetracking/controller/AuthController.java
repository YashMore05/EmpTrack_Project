package com.employeetracking.controller;

import com.employeetracking.dto.LoginRequest;
import com.employeetracking.dto.LoginResponse;
import com.employeetracking.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile")
    public ResponseEntity<LoginResponse> getProfile(@RequestParam String email) {
        LoginResponse response = authService.getProfile(email);
        return ResponseEntity.ok(response);
    }
}
