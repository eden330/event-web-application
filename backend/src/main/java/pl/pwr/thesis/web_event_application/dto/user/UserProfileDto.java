package pl.pwr.thesis.web_event_application.dto.user;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class UserProfileDto {

    private String username;
    private String email;
    private UserInformationDto userInformationDto;
}
