package pl.pwr.thesis.web_event_application.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import pl.pwr.thesis.web_event_application.dto.user.UserInformationDto;
import pl.pwr.thesis.web_event_application.entity.UserInformation;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface UserInformationMapper {

    UserInformation userInformationDtoToUserInformation(UserInformationDto userInformationDto);

    UserInformationDto userInformationToUserInformationDto(UserInformation userInformation);
}
