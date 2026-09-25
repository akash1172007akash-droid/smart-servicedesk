package com.servicedesk.service;

import com.servicedesk.dto.AttachmentResponse;
import com.servicedesk.security.UserPrincipal;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface AttachmentService {
    AttachmentResponse uploadAttachment(Long ticketId, MultipartFile file, UserPrincipal currentUser);
    List<AttachmentResponse> getAttachmentsByTicket(Long ticketId, UserPrincipal currentUser);
    Resource loadAttachmentResource(Long ticketId, Long attachmentId);
    String getAttachmentContentType(Long ticketId, Long attachmentId);
}
