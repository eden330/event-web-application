package pl.pwr.thesis.web_event_application.dto.list;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddressDto {

    private Long id;
    private String street;
    private CityDto city;
}
