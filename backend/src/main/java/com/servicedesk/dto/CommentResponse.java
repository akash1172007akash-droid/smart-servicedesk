package com.servicedesk.dto;

import com.servicedesk.entity.TicketComment;

import java.time.LocalDateTime;

public class CommentResponse {
    private Long id;
    private Long ticketId;
    private UserDto user;
    private String commentText;
    private LocalDateTime createdAt;

    public CommentResponse() {}

    public static CommentResponse fromEntity(TicketComment comment) {
        if (comment == null) return null;
        CommentResponse response = new CommentResponse();
        response.setId(comment.getId());
        response.setTicketId(comment.getTicket().getId());
        response.setUser(UserDto.fromEntity(comment.getUser()));
        response.setCommentText(comment.getCommentText());
        response.setCreatedAt(comment.getCreatedAt());
        return response;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getTicketId() { return ticketId; }
    public void setTicketId(Long ticketId) { this.ticketId = ticketId; }
    public UserDto getUser() { return user; }
    public void setUser(UserDto user) { this.user = user; }
    public String getCommentText() { return commentText; }
    public void setCommentText(String commentText) { this.commentText = commentText; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
