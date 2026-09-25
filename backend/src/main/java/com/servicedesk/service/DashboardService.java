package com.servicedesk.service;

import com.servicedesk.dto.DashboardStatsResponse;
import com.servicedesk.security.UserPrincipal;

public interface DashboardService {
    DashboardStatsResponse.AdminDashboard getAdminDashboard();
    DashboardStatsResponse.AgentDashboard getAgentDashboard(UserPrincipal currentAgent);
    DashboardStatsResponse.EmployeeDashboard getEmployeeDashboard(UserPrincipal currentEmployee);
}
