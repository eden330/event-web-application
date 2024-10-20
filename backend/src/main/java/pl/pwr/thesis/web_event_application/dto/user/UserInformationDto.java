package pl.pwr.thesis.web_event_application.dto.user;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import pl.pwr.thesis.web_event_application.dto.list.CategoryDto;
import pl.pwr.thesis.web_event_application.dto.list.CityDto;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class UserInformationDto {

    private List<CategoryDto> category;

    private CityDto city;
}
