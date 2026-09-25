package com.servicedesk.dto;

import com.servicedesk.entity.TicketAttachment;

import java.time.LocalDateTime;

public class AttachmentResponse {
    private Long id;
    private Long ticketId;
    private String filename;
    private String originalFilename;
    private String fileType;
    private Long fileSize;
    private UserDto uploadedBy;
    private LocalDateTime uploadedAt;
    private String downloadUrl;

    public AttachmentResponse() {}

    public static AttachmentResponse fromEntity(TicketAttachment attachment) {
        if (attachment == null) return null;
        AttachmentResponse response = new AttachmentResponse();
        response.setId(attachment.getId());
        response.setTicketId(attachment.getTicket().getId());
        response.setFilename(attachment.getFilename());
        response.setOriginalFilename(attachment.getOriginalFilename());
        response.setFileType(attachment.getFileType());
        response.setFileSize(attachment.getFileSize());
        response.setUploadedBy(UserDto.fromEntity(attachment.getUploadedBy()));
        response.setUploadedAt(attachment.getUploadedAt());
        response.setDownloadUrl("/api/tickets/" + attachment.getTicket().getId() + "/attachments/" + attachment.getId() + "/download");
        return response;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getTicketId() { return ticketId; }
    public void setTicketId(Long ticketId) { this.ticketId = ticketId; }
    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }
    public String getOriginalFilename() { return originalFilename; }
    public void setOriginalFilename(String originalFilename) { this.originalFilename = originalFilename; }
    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }
    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
    public UserDto getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(UserDto uploadedBy) { this.uploadedBy = uploadedBy; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
    public String getDownloadUrl() { return downloadUrl; }
    public void setDownloadUrl(String downloadUrl) { this.downloadUrl = downloadUrl; }
}
