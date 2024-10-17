package pl.pwr.thesis.web_event_application.service.interfaces;

import pl.pwr.thesis.web_event_application.dto.list.CategoryDto;
import pl.pwr.thesis.web_event_application.entity.Category;

import java.util.List;


public interface CategoryService {

    List<CategoryDto> getAllCategories();

    Category findOrSaveCategory(Category category);
}
