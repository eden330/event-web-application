package pl.pwr.thesis.web_event_application.dto.authorization;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import pl.pwr.thesis.web_event_application.entity.Role;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class UserDto {

    private Long id;
    private String username;
    private String email;
    private List<Role> roles;
}
