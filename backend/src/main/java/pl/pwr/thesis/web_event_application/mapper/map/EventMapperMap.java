package pl.pwr.thesis.web_event_application.mapper.map;

import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import pl.pwr.thesis.web_event_application.dto.map.EventDtoMap;
import pl.pwr.thesis.web_event_application.entity.Event;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING,
        uses = {LocationMapperMap.class})
public interface EventMapperMap {
    EventDtoMap eventToDtoMap(Event event);

    Event eventDtoMapToEvent(EventDtoMap eventDtoMap);
}
