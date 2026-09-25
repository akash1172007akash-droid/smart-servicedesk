package com.servicedesk.dto;

import java.util.List;
import java.util.Map;

public class DashboardStatsResponse {

    public static class ChartDataPoint {
        private String name;
        private long value;

        public ChartDataPoint() {}
        public ChartDataPoint(String name, long value) {
            this.name = name;
            this.value = value;
        }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public long getValue() { return value; }
        public void setValue(long value) { this.value = value; }
    }

    public static class AdminDashboard {
        private long totalTickets;
        private long openTickets;
        private long inProgressTickets;
        private long resolvedTickets;
        private long closedTickets;
        private long criticalTickets;
        private long totalUsers;
        private long activeAgents;
        private List<ChartDataPoint> statusDistribution;
        private List<ChartDataPoint> priorityDistribution;
        private List<ChartDataPoint> categoryDistribution;
        private List<ChartDataPoint> trendData;
        private List<TicketResponse> recentTickets;

        public AdminDashboard() {}

        public long getTotalTickets() { return totalTickets; }
        public void setTotalTickets(long totalTickets) { this.totalTickets = totalTickets; }
        public long getOpenTickets() { return openTickets; }
        public void setOpenTickets(long openTickets) { this.openTickets = openTickets; }
        public long getInProgressTickets() { return inProgressTickets; }
        public void setInProgressTickets(long inProgressTickets) { this.inProgressTickets = inProgressTickets; }
        public long getResolvedTickets() { return resolvedTickets; }
        public void setResolvedTickets(long resolvedTickets) { this.resolvedTickets = resolvedTickets; }
        public long getClosedTickets() { return closedTickets; }
        public void setClosedTickets(long closedTickets) { this.closedTickets = closedTickets; }
        public long getCriticalTickets() { return criticalTickets; }
        public void setCriticalTickets(long criticalTickets) { this.criticalTickets = criticalTickets; }
        public long getTotalUsers() { return totalUsers; }
        public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }
        public long getActiveAgents() { return activeAgents; }
        public void setActiveAgents(long activeAgents) { this.activeAgents = activeAgents; }
        public List<ChartDataPoint> getStatusDistribution() { return statusDistribution; }
        public void setStatusDistribution(List<ChartDataPoint> statusDistribution) { this.statusDistribution = statusDistribution; }
        public List<ChartDataPoint> getPriorityDistribution() { return priorityDistribution; }
        public void setPriorityDistribution(List<ChartDataPoint> priorityDistribution) { this.priorityDistribution = priorityDistribution; }
        public List<ChartDataPoint> getCategoryDistribution() { return categoryDistribution; }
        public void setCategoryDistribution(List<ChartDataPoint> categoryDistribution) { this.categoryDistribution = categoryDistribution; }
        public List<ChartDataPoint> getTrendData() { return trendData; }
        public void setTrendData(List<ChartDataPoint> trendData) { this.trendData = trendData; }
        public List<TicketResponse> getRecentTickets() { return recentTickets; }
        public void setRecentTickets(List<TicketResponse> recentTickets) { this.recentTickets = recentTickets; }
    }

    public static class AgentDashboard {
        private long assignedTickets;
        private long unassignedTickets;
        private long openTickets;
        private long inProgressTickets;
        private long highPriorityTickets;
        private long criticalTickets;
        private List<TicketResponse> myAssignedTickets;
        private List<TicketResponse> availableTickets;

        public AgentDashboard() {}

        public long getAssignedTickets() { return assignedTickets; }
        public void setAssignedTickets(long assignedTickets) { this.assignedTickets = assignedTickets; }
        public long getUnassignedTickets() { return unassignedTickets; }
        public void setUnassignedTickets(long unassignedTickets) { this.unassignedTickets = unassignedTickets; }
        public long getOpenTickets() { return openTickets; }
        public void setOpenTickets(long openTickets) { this.openTickets = openTickets; }
        public long getInProgressTickets() { return inProgressTickets; }
        public void setInProgressTickets(long inProgressTickets) { this.inProgressTickets = inProgressTickets; }
        public long getHighPriorityTickets() { return highPriorityTickets; }
        public void setHighPriorityTickets(long highPriorityTickets) { this.highPriorityTickets = highPriorityTickets; }
        public long getCriticalTickets() { return criticalTickets; }
        public void setCriticalTickets(long criticalTickets) { this.criticalTickets = criticalTickets; }
        public List<TicketResponse> getMyAssignedTickets() { return myAssignedTickets; }
        public void setMyAssignedTickets(List<TicketResponse> myAssignedTickets) { this.myAssignedTickets = myAssignedTickets; }
        public List<TicketResponse> getAvailableTickets() { return availableTickets; }
        public void setAvailableTickets(List<TicketResponse> availableTickets) { this.availableTickets = availableTickets; }
    }

    public static class EmployeeDashboard {
        private long totalTickets;
        private long openTickets;
        private long inProgressTickets;
        private long resolvedTickets;
        private long closedTickets;
        private List<TicketResponse> myTickets;

        public EmployeeDashboard() {}

        public long getTotalTickets() { return totalTickets; }
        public void setTotalTickets(long totalTickets) { this.totalTickets = totalTickets; }
        public long getOpenTickets() { return openTickets; }
        public void setOpenTickets(long openTickets) { this.openTickets = openTickets; }
        public long getInProgressTickets() { return inProgressTickets; }
        public void setInProgressTickets(long inProgressTickets) { this.inProgressTickets = inProgressTickets; }
        public long getResolvedTickets() { return resolvedTickets; }
        public void setResolvedTickets(long resolvedTickets) { this.resolvedTickets = resolvedTickets; }
        public long getClosedTickets() { return closedTickets; }
        public void setClosedTickets(long closedTickets) { this.closedTickets = closedTickets; }
        public List<TicketResponse> getMyTickets() { return myTickets; }
        public void setMyTickets(List<TicketResponse> myTickets) { this.myTickets = myTickets; }
    }
}
