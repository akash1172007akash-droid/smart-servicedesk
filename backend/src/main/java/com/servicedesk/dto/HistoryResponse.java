package com.servicedesk.dto;

import com.servicedesk.entity.TicketHistory;

import java.time.LocalDateTime;

public class HistoryResponse {
    private Long id;
    private Long ticketId;
    private UserDto performedBy;
    private String action;
    private String details;
    private LocalDateTime createdAt;

    public HistoryResponse() {}

    public static HistoryResponse fromEntity(TicketHistory history) {
        if (history == null) return null;
        HistoryResponse response = new HistoryResponse();
        response.setId(history.getId());
        response.setTicketId(history.getTicket().getId());
        response.setPerformedBy(UserDto.fromEntity(history.getPerformedBy()));
        response.setAction(history.getAction());
        response.setDetails(history.getDetails());
        response.setCreatedAt(history.getCreatedAt());
        return response;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getTicketId() { return ticketId; }
    public void setTicketId(Long ticketId) { this.ticketId = ticketId; }
    public UserDto getPerformedBy() { return performedBy; }
    public void setPerformedBy(UserDto performedBy) { this.performedBy = performedBy; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
