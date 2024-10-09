package pl.pwr.thesis.web_event_application.mapper.list;

import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import pl.pwr.thesis.web_event_application.dto.list.LocationDto;
import pl.pwr.thesis.web_event_application.entity.Location;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface LocationMapper {
    LocationDto locationToDto(Location location);

    Location locationDtoToLocation(LocationDto locationDto);
}
