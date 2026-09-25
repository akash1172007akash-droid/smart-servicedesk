package com.servicedesk.dto;

import com.servicedesk.entity.Ticket;
import com.servicedesk.entity.TicketPriority;
import com.servicedesk.entity.TicketStatus;

import java.time.LocalDateTime;

public class TicketResponse {
    private Long id;
    private String ticketNumber;
    private String title;
    private String description;
    private CategoryDto category;
    private TicketPriority priority;
    private TicketStatus status;
    private UserDto createdBy;
    private UserDto assignedTo;
    private String resolutionNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
    private LocalDateTime closedAt;

    public TicketResponse() {}

    public static TicketResponse fromEntity(Ticket ticket) {
        if (ticket == null) return null;
        TicketResponse response = new TicketResponse();
        response.setId(ticket.getId());
        response.setTicketNumber(ticket.getTicketNumber());
        response.setTitle(ticket.getTitle());
        response.setDescription(ticket.getDescription());
        response.setCategory(CategoryDto.fromEntity(ticket.getCategory()));
        response.setPriority(ticket.getPriority());
        response.setStatus(ticket.getStatus());
        response.setCreatedBy(UserDto.fromEntity(ticket.getCreatedBy()));
        response.setAssignedTo(UserDto.fromEntity(ticket.getAssignedTo()));
        response.setResolutionNotes(ticket.getResolutionNotes());
        response.setCreatedAt(ticket.getCreatedAt());
        response.setUpdatedAt(ticket.getUpdatedAt());
        response.setResolvedAt(ticket.getResolvedAt());
        response.setClosedAt(ticket.getClosedAt());
        return response;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTicketNumber() { return ticketNumber; }
    public void setTicketNumber(String ticketNumber) { this.ticketNumber = ticketNumber; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public CategoryDto getCategory() { return category; }
    public void setCategory(CategoryDto category) { this.category = category; }
    public TicketPriority getPriority() { return priority; }
    public void setPriority(TicketPriority priority) { this.priority = priority; }
    public TicketStatus getStatus() { return status; }
    public void setStatus(TicketStatus status) { this.status = status; }
    public UserDto getCreatedBy() { return createdBy; }
    public void setCreatedBy(UserDto createdBy) { this.createdBy = createdBy; }
    public UserDto getAssignedTo() { return assignedTo; }
    public void setAssignedTo(UserDto assignedTo) { this.assignedTo = assignedTo; }
    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }
    public LocalDateTime getClosedAt() { return closedAt; }
    public void setClosedAt(LocalDateTime closedAt) { this.closedAt = closedAt; }
}
