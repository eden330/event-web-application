package pl.pwr.thesis.web_event_application.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import pl.pwr.thesis.web_event_application.dto.list.AddressDto;
import pl.pwr.thesis.web_event_application.entity.Address;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface AddressMapper {
    AddressDto addressToDto(Address address);

    Address addressDtoToAddress(AddressDto addressDto);
}
