package com.servicedesk.controller;

import com.servicedesk.dto.*;
import com.servicedesk.entity.TicketPriority;
import com.servicedesk.entity.TicketStatus;
import com.servicedesk.security.UserPrincipal;
import com.servicedesk.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<TicketResponse>>> getTickets(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long assignedToId,
            @RequestParam(required = false, defaultValue = "false") Boolean unassignedOnly,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        String[] sortParts = sort.split(",");
        String sortField = sortParts[0];
        Sort.Direction sortDirection = (sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc"))
                ? Sort.Direction.ASC : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortField));

        PagedResponse<TicketResponse> response = ticketService.getTickets(
                search, status, priority, categoryId, assignedToId, unassignedOnly, pageable, currentUser
        );

        return ResponseEntity.ok(ApiResponse.ok("Tickets retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TicketDetailResponse>> getTicketById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        TicketDetailResponse ticket = ticketService.getTicketById(id, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Ticket details retrieved successfully", ticket));
    }

    @GetMapping("/number/{ticketNumber}")
    public ResponseEntity<ApiResponse<TicketDetailResponse>> getTicketByNumber(
            @PathVariable String ticketNumber,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        TicketDetailResponse ticket = ticketService.getTicketByNumber(ticketNumber, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Ticket details retrieved successfully", ticket));
    }

    // Support both multipart form data (with optional file) and JSON payload
    @PostMapping(consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<ApiResponse<TicketResponse>> createTicketMultipart(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam("priority") TicketPriority priority,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        CreateTicketRequest request = new CreateTicketRequest(title, description, categoryId, priority);
        TicketResponse created = ticketService.createTicket(request, file, currentUser);

        return new ResponseEntity<>(ApiResponse.ok("Ticket created successfully: " + created.getTicketNumber(), created), HttpStatus.CREATED);
    }

    @PostMapping(consumes = { MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<ApiResponse<TicketResponse>> createTicketJson(
            @Valid @RequestBody CreateTicketRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        TicketResponse created = ticketService.createTicket(request, null, currentUser);
        return new ResponseEntity<>(ApiResponse.ok("Ticket created successfully: " + created.getTicketNumber(), created), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<TicketResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTicketStatusRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        TicketResponse updated = ticketService.updateStatus(id, request, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Ticket status updated successfully", updated));
    }

    @PatchMapping("/{id}/priority")
    @PreAuthorize("hasAnyRole('SUPPORT_AGENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<TicketResponse>> updatePriority(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTicketPriorityRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        TicketResponse updated = ticketService.updatePriority(id, request, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Ticket priority updated successfully", updated));
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('SUPPORT_AGENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<TicketResponse>> assignTicket(
            @PathVariable Long id,
            @Valid @RequestBody AssignTicketRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        TicketResponse updated = ticketService.assignTicket(id, request, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Ticket assigned successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteTicket(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        ticketService.deleteTicket(id, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Ticket deleted successfully", null));
    }
}
