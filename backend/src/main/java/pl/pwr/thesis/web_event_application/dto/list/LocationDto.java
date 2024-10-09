package pl.pwr.thesis.web_event_application.dto.list;

import lombok.Getter;
import lombok.Setter;
import pl.pwr.thesis.web_event_application.dto.list.AddressDto;

@Getter
@Setter
public class LocationDto {

    private Long id;
    private String name;
    private AddressDto address;
}
