package com.servicedesk.service.impl;

import com.servicedesk.dto.AttachmentResponse;
import com.servicedesk.entity.Role;
import com.servicedesk.entity.Ticket;
import com.servicedesk.entity.TicketAttachment;
import com.servicedesk.entity.User;
import com.servicedesk.exception.ForbiddenException;
import com.servicedesk.exception.ResourceNotFoundException;
import com.servicedesk.repository.TicketAttachmentRepository;
import com.servicedesk.repository.TicketRepository;
import com.servicedesk.repository.UserRepository;
import com.servicedesk.security.UserPrincipal;
import com.servicedesk.service.AttachmentService;
import com.servicedesk.service.TicketHistoryService;
import com.servicedesk.util.FileStorageService;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AttachmentServiceImpl implements AttachmentService {

    private final TicketAttachmentRepository attachmentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final TicketHistoryService historyService;

    public AttachmentServiceImpl(TicketAttachmentRepository attachmentRepository,
                                 TicketRepository ticketRepository,
                                 UserRepository userRepository,
                                 FileStorageService fileStorageService,
                                 TicketHistoryService historyService) {
        this.attachmentRepository = attachmentRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
        this.historyService = historyService;
    }

    @Override
    @Transactional
    public AttachmentResponse uploadAttachment(Long ticketId, MultipartFile file, UserPrincipal currentUser) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));

        if (currentUser.getRole() == Role.EMPLOYEE && !ticket.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You do not have permission to attach files to this ticket");
        }

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String storedFilename = fileStorageService.storeFile(file);
        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "attachment";
        String contentType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";
        long size = file.getSize();

        TicketAttachment attachment = new TicketAttachment(
                ticket,
                storedFilename,
                originalFilename,
                storedFilename,
                contentType,
                size,
                user
        );

        TicketAttachment saved = attachmentRepository.save(attachment);

        historyService.logAction(ticket, user, "Attachment Added", user.getFullName() + " uploaded attachment: " + originalFilename);

        return AttachmentResponse.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttachmentResponse> getAttachmentsByTicket(Long ticketId, UserPrincipal currentUser) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));

        if (currentUser.getRole() == Role.EMPLOYEE && !ticket.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You do not have permission to view attachments for this ticket");
        }

        return attachmentRepository.findByTicketIdOrderByUploadedAtDesc(ticketId).stream()
                .map(AttachmentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Resource loadAttachmentResource(Long ticketId, Long attachmentId) {
        TicketAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found with id: " + attachmentId));

        if (!attachment.getTicket().getId().equals(ticketId)) {
            throw new ResourceNotFoundException("Attachment does not belong to this ticket");
        }

        return fileStorageService.loadFileAsResource(attachment.getFilename());
    }

    @Override
    @Transactional(readOnly = true)
    public String getAttachmentContentType(Long ticketId, Long attachmentId) {
        TicketAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found with id: " + attachmentId));
        return attachment.getFileType();
    }
}
