package com.servicedesk.dto;

import com.servicedesk.entity.TicketStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateTicketStatusRequest {

    @NotNull(message = "Status is required")
    private TicketStatus status;

    private String resolutionNotes;

    public UpdateTicketStatusRequest() {}

    public UpdateTicketStatusRequest(TicketStatus status, String resolutionNotes) {
        this.status = status;
        this.resolutionNotes = resolutionNotes;
    }

    public TicketStatus getStatus() { return status; }
    public void setStatus(TicketStatus status) { this.status = status; }
    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }
}
