package pl.pwr.thesis.web_event_application.service.interfaces;

import pl.pwr.thesis.web_event_application.dto.payload.request.UpdateRequest;
import pl.pwr.thesis.web_event_application.dto.user.UserInformationDto;
import pl.pwr.thesis.web_event_application.entity.UserInformation;

public interface UserInformationService {

    void save(UserInformation userInformation);

    UserInformationDto updateUserPreferences(Long id, UpdateRequest updateRequest);
}
