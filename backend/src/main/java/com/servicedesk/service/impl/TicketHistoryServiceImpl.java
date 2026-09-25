package com.servicedesk.service.impl;

import com.servicedesk.dto.HistoryResponse;
import com.servicedesk.entity.Role;
import com.servicedesk.entity.Ticket;
import com.servicedesk.entity.TicketHistory;
import com.servicedesk.entity.User;
import com.servicedesk.exception.ForbiddenException;
import com.servicedesk.exception.ResourceNotFoundException;
import com.servicedesk.repository.TicketHistoryRepository;
import com.servicedesk.repository.TicketRepository;
import com.servicedesk.security.UserPrincipal;
import com.servicedesk.service.TicketHistoryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TicketHistoryServiceImpl implements TicketHistoryService {

    private final TicketHistoryRepository historyRepository;
    private final TicketRepository ticketRepository;

    public TicketHistoryServiceImpl(TicketHistoryRepository historyRepository,
                                   TicketRepository ticketRepository) {
        this.historyRepository = historyRepository;
        this.ticketRepository = ticketRepository;
    }

    @Override
    @Transactional
    public void logAction(Ticket ticket, User performedBy, String action, String details) {
        TicketHistory history = new TicketHistory(ticket, performedBy, action, details);
        historyRepository.save(history);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HistoryResponse> getHistoryByTicket(Long ticketId, UserPrincipal currentUser) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));

        // Check if employee has access to this ticket
        if (currentUser.getRole() == Role.EMPLOYEE && !ticket.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You do not have permission to view this ticket's history");
        }

        return historyRepository.findByTicketIdOrderByCreatedAtDesc(ticketId).stream()
                .map(HistoryResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
