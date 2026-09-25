package com.servicedesk.service.impl;

import com.servicedesk.dto.CategoryDto;
import com.servicedesk.dto.CategoryRequest;
import com.servicedesk.entity.Category;
import com.servicedesk.exception.ConflictException;
import com.servicedesk.exception.ResourceNotFoundException;
import com.servicedesk.repository.CategoryRepository;
import com.servicedesk.service.CategoryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryServiceImpl(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAllByOrderByCreatedAtAsc().stream()
                .map(CategoryDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryDto> getActiveCategories() {
        return categoryRepository.findByIsActiveTrue().stream()
                .map(CategoryDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryDto getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return CategoryDto.fromEntity(category);
    }

    @Override
    @Transactional
    public CategoryDto createCategory(CategoryRequest request) {
        String trimmedName = request.getName().trim();
        if (categoryRepository.existsByName(trimmedName)) {
            throw new ConflictException("Category already exists: " + trimmedName);
        }

        Category category = new Category(
                trimmedName,
                request.getDescription() != null ? request.getDescription().trim() : null,
                request.getIsActive() != null ? request.getIsActive() : true
        );

        Category saved = categoryRepository.save(category);
        return CategoryDto.fromEntity(saved);
    }

    @Override
    @Transactional
    public CategoryDto updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        String trimmedName = request.getName().trim();
        if (!category.getName().equalsIgnoreCase(trimmedName) && categoryRepository.existsByName(trimmedName)) {
            throw new ConflictException("Category already exists: " + trimmedName);
        }

        category.setName(trimmedName);
        category.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        if (request.getIsActive() != null) {
            category.setIsActive(request.getIsActive());
        }

        Category updated = categoryRepository.save(category);
        return CategoryDto.fromEntity(updated);
    }
}
