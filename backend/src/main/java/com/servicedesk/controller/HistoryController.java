package com.servicedesk.controller;

import com.servicedesk.dto.ApiResponse;
import com.servicedesk.dto.HistoryResponse;
import com.servicedesk.security.UserPrincipal;
import com.servicedesk.service.TicketHistoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tickets/{ticketId}/history")
public class HistoryController {

    private final TicketHistoryService historyService;

    public HistoryController(TicketHistoryService historyService) {
        this.historyService = historyService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<HistoryResponse>>> getHistory(
            @PathVariable Long ticketId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<HistoryResponse> history = historyService.getHistoryByTicket(ticketId, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("History retrieved successfully", history));
    }
}
