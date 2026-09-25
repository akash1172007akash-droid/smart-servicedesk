package com.servicedesk.service.impl;

import com.servicedesk.dto.DashboardStatsResponse;
import com.servicedesk.dto.TicketResponse;
import com.servicedesk.entity.*;
import com.servicedesk.repository.CategoryRepository;
import com.servicedesk.repository.TicketRepository;
import com.servicedesk.repository.UserRepository;
import com.servicedesk.security.UserPrincipal;
import com.servicedesk.service.DashboardService;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardServiceImpl implements DashboardService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    public DashboardServiceImpl(TicketRepository ticketRepository,
                                UserRepository userRepository,
                                CategoryRepository categoryRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsResponse.AdminDashboard getAdminDashboard() {
        DashboardStatsResponse.AdminDashboard dashboard = new DashboardStatsResponse.AdminDashboard();

        dashboard.setTotalTickets(ticketRepository.count());
        dashboard.setOpenTickets(ticketRepository.countByStatus(TicketStatus.OPEN));
        dashboard.setInProgressTickets(ticketRepository.countByStatus(TicketStatus.IN_PROGRESS));
        dashboard.setResolvedTickets(ticketRepository.countByStatus(TicketStatus.RESOLVED));
        dashboard.setClosedTickets(ticketRepository.countByStatus(TicketStatus.CLOSED));
        dashboard.setCriticalTickets(ticketRepository.countByPriorityAndStatusNot(TicketPriority.CRITICAL, TicketStatus.CLOSED));

        dashboard.setTotalUsers(userRepository.count());
        dashboard.setActiveAgents(userRepository.countByRoleAndStatus(Role.SUPPORT_AGENT, UserStatus.ACTIVE));

        // Status Distribution
        List<DashboardStatsResponse.ChartDataPoint> statusDist = new ArrayList<>();
        for (TicketStatus status : TicketStatus.values()) {
            long count = ticketRepository.countByStatus(status);
            statusDist.add(new DashboardStatsResponse.ChartDataPoint(status.name(), count));
        }
        dashboard.setStatusDistribution(statusDist);

        // Priority Distribution
        List<DashboardStatsResponse.ChartDataPoint> priorityDist = new ArrayList<>();
        for (TicketPriority priority : TicketPriority.values()) {
            long count = ticketRepository.countByPriority(priority);
            priorityDist.add(new DashboardStatsResponse.ChartDataPoint(priority.name(), count));
        }
        dashboard.setPriorityDistribution(priorityDist);

        // Category Distribution
        List<DashboardStatsResponse.ChartDataPoint> categoryDist = new ArrayList<>();
        List<Object[]> catGroups = ticketRepository.countTicketsByCategoryGroup();
        for (Object[] row : catGroups) {
            String catName = (String) row[0];
            long count = (Long) row[1];
            categoryDist.add(new DashboardStatsResponse.ChartDataPoint(catName, count));
        }
        dashboard.setCategoryDistribution(categoryDist);

        // Tickets Created Over Time (last 7 days)
        List<DashboardStatsResponse.ChartDataPoint> trendList = new ArrayList<>();
        LocalDate today = LocalDate.now();
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("MMM dd");

        LocalDateTime weekAgo = today.minusDays(6).atStartOfDay();
        List<Ticket> recentList = ticketRepository.findTicketsSince(weekAgo);

        Map<String, Long> dayCounts = new LinkedHashMap<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            dayCounts.put(d.format(dtf), 0L);
        }

        for (Ticket t : recentList) {
            String key = t.getCreatedAt().toLocalDate().format(dtf);
            if (dayCounts.containsKey(key)) {
                dayCounts.put(key, dayCounts.get(key) + 1);
            }
        }

        for (Map.Entry<String, Long> entry : dayCounts.entrySet()) {
            trendList.add(new DashboardStatsResponse.ChartDataPoint(entry.getKey(), entry.getValue()));
        }
        dashboard.setTrendData(trendList);

        // Recent 10 tickets
        List<TicketResponse> recentTickets = ticketRepository.findTop10ByOrderByCreatedAtDesc().stream()
                .map(TicketResponse::fromEntity)
                .collect(Collectors.toList());
        dashboard.setRecentTickets(recentTickets);

        return dashboard;
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsResponse.AgentDashboard getAgentDashboard(UserPrincipal currentAgent) {
        DashboardStatsResponse.AgentDashboard dashboard = new DashboardStatsResponse.AgentDashboard();

        User agent = userRepository.findById(currentAgent.getId()).orElse(null);

        if (agent != null) {
            dashboard.setAssignedTickets(ticketRepository.countByAssignedTo(agent));
            dashboard.setInProgressTickets(ticketRepository.countByAssignedToAndStatus(agent, TicketStatus.IN_PROGRESS));
            dashboard.setCriticalTickets(ticketRepository.countByAssignedToAndPriorityAndStatusNot(agent, TicketPriority.CRITICAL, TicketStatus.CLOSED));
            dashboard.setHighPriorityTickets(ticketRepository.countByAssignedToAndPriorityAndStatusNot(agent, TicketPriority.HIGH, TicketStatus.CLOSED));

            List<TicketResponse> assignedList = ticketRepository.findTop5ByAssignedToOrderByCreatedAtDesc(agent).stream()
                    .map(TicketResponse::fromEntity)
                    .collect(Collectors.toList());
            dashboard.setMyAssignedTickets(assignedList);
        }

        dashboard.setUnassignedTickets(ticketRepository.countByAssignedToIsNull());
        dashboard.setOpenTickets(ticketRepository.countByStatus(TicketStatus.OPEN));

        // Available tickets (unassigned, open or not closed)
        List<TicketResponse> availableList = ticketRepository.findWithFilters(
                null, null, null, null, null, null, true, PageRequest.of(0, 5)
        ).getContent().stream()
                .map(TicketResponse::fromEntity)
                .collect(Collectors.toList());
        dashboard.setAvailableTickets(availableList);

        return dashboard;
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsResponse.EmployeeDashboard getEmployeeDashboard(UserPrincipal currentEmployee) {
        DashboardStatsResponse.EmployeeDashboard dashboard = new DashboardStatsResponse.EmployeeDashboard();

        User employee = userRepository.findById(currentEmployee.getId()).orElse(null);

        if (employee != null) {
            dashboard.setTotalTickets(ticketRepository.countByCreatedBy(employee));
            dashboard.setOpenTickets(ticketRepository.countByCreatedByAndStatus(employee, TicketStatus.OPEN));
            dashboard.setInProgressTickets(ticketRepository.countByCreatedByAndStatus(employee, TicketStatus.IN_PROGRESS));
            dashboard.setResolvedTickets(ticketRepository.countByCreatedByAndStatus(employee, TicketStatus.RESOLVED));
            dashboard.setClosedTickets(ticketRepository.countByCreatedByAndStatus(employee, TicketStatus.CLOSED));

            List<TicketResponse> myTickets = ticketRepository.findTop5ByCreatedByOrderByCreatedAtDesc(employee).stream()
                    .map(TicketResponse::fromEntity)
                    .collect(Collectors.toList());
            dashboard.setMyTickets(myTickets);
        }

        return dashboard;
    }
}
