package com.servicedesk.dto;

import com.servicedesk.entity.Category;

import java.time.LocalDateTime;

public class CategoryDto {
    private Long id;
    private String name;
    private String description;
    private Boolean isActive;
    private LocalDateTime createdAt;

    public CategoryDto() {}

    public CategoryDto(Long id, String name, String description, Boolean isActive, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.isActive = isActive;
        this.createdAt = createdAt;
    }

    public static CategoryDto fromEntity(Category category) {
        if (category == null) return null;
        return new CategoryDto(
                category.getId(),
                category.getName(),
                category.getDescription(),
                category.getIsActive(),
                category.getCreatedAt()
        );
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean active) { isActive = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
