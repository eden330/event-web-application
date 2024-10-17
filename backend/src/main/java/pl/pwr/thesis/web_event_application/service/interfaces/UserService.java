package pl.pwr.thesis.web_event_application.service.interfaces;

import pl.pwr.thesis.web_event_application.dto.authorization.RegisterDto;
import pl.pwr.thesis.web_event_application.entity.User;

public interface UserService {

    User registerUser(RegisterDto registerDto);

}
