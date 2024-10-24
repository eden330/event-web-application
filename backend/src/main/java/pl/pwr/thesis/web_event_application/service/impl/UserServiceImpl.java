package pl.pwr.thesis.web_event_application.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import pl.pwr.thesis.web_event_application.dto.payload.response.JwtResponse;
import pl.pwr.thesis.web_event_application.dto.user.UserProfileDto;
import pl.pwr.thesis.web_event_application.entity.Category;
import pl.pwr.thesis.web_event_application.entity.City;
import pl.pwr.thesis.web_event_application.entity.Role;
import pl.pwr.thesis.web_event_application.entity.User;
import pl.pwr.thesis.web_event_application.entity.UserInformation;
import pl.pwr.thesis.web_event_application.enums.UserRole;
import pl.pwr.thesis.web_event_application.exception.UserAlreadyExistsException;
import pl.pwr.thesis.web_event_application.mapper.UserMapper;
import pl.pwr.thesis.web_event_application.repository.CategoryRepository;
import pl.pwr.thesis.web_event_application.repository.CityRepository;
import pl.pwr.thesis.web_event_application.repository.RoleRepository;
import pl.pwr.thesis.web_event_application.repository.UserInformationRepository;
import pl.pwr.thesis.web_event_application.repository.UserRepository;
import pl.pwr.thesis.web_event_application.security.jwt.JwtUtils;
import pl.pwr.thesis.web_event_application.security.service.UserDetailsImpl;
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
    private final UserInformationRepository userInformationRepository;
    private final PasswordEncoder encoder;
    private final UserMapper userMapper;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    public UserServiceImpl(UserRepository userRepository,
                           RoleRepository roleRepository,
                           CategoryRepository categoryRepository,
                           CityRepository cityRepository,
                           UserInformationRepository userInformationRepository,
                           PasswordEncoder encoder,
                           UserMapper userMapper,
                           AuthenticationManager authenticationManager,
                           JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.categoryRepository = categoryRepository;
        this.cityRepository = cityRepository;
        this.userInformationRepository = userInformationRepository;
        this.encoder = encoder;
        this.userMapper = userMapper;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
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

        UserInformation userInformation = new UserInformation(categories,city);
        userInformation.setUser(user);

        userInformationRepository.save(userInformation);

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
        var us = userRepository.findById(userId);
        System.out.println(us);
        return userRepository.findById(userId)
                .map(userMapper::userToProfileDto)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}
