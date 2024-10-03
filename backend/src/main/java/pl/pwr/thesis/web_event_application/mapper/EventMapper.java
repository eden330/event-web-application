package pl.pwr.thesis.web_event_application.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import pl.pwr.thesis.web_event_application.dto.EventDto;
import pl.pwr.thesis.web_event_application.entity.Event;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface EventMapper {
    EventDto eventToDto(Event event);

    Event eventDtoToEvent(EventDto eventDto);

}
