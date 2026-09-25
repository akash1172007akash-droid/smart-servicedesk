package com.servicedesk.controller;

import com.servicedesk.dto.ApiResponse;
import com.servicedesk.dto.CommentRequest;
import com.servicedesk.dto.CommentResponse;
import com.servicedesk.security.UserPrincipal;
import com.servicedesk.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets/{ticketId}/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getComments(
            @PathVariable Long ticketId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<CommentResponse> comments = commentService.getCommentsByTicket(ticketId, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Comments retrieved successfully", comments));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CommentResponse>> addComment(
            @PathVariable Long ticketId,
            @Valid @RequestBody CommentRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        CommentResponse comment = commentService.addComment(ticketId, request, currentUser);
        return new ResponseEntity<>(ApiResponse.ok("Comment added successfully", comment), HttpStatus.CREATED);
    }
}
