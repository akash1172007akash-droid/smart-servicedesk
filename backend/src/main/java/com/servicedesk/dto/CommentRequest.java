package com.servicedesk.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CommentRequest {

    @NotBlank(message = "Comment text is required")
    @Size(min = 1, max = 2000, message = "Comment must be between 1 and 2000 characters")
    private String commentText;

    public CommentRequest() {}

    public CommentRequest(String commentText) {
        this.commentText = commentText;
    }

    public String getCommentText() { return commentText; }
    public void setCommentText(String commentText) { this.commentText = commentText; }
}
