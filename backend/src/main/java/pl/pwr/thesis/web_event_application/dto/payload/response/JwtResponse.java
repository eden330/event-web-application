package pl.pwr.thesis.web_event_application.dto.payload.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class JwtResponse {
    private Long id;
    private String username;
    private String email;
    private List<String> roles;
    private String token;
    private String tokenType;
    private String refreshToken;

}
