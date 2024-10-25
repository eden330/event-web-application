package pl.pwr.thesis.web_event_application.dto.user;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import pl.pwr.thesis.web_event_application.dto.list.CategoryDto;

@Getter
@Setter
@AllArgsConstructor
public class FavouriteEventDto {
    private Long id;
    private String name;
    private String image;
    private CategoryDto category;
}
