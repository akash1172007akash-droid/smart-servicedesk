package com.servicedesk.service;

import com.servicedesk.dto.CategoryDto;
import com.servicedesk.dto.CategoryRequest;

import java.util.List;

public interface CategoryService {
    List<CategoryDto> getAllCategories();
    List<CategoryDto> getActiveCategories();
    CategoryDto getCategoryById(Long id);
    CategoryDto createCategory(CategoryRequest request);
    CategoryDto updateCategory(Long id, CategoryRequest request);
}
