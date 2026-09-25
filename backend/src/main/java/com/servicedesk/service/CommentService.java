package com.servicedesk.service;

import com.servicedesk.dto.CommentRequest;
import com.servicedesk.dto.CommentResponse;
import com.servicedesk.security.UserPrincipal;

import java.util.List;

public interface CommentService {
    List<CommentResponse> getCommentsByTicket(Long ticketId, UserPrincipal currentUser);
    CommentResponse addComment(Long ticketId, CommentRequest request, UserPrincipal currentUser);
}
