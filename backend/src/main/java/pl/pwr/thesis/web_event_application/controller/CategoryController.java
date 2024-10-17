package pl.pwr.thesis.web_event_application.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.pwr.thesis.web_event_application.dto.list.CategoryDto;
import pl.pwr.thesis.web_event_application.service.interfaces.CategoryService;

import java.util.List;

@RestController
@RequestMapping("api/categories")
public class CategoryController {

    private final CategoryService categoryService;
    private static final Logger logger = LoggerFactory.getLogger(CategoryController.class);

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping("/all")
    public ResponseEntity<List<CategoryDto>> fetchAllCategories() {
        logger.info("Received request to fetch all categories.");
        List<CategoryDto> categories = categoryService.getAllCategories();
        if (categories.isEmpty()) {
            logger.info("There are no categories to fetch! Returning empty list status.");
        } else {
            logger.info("The number of fetched categories: {}", categories.size());
        }
        return new ResponseEntity<>(categories, HttpStatus.OK);
    }
}
