package pl.pwr.thesis.web_event_application.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import pl.pwr.thesis.web_event_application.dto.list.CategoryDto;
import pl.pwr.thesis.web_event_application.entity.Category;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface CategoryMapper {

    CategoryDto categoryToDto(Category category);

    Category categoryDtoToCategory(CategoryDto categoryDto);
}
