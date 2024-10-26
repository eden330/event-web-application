package pl.pwr.thesis.web_event_application.service.impl;

import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.pwr.thesis.web_event_application.dto.authorization.LoginDto;
import pl.pwr.thesis.web_event_application.dto.authorization.RegisterDto;
import pl.pwr.thesis.web_event_application.dto.authorization.UserDto;
import pl.pwr.thesis.web_event_application.dto.list.EventDto;
import pl.pwr.thesis.web_event_application.dto.payload.request.UpdateRequest;
import pl.pwr.thesis.web_event_application.dto.payload.response.JwtResponse;
import pl.pwr.thesis.web_event_application.dto.user.FavouriteEventDto;
import pl.pwr.thesis.web_event_application.dto.user.UserInformationDto;
import pl.pwr.thesis.web_event_application.dto.user.UserProfileDto;
import pl.pwr.thesis.web_event_application.entity.Category;
import pl.pwr.thesis.web_event_application.entity.City;
import pl.pwr.thesis.web_event_application.entity.Event;
import pl.pwr.thesis.web_event_application.entity.Role;
import pl.pwr.thesis.web_event_application.entity.User;
import pl.pwr.thesis.web_event_application.entity.UserInformation;
import pl.pwr.thesis.web_event_application.entity.embedded.Reaction;
import pl.pwr.thesis.web_event_application.enums.EventCategory;
import pl.pwr.thesis.web_event_application.enums.ReactionType;
import pl.pwr.thesis.web_event_application.enums.UserRole;
import pl.pwr.thesis.web_event_application.exception.UserAlreadyExistsException;
import pl.pwr.thesis.web_event_application.mapper.EventMapper;
import pl.pwr.thesis.web_event_application.mapper.UserMapper;
import pl.pwr.thesis.web_event_application.repository.CategoryRepository;
import pl.pwr.thesis.web_event_application.repository.CityRepository;
import pl.pwr.thesis.web_event_application.repository.EventRepository;
import pl.pwr.thesis.web_event_application.repository.ReactionRepository;
import pl.pwr.thesis.web_event_application.repository.RoleRepository;
import pl.pwr.thesis.web_event_application.repository.UserRepository;
import pl.pwr.thesis.web_event_application.repository.specification.EventSpecifications;
import pl.pwr.thesis.web_event_application.security.jwt.JwtUtils;
import pl.pwr.thesis.web_event_application.security.service.UserDetailsImpl;
import pl.pwr.thesis.web_event_application.service.interfaces.UserInformationService;
import pl.pwr.thesis.web_event_application.service.interfaces.UserService;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CategoryRepository categoryRepository;
    private final CityRepository cityRepository;
    private final ReactionRepository reactionRepository;
    private final UserInformationService userInformationService;
    private final PasswordEncoder encoder;
    private final UserMapper userMapper;
    private final EventMapper eventMapper;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);
    private final EventRepository eventRepository;

    public UserServiceImpl(UserRepository userRepository,
                           RoleRepository roleRepository,
                           CategoryRepository categoryRepository,
                           CityRepository cityRepository,
                           ReactionRepository reactionRepository,
                           UserInformationService userInformationService,
                           PasswordEncoder encoder,
                           UserMapper userMapper,
                           EventMapper eventMapper,
                           AuthenticationManager authenticationManager,
                           JwtUtils jwtUtils, EventRepository eventRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.categoryRepository = categoryRepository;
        this.cityRepository = cityRepository;
        this.reactionRepository = reactionRepository;
        this.userInformationService = userInformationService;
        this.encoder = encoder;
        this.userMapper = userMapper;
        this.eventMapper = eventMapper;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.eventRepository = eventRepository;
    }

    @Override
    @Transactional
    public UserDto registerUser(RegisterDto registerDto) {
        if (userRepository.existsByUsername(registerDto.getUsername())) {
            logger.warn("User with specified username: {} already exists",
                    registerDto.getUsername());
            throw new UserAlreadyExistsException("User with specified username already exists!");
        } else if (userRepository.existsByEmail(registerDto.getEmail())) {
            logger.warn("User with specified email: {} already exists",
                    registerDto.getEmail());
            throw new UserAlreadyExistsException("User with specified email already exists!");
        }

        if (registerDto.getCategoriesId() == null || registerDto.getCategoriesId().isEmpty()) {
            throw new IllegalArgumentException("At least one category must be selected.");
        }

        User user = new User(
                registerDto.getUsername(),
                registerDto.getEmail(),
                encoder.encode(registerDto.getPassword()));

        List<Category> categories = categoryRepository.findAllById(registerDto.getCategoriesId());
        City city = cityRepository.findById(registerDto.getCityId())
                .orElseThrow(() -> new IllegalArgumentException("City not found."));

        UserInformation userInformation = new UserInformation(categories, city);
        userInformation.setUser(user);

        userInformationService.save(userInformation);

        user.setUserInformation(userInformation);

        Set<Role> roles = new HashSet<>();
        Role userRole = roleRepository.findByName(UserRole.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Role not found."));
        roles.add(userRole);
        user.setRoles(roles);

        userRepository.save(user);
        return userMapper.userToDto(user);
    }

    @Override
    public JwtResponse authenticateUser(LoginDto loginDto) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginDto.getUsername(), loginDto.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return new JwtResponse(
                userDetails.id(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                roles,
                jwt,
                "Bearer");
    }

    @Override
    public UserProfileDto getUserProfile(Long userId) {
        return userRepository.findUserWithUserInformationById(userId)
                .map(userMapper::userToProfileDto)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    @Override
    @Transactional
    public void deleteUserById(Long id) {
        if (!userRepository.existsById(id)) {
            throw new EntityNotFoundException("User not found with ID: " + id);
        }
        userRepository.deleteById(id);
    }

    @Override
    @Transactional
    public UserInformationDto updateUserPreferences(Long userId, UpdateRequest updateRequest) {
        return userInformationService.updateUserPreferences(userId, updateRequest);
    }

    @Override
    @Transactional
    public boolean handleFavouriteEvent(Long userId, Long eventId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "User not found with ID: " + userId));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Event not found with ID: " + eventId));

        Set<Event> favouriteEvents = user.getFavouriteEvents();
        boolean isFavourite = favouriteEvents.contains(event);

        if (favouriteEvents.contains(event)) {
            favouriteEvents.remove(event);
        } else {
            favouriteEvents.add(event);
        }
        return !isFavourite;
    }

    @Override
    public boolean checkIfEventIsFavourite(Long userId, Long eventId) {
        return userRepository.isEventInUserFavourites(userId, eventId);
    }

    @Override
    public List<FavouriteEventDto> findFavouriteEvents(Long userId) {
        User user = userRepository.findUserWithFavouriteEventsById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        return user.getFavouriteEvents().stream()
                .map(eventMapper::eventToFavouriteEventDto) // Map events to DTOs
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public boolean handleEventReaction(Long userId, Long eventId, String reactionType) {
        User user = userRepository.findUserWithEventReactionsById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Event not found with ID: " + eventId));

        ReactionType newReactionType = ReactionType.valueOf(reactionType.toUpperCase());

        Reaction reaction = user.getReactions()
                .stream()
                .filter(r -> r.getEvent().equals(event))
                .findFirst()
                .orElse(null);

        if (reaction == null) {
            reaction = new Reaction(user, event, newReactionType);
            logger.info("New reaction added - {} ", reaction.getType());
            reactionRepository.save(reaction);
            return true;
        }

        if (reaction.getType().equals(newReactionType)) {
            logger.info("Reaction the same {} - removing ", reaction.getType());
            user.getReactions().remove(reaction);
            event.getReactions().remove(reaction);
            reactionRepository.delete(reaction);
            return false;
        }

        logger.info("Reaction updated - {} ", reaction.getType());
        reaction.setType(newReactionType);
        return true;
    }

    @Override
    public List<EventDto> findRecommendedEvents(Long userId, int size, int page) {
        User user = userRepository.findById(userId).orElseThrow(
                () -> new EntityNotFoundException("User not found"));

        Pageable pageable = PageRequest.of(page, size);
        var city = user.getUserInformation().getCity();
        var categories = user.getUserInformation().getCategories();

        Specification<Event> spec = Specification.where(null);

        spec = spec.and(EventSpecifications.hasCityName(city.getName()));

        List<EventCategory> eventCategories = categories.stream()
                .map(Category::getEventCategory)
                .toList();
        spec = spec.and(EventSpecifications.hasCategory(eventCategories));

        return eventRepository.findAll(spec, pageable).stream()
                .map(eventMapper::eventToDto)
                .collect(Collectors.toList());
    }
}
