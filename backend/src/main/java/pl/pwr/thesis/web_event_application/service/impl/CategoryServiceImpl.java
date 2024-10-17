package pl.pwr.thesis.web_event_application.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.pwr.thesis.web_event_application.dto.list.CategoryDto;
import pl.pwr.thesis.web_event_application.entity.Category;
import pl.pwr.thesis.web_event_application.mapper.list.CategoryMapper;
import pl.pwr.thesis.web_event_application.repository.CategoryRepository;
import pl.pwr.thesis.web_event_application.service.interfaces.CategoryService;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;
    private static final Logger logger = LoggerFactory.getLogger(CategoryServiceImpl.class);

    public CategoryServiceImpl(CategoryRepository categoryRepository, CategoryMapper categoryMapper) {
        this.categoryRepository = categoryRepository;
        this.categoryMapper = categoryMapper;
    }

    @Override
    public List<CategoryDto> getAllCategories() {
        logger.info("Fetching all categories from database");
        return categoryRepository.findAll().
                stream()
                .map(categoryMapper::categoryToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Category findOrSaveCategory(Category category) {
        try {
            return categoryRepository.findCategoryByEventCategory(category.getEventCategory())
                    .orElseGet(() -> categoryRepository.save(category));
        } catch (Exception e) {
            logger.error("Error in saving category: {} to database", category.getEventCategory(), e);
            throw new RuntimeException(e);
        }
    }
}
