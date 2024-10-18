package pl.pwr.thesis.web_event_application.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import pl.pwr.thesis.web_event_application.dto.list.CityDto;
import pl.pwr.thesis.web_event_application.entity.City;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface CityMapper {

    CityDto cityToDto(City city);

    City cityDtoToCity(CityDto cityDto);
}
