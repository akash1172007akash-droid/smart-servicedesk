package com.servicedesk.dto;

import java.util.ArrayList;
import java.util.List;

public class TicketDetailResponse {
    private TicketResponse ticket;
    private List<CommentResponse> comments = new ArrayList<>();
    private List<AttachmentResponse> attachments = new ArrayList<>();
    private List<HistoryResponse> history = new ArrayList<>();

    public TicketDetailResponse() {}

    public TicketDetailResponse(TicketResponse ticket, List<CommentResponse> comments,
                                List<AttachmentResponse> attachments, List<HistoryResponse> history) {
        this.ticket = ticket;
        this.comments = comments != null ? comments : new ArrayList<>();
        this.attachments = attachments != null ? attachments : new ArrayList<>();
        this.history = history != null ? history : new ArrayList<>();
    }

    public TicketResponse getTicket() { return ticket; }
    public void setTicket(TicketResponse ticket) { this.ticket = ticket; }
    public List<CommentResponse> getComments() { return comments; }
    public void setComments(List<CommentResponse> comments) { this.comments = comments; }
    public List<AttachmentResponse> getAttachments() { return attachments; }
    public void setAttachments(List<AttachmentResponse> attachments) { this.attachments = attachments; }
    public List<HistoryResponse> getHistory() { return history; }
    public void setHistory(List<HistoryResponse> history) { this.history = history; }
}
