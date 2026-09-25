package com.servicedesk.controller;

import com.servicedesk.dto.ApiResponse;
import com.servicedesk.dto.AttachmentResponse;
import com.servicedesk.security.UserPrincipal;
import com.servicedesk.service.AttachmentService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/tickets/{ticketId}/attachments")
public class AttachmentController {

    private final AttachmentService attachmentService;

    public AttachmentController(AttachmentService attachmentService) {
        this.attachmentService = attachmentService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AttachmentResponse>> uploadAttachment(
            @PathVariable Long ticketId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        AttachmentResponse response = attachmentService.uploadAttachment(ticketId, file, currentUser);
        return new ResponseEntity<>(ApiResponse.ok("File uploaded successfully", response), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AttachmentResponse>>> getAttachments(
            @PathVariable Long ticketId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<AttachmentResponse> list = attachmentService.getAttachmentsByTicket(ticketId, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Attachments retrieved successfully", list));
    }

    @GetMapping("/{attachmentId}/download")
    public ResponseEntity<Resource> downloadAttachment(
            @PathVariable Long ticketId,
            @PathVariable Long attachmentId) {
        Resource resource = attachmentService.loadAttachmentResource(ticketId, attachmentId);
        String contentType = attachmentService.getAttachmentContentType(ticketId, attachmentId);

        if (contentType == null || contentType.isBlank()) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
