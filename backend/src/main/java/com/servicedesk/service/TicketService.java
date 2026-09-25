package com.servicedesk.service;

import com.servicedesk.dto.*;
import com.servicedesk.entity.TicketPriority;
import com.servicedesk.entity.TicketStatus;
import com.servicedesk.security.UserPrincipal;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface TicketService {
    PagedResponse<TicketResponse> getTickets(
            String search,
            TicketStatus status,
            TicketPriority priority,
            Long categoryId,
            Long assignedToId,
            Boolean unassignedOnly,
            Pageable pageable,
            UserPrincipal currentUser
    );

    TicketDetailResponse getTicketById(Long id, UserPrincipal currentUser);

    TicketDetailResponse getTicketByNumber(String ticketNumber, UserPrincipal currentUser);

    TicketResponse createTicket(CreateTicketRequest request, MultipartFile attachment, UserPrincipal currentUser);

    TicketResponse updateStatus(Long id, UpdateTicketStatusRequest request, UserPrincipal currentUser);

    TicketResponse updatePriority(Long id, UpdateTicketPriorityRequest request, UserPrincipal currentUser);

    TicketResponse assignTicket(Long id, AssignTicketRequest request, UserPrincipal currentUser);

    void deleteTicket(Long id, UserPrincipal currentUser);
}
