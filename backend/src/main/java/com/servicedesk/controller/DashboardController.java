package com.servicedesk.controller;

import com.servicedesk.dto.ApiResponse;
import com.servicedesk.dto.DashboardStatsResponse;
import com.servicedesk.security.UserPrincipal;
import com.servicedesk.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DashboardStatsResponse.AdminDashboard>> getAdminDashboard() {
        DashboardStatsResponse.AdminDashboard stats = dashboardService.getAdminDashboard();
        return ResponseEntity.ok(ApiResponse.ok("Admin dashboard statistics", stats));
    }

    @GetMapping("/agent")
    @PreAuthorize("hasAnyRole('SUPPORT_AGENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<DashboardStatsResponse.AgentDashboard>> getAgentDashboard(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        DashboardStatsResponse.AgentDashboard stats = dashboardService.getAgentDashboard(currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Agent dashboard statistics", stats));
    }

    @GetMapping("/employee")
    public ResponseEntity<ApiResponse<DashboardStatsResponse.EmployeeDashboard>> getEmployeeDashboard(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        DashboardStatsResponse.EmployeeDashboard stats = dashboardService.getEmployeeDashboard(currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Employee dashboard statistics", stats));
    }
}
