package com.servicedesk.dto;

import jakarta.validation.constraints.NotNull;

public class AssignTicketRequest {

    @NotNull(message = "Agent ID is required")
    private Long assignedToId;

    public AssignTicketRequest() {}

    public AssignTicketRequest(Long assignedToId) {
        this.assignedToId = assignedToId;
    }

    public Long getAssignedToId() { return assignedToId; }
    public void setAssignedToId(Long assignedToId) { this.assignedToId = assignedToId; }
}
