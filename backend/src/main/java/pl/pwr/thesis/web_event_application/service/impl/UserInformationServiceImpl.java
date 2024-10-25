package pl.pwr.thesis.web_event_application.service.impl;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import pl.pwr.thesis.web_event_application.dto.payload.request.UpdateRequest;
import pl.pwr.thesis.web_event_application.dto.user.UserInformationDto;
import pl.pwr.thesis.web_event_application.entity.Category;
import pl.pwr.thesis.web_event_application.entity.City;
import pl.pwr.thesis.web_event_application.entity.User;
import pl.pwr.thesis.web_event_application.entity.UserInformation;
import pl.pwr.thesis.web_event_application.mapper.UserInformationMapper;
import pl.pwr.thesis.web_event_application.repository.CategoryRepository;
import pl.pwr.thesis.web_event_application.repository.CityRepository;
import pl.pwr.thesis.web_event_application.repository.UserInformationRepository;
import pl.pwr.thesis.web_event_application.repository.UserRepository;
import pl.pwr.thesis.web_event_application.service.interfaces.UserInformationService;

import java.util.List;

@Service
public class UserInformationServiceImpl implements UserInformationService {

    private final UserInformationRepository userInformationRepository;

    private final UserRepository userRepository;

    private final CategoryRepository categoryRepository;

    private final CityRepository cityRepository;

    private final UserInformationMapper userInformationMapper;

    public UserInformationServiceImpl(UserInformationRepository userInformationRepository,
                                      UserRepository userRepository,
                                      CategoryRepository categoryRepository,
                                      CityRepository cityRepository,
                                      UserInformationMapper userInformationMapper) {
        this.userInformationRepository = userInformationRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.cityRepository = cityRepository;
        this.userInformationMapper = userInformationMapper;
    }

    @Override
    @Transactional
    public void save(UserInformation userInformation) {
        userInformationRepository.save(userInformation);
    }

    @Override
    @Transactional
    public UserInformationDto updateUserPreferences(Long userId, UpdateRequest updateRequest) {
        boolean isUpdated = false;
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "User not found with ID: " + userId));

        UserInformation userInformation = user.getUserInformation();
        if (userInformation == null) {
            throw new EntityNotFoundException(
                    "User information not found for user ID: " + userId);
        }


        userInformation.getCategories().clear();

        List<Category> updatedCategories = categoryRepository
                .findAllById(updateRequest.getCategoriesId());
        userInformation.setCategories(updatedCategories);


        if (updateRequest.getCityId() != null) {
            City updatedCity = cityRepository.findById(updateRequest.getCityId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "City not found with ID: " + updateRequest.getCityId()));


            userInformation.setCity(updatedCity);
        }


        userInformationRepository.save(userInformation);

        return userInformationMapper.userInformationToUserInformationDto(userInformation);
    }

}
