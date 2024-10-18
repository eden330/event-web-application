package pl.pwr.thesis.web_event_application.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import pl.pwr.thesis.web_event_application.dto.list.LocationDto;
import pl.pwr.thesis.web_event_application.dto.map.LocationDtoMap;
import pl.pwr.thesis.web_event_application.entity.Location;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING,
        uses = {AddressMapper.class, CityMapper.class})
public interface LocationMapper {
    LocationDto locationToDto(Location location);

    Location locationDtoToLocation(LocationDto locationDto);

    LocationDtoMap locationToDtoMap(Location location);

    Location locationDtoMapToLocation(LocationDtoMap locationDtoMap);
}
