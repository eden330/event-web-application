package pl.pwr.thesis.web_event_application.service.impl;

import org.springframework.stereotype.Service;
import pl.pwr.thesis.web_event_application.entity.UserInformation;
import pl.pwr.thesis.web_event_application.repository.UserInformationRepository;
import pl.pwr.thesis.web_event_application.service.interfaces.UserInformationService;

@Service
public class UserInformationServiceImpl implements UserInformationService {

    private final UserInformationRepository userInformationRepository;

    public UserInformationServiceImpl(UserInformationRepository userInformationRepository) {
        this.userInformationRepository = userInformationRepository;
    }

    @Override
    public void saveUserInformation(UserInformation userInformation) {
        userInformationRepository.save(userInformation);
    }
}
