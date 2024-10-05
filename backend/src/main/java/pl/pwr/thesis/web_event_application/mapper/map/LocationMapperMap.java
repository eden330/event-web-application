package pl.pwr.thesis.web_event_application.mapper.map;

import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import pl.pwr.thesis.web_event_application.dto.map.LocationDtoMap;
import pl.pwr.thesis.web_event_application.entity.Location;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface LocationMapperMap {
    LocationDtoMap locationToDtoMap(Location location);

    Location locationDtoMapToLocation(LocationDtoMap locationDtoMap);
}
