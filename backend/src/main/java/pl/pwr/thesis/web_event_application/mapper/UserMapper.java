package pl.pwr.thesis.web_event_application.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import pl.pwr.thesis.web_event_application.dto.authorization.UserDto;
import pl.pwr.thesis.web_event_application.dto.user.UserProfileDto;
import pl.pwr.thesis.web_event_application.entity.User;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface UserMapper {
    UserDto userToDto(User user );

    User userDtoToUser(UserDto userDto);

    UserProfileDto userToProfileDto(User user);

    User userProfileDtoToUser(UserProfileDto userProfileDto);
}
