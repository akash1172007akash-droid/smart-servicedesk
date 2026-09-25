package com.servicedesk.service;

import com.servicedesk.dto.HistoryResponse;
import com.servicedesk.entity.Ticket;
import com.servicedesk.entity.User;
import com.servicedesk.security.UserPrincipal;

import java.util.List;

public interface TicketHistoryService {
    void logAction(Ticket ticket, User performedBy, String action, String details);
    List<HistoryResponse> getHistoryByTicket(Long ticketId, UserPrincipal currentUser);
}
