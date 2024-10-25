package pl.pwr.thesis.web_event_application.service.interfaces;

import pl.pwr.thesis.web_event_application.dto.authorization.LoginDto;
import pl.pwr.thesis.web_event_application.dto.authorization.RegisterDto;
import pl.pwr.thesis.web_event_application.dto.authorization.UserDto;
import pl.pwr.thesis.web_event_application.dto.payload.request.UpdateRequest;
import pl.pwr.thesis.web_event_application.dto.payload.response.JwtResponse;
import pl.pwr.thesis.web_event_application.dto.user.FavouriteEventDto;
import pl.pwr.thesis.web_event_application.dto.user.UserInformationDto;
import pl.pwr.thesis.web_event_application.dto.user.UserProfileDto;

import java.util.List;

public interface UserService {

    UserDto registerUser(RegisterDto registerDto);

    JwtResponse authenticateUser(LoginDto loginDto);

    UserProfileDto getUserProfile(Long userId);

    void deleteUserById(Long id);

    UserInformationDto updateUserPreferences(Long userId, UpdateRequest updateRequest);

    boolean handleFavouriteEvent(Long userId, Long eventId);

    boolean checkIfEventIsFavourite(Long userId, Long eventId);

    List<FavouriteEventDto> findFavouriteEvents(Long userId);

    boolean handleEventReaction(Long userId, Long eventId, String reactionType);
}
