package pl.pwr.thesis.web_event_application.dto.authorization;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class LoginDto {

    private String username;
    private String password;
}
