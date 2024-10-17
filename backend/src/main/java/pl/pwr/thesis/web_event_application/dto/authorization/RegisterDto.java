package pl.pwr.thesis.web_event_application.dto.authorization;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class RegisterDto {

    private String username;
    private String email;
    private String password;

}
