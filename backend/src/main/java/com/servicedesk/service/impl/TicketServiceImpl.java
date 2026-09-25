package com.servicedesk.service.impl;

import com.servicedesk.dto.*;
import com.servicedesk.entity.*;
import com.servicedesk.exception.BadRequestException;
import com.servicedesk.exception.ForbiddenException;
import com.servicedesk.exception.ResourceNotFoundException;
import com.servicedesk.repository.*;
import com.servicedesk.security.UserPrincipal;
import com.servicedesk.service.AttachmentService;
import com.servicedesk.service.TicketHistoryService;
import com.servicedesk.service.TicketService;
import com.servicedesk.util.TicketNumberGenerator;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final TicketCommentRepository commentRepository;
    private final TicketAttachmentRepository attachmentRepository;
    private final TicketHistoryRepository historyRepository;
    private final TicketHistoryService historyService;
    private final AttachmentService attachmentService;
    private final TicketNumberGenerator ticketNumberGenerator;

    public TicketServiceImpl(TicketRepository ticketRepository,
                             CategoryRepository categoryRepository,
                             UserRepository userRepository,
                             TicketCommentRepository commentRepository,
                             TicketAttachmentRepository attachmentRepository,
                             TicketHistoryRepository historyRepository,
                             TicketHistoryService historyService,
                             AttachmentService attachmentService,
                             TicketNumberGenerator ticketNumberGenerator) {
        this.ticketRepository = ticketRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.commentRepository = commentRepository;
        this.attachmentRepository = attachmentRepository;
        this.historyRepository = historyRepository;
        this.historyService = historyService;
        this.attachmentService = attachmentService;
        this.ticketNumberGenerator = ticketNumberGenerator;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<TicketResponse> getTickets(
            String search,
            TicketStatus status,
            TicketPriority priority,
            Long categoryId,
            Long assignedToId,
            Boolean unassignedOnly,
            Pageable pageable,
            UserPrincipal currentUser) {

        Long createdById = null;
        if (currentUser.getRole() == Role.EMPLOYEE) {
            createdById = currentUser.getId();
        }

        String searchTerm = StringUtils.hasText(search) ? search.trim() : null;
        boolean unassigned = Boolean.TRUE.equals(unassignedOnly);

        Page<Ticket> page = ticketRepository.findWithFilters(
                searchTerm,
                status,
                priority,
                categoryId,
                createdById,
                assignedToId,
                unassigned,
                pageable
        );

        List<TicketResponse> content = page.getContent().stream()
                .map(TicketResponse::fromEntity)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public TicketDetailResponse getTicketById(Long id, UserPrincipal currentUser) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));

        validateAccess(ticket, currentUser);

        return buildTicketDetailResponse(ticket);
    }

    @Override
    @Transactional(readOnly = true)
    public TicketDetailResponse getTicketByNumber(String ticketNumber, UserPrincipal currentUser) {
        Ticket ticket = ticketRepository.findByTicketNumber(ticketNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with number: " + ticketNumber));

        validateAccess(ticket, currentUser);

        return buildTicketDetailResponse(ticket);
    }

    private void validateAccess(Ticket ticket, UserPrincipal currentUser) {
        if (currentUser.getRole() == Role.EMPLOYEE && !ticket.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You do not have permission to access this ticket");
        }
    }

    private TicketDetailResponse buildTicketDetailResponse(Ticket ticket) {
        TicketResponse ticketResponse = TicketResponse.fromEntity(ticket);

        List<CommentResponse> comments = commentRepository.findByTicketIdOrderByCreatedAtAsc(ticket.getId()).stream()
                .map(CommentResponse::fromEntity)
                .collect(Collectors.toList());

        List<AttachmentResponse> attachments = attachmentRepository.findByTicketIdOrderByUploadedAtDesc(ticket.getId()).stream()
                .map(AttachmentResponse::fromEntity)
                .collect(Collectors.toList());

        List<HistoryResponse> history = historyRepository.findByTicketIdOrderByCreatedAtDesc(ticket.getId()).stream()
                .map(HistoryResponse::fromEntity)
                .collect(Collectors.toList());

        return new TicketDetailResponse(ticketResponse, comments, attachments, history);
    }

    @Override
    @Transactional
    public TicketResponse createTicket(CreateTicketRequest request, MultipartFile attachment, UserPrincipal currentUser) {
        User creator = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        if (!Boolean.TRUE.equals(category.getIsActive())) {
            throw new BadRequestException("Selected category is inactive");
        }

        Ticket ticket = new Ticket();
        ticket.setTicketNumber(ticketNumberGenerator.generateNextTicketNumber());
        ticket.setTitle(request.getTitle().trim());
        ticket.setDescription(request.getDescription().trim());
        ticket.setCategory(category);
        ticket.setPriority(request.getPriority());
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setCreatedBy(creator);

        Ticket savedTicket = ticketRepository.save(ticket);

        // Record history event
        historyService.logAction(
                savedTicket,
                creator,
                "Ticket Created",
                "Ticket " + savedTicket.getTicketNumber() + " created by " + creator.getFullName()
        );

        // Process initial attachment if provided
        if (attachment != null && !attachment.isEmpty()) {
            attachmentService.uploadAttachment(savedTicket.getId(), attachment, currentUser);
        }

        return TicketResponse.fromEntity(savedTicket);
    }

    @Override
    @Transactional
    public TicketResponse updateStatus(Long id, UpdateTicketStatusRequest request, UserPrincipal currentUser) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        TicketStatus currentStatus = ticket.getStatus();
        TicketStatus newStatus = request.getStatus();

        if (currentStatus == newStatus) {
            return TicketResponse.fromEntity(ticket);
        }

        // Validate workflow transitions
        validateStatusTransition(currentStatus, newStatus, ticket, currentUser);

        ticket.setStatus(newStatus);

        if (newStatus == TicketStatus.RESOLVED) {
            if (!StringUtils.hasText(request.getResolutionNotes())) {
                throw new BadRequestException("Resolution notes are required when marking a ticket as RESOLVED");
            }
            ticket.setResolutionNotes(request.getResolutionNotes().trim());
            ticket.setResolvedAt(LocalDateTime.now());
        } else if (newStatus == TicketStatus.CLOSED) {
            ticket.setClosedAt(LocalDateTime.now());
        } else if (newStatus == TicketStatus.IN_PROGRESS && currentStatus == TicketStatus.RESOLVED) {
            // Reopened ticket
            ticket.setResolvedAt(null);
            ticket.setClosedAt(null);
        }

        Ticket updatedTicket = ticketRepository.save(ticket);

        String actionDetail = String.format("%s changed status from %s to %s",
                user.getFullName(), currentStatus.name(), newStatus.name());
        if (StringUtils.hasText(request.getResolutionNotes())) {
            actionDetail += ". Resolution Notes: " + request.getResolutionNotes().trim();
        }

        historyService.logAction(updatedTicket, user, "Status Changed", actionDetail);

        return TicketResponse.fromEntity(updatedTicket);
    }

    private void validateStatusTransition(TicketStatus current, TicketStatus next, Ticket ticket, UserPrincipal currentUser) {
        Role userRole = currentUser.getRole();

        // Check Allowed Transitions
        boolean isValid = false;
        switch (current) {
            case OPEN:
                // OPEN can go to ASSIGNED or IN_PROGRESS
                isValid = (next == TicketStatus.ASSIGNED || next == TicketStatus.IN_PROGRESS);
                if (userRole == Role.EMPLOYEE) {
                    throw new ForbiddenException("Employees cannot change status of OPEN tickets");
                }
                break;
            case ASSIGNED:
                // ASSIGNED can go to IN_PROGRESS or OPEN (unassigned)
                isValid = (next == TicketStatus.IN_PROGRESS || next == TicketStatus.OPEN);
                if (userRole == Role.EMPLOYEE) {
                    throw new ForbiddenException("Employees cannot change status of ASSIGNED tickets");
                }
                break;
            case IN_PROGRESS:
                // IN_PROGRESS can go to RESOLVED or ASSIGNED
                isValid = (next == TicketStatus.RESOLVED || next == TicketStatus.ASSIGNED);
                if (userRole == Role.EMPLOYEE) {
                    throw new ForbiddenException("Employees cannot resolve tickets directly");
                }
                break;
            case RESOLVED:
                // RESOLVED can go to CLOSED (by employee or admin) or reopened to IN_PROGRESS
                isValid = (next == TicketStatus.CLOSED || next == TicketStatus.IN_PROGRESS);
                if (next == TicketStatus.CLOSED && userRole == Role.SUPPORT_AGENT) {
                    throw new ForbiddenException("Support agents cannot close tickets. The ticket creator or an administrator must confirm resolution.");
                }
                break;
            case CLOSED:
                // CLOSED can be reopened only by ADMIN or creator employee
                isValid = (next == TicketStatus.IN_PROGRESS);
                if (userRole == Role.SUPPORT_AGENT) {
                    throw new ForbiddenException("Only ticket creators or administrators can reopen closed tickets");
                }
                break;
        }

        if (!isValid) {
            throw new BadRequestException(String.format("Invalid status transition from %s to %s", current.name(), next.name()));
        }
    }

    @Override
    @Transactional
    public TicketResponse updatePriority(Long id, UpdateTicketPriorityRequest request, UserPrincipal currentUser) {
        if (currentUser.getRole() == Role.EMPLOYEE) {
            throw new ForbiddenException("Employees are not authorized to update ticket priority");
        }

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        TicketPriority oldPriority = ticket.getPriority();
        TicketPriority newPriority = request.getPriority();

        if (oldPriority == newPriority) {
            return TicketResponse.fromEntity(ticket);
        }

        ticket.setPriority(newPriority);
        Ticket updated = ticketRepository.save(ticket);

        historyService.logAction(
                updated,
                user,
                "Priority Changed",
                String.format("%s changed priority from %s to %s", user.getFullName(), oldPriority.name(), newPriority.name())
        );

        return TicketResponse.fromEntity(updated);
    }

    @Override
    @Transactional
    public TicketResponse assignTicket(Long id, AssignTicketRequest request, UserPrincipal currentUser) {
        if (currentUser.getRole() == Role.EMPLOYEE) {
            throw new ForbiddenException("Employees cannot assign tickets");
        }

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));

        User performer = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));

        User assignee = userRepository.findById(request.getAssignedToId())
                .orElseThrow(() -> new ResourceNotFoundException("Assignee user not found with id: " + request.getAssignedToId()));

        if (assignee.getRole() != Role.SUPPORT_AGENT && assignee.getRole() != Role.ADMIN) {
            throw new BadRequestException("Tickets can only be assigned to Support Agents or Administrators");
        }

        if (assignee.getStatus() != UserStatus.ACTIVE) {
            throw new BadRequestException("Cannot assign ticket to an inactive user");
        }

        User previousAssignee = ticket.getAssignedTo();
        ticket.setAssignedTo(assignee);

        // If ticket was OPEN, transition it to ASSIGNED
        if (ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.ASSIGNED);
        }

        Ticket updated = ticketRepository.save(ticket);

        String details = String.format("%s assigned ticket to %s", performer.getFullName(), assignee.getFullName());
        if (previousAssignee != null) {
            details += " (previously assigned to " + previousAssignee.getFullName() + ")";
        }

        historyService.logAction(updated, performer, "Ticket Assigned", details);

        return TicketResponse.fromEntity(updated);
    }

    @Override
    @Transactional
    public void deleteTicket(Long id, UserPrincipal currentUser) {
        if (currentUser.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Only administrators can delete tickets");
        }

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));

        ticketRepository.delete(ticket);
    }
}
