package pl.pwr.thesis.web_event_application.mapper.list;

import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import pl.pwr.thesis.web_event_application.dto.list.EventDto;
import pl.pwr.thesis.web_event_application.entity.Event;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING,
        uses = {LocationMapper.class, CategoryMapper.class})
public interface EventMapper {

    EventDto eventToDto(Event event);

    Event eventDtoToEvent(EventDto eventDto);
}
