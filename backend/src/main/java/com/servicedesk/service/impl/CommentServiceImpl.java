package com.servicedesk.service.impl;

import com.servicedesk.dto.CommentRequest;
import com.servicedesk.dto.CommentResponse;
import com.servicedesk.entity.Role;
import com.servicedesk.entity.Ticket;
import com.servicedesk.entity.TicketComment;
import com.servicedesk.entity.User;
import com.servicedesk.exception.ForbiddenException;
import com.servicedesk.exception.ResourceNotFoundException;
import com.servicedesk.repository.TicketCommentRepository;
import com.servicedesk.repository.TicketRepository;
import com.servicedesk.repository.UserRepository;
import com.servicedesk.security.UserPrincipal;
import com.servicedesk.service.CommentService;
import com.servicedesk.service.TicketHistoryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentServiceImpl implements CommentService {

    private final TicketCommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final TicketHistoryService historyService;

    public CommentServiceImpl(TicketCommentRepository commentRepository,
                              TicketRepository ticketRepository,
                              UserRepository userRepository,
                              TicketHistoryService historyService) {
        this.commentRepository = commentRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.historyService = historyService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsByTicket(Long ticketId, UserPrincipal currentUser) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));

        if (currentUser.getRole() == Role.EMPLOYEE && !ticket.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You do not have permission to view comments on this ticket");
        }

        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId).stream()
                .map(CommentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CommentResponse addComment(Long ticketId, CommentRequest request, UserPrincipal currentUser) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));

        if (currentUser.getRole() == Role.EMPLOYEE && !ticket.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You do not have permission to comment on this ticket");
        }

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        TicketComment comment = new TicketComment(ticket, user, request.getCommentText().trim());
        TicketComment saved = commentRepository.save(comment);

        historyService.logAction(ticket, user, "Comment Added", user.getFullName() + " added a comment");

        return CommentResponse.fromEntity(saved);
    }
}
