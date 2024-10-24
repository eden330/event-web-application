package pl.pwr.thesis.web_event_application.service.interfaces;

import pl.pwr.thesis.web_event_application.dto.authorization.LoginDto;
import pl.pwr.thesis.web_event_application.dto.authorization.RegisterDto;
import pl.pwr.thesis.web_event_application.dto.authorization.UserDto;
import pl.pwr.thesis.web_event_application.dto.payload.response.JwtResponse;
import pl.pwr.thesis.web_event_application.dto.user.UserProfileDto;

public interface UserService {

    UserDto registerUser(RegisterDto registerDto);

    JwtResponse authenticateUser(LoginDto loginDto);

    UserProfileDto getUserProfile(Long userId);
}
