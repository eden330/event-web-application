package pl.pwr.thesis.web_event_application.controller;

import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.pwr.thesis.web_event_application.dto.authorization.LoginDto;
import pl.pwr.thesis.web_event_application.dto.authorization.RegisterDto;
import pl.pwr.thesis.web_event_application.dto.authorization.UserDto;
import pl.pwr.thesis.web_event_application.dto.payload.request.RefreshTokenRequest;
import pl.pwr.thesis.web_event_application.dto.payload.response.JwtResponse;
import pl.pwr.thesis.web_event_application.dto.payload.response.RefreshTokenResponse;
import pl.pwr.thesis.web_event_application.exception.UserAlreadyExistsException;
import pl.pwr.thesis.web_event_application.exception.error.ErrorResponse;
import pl.pwr.thesis.web_event_application.service.interfaces.RefreshTokenService;
import pl.pwr.thesis.web_event_application.service.interfaces.UserService;

@RestController
@RequestMapping("api/users")
public class UserController {

    private final UserService userService;
    private final RefreshTokenService refreshTokenService;
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    public UserController(UserService userService, RefreshTokenService refreshTokenService) {
        this.userService = userService;
        this.refreshTokenService = refreshTokenService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginDto loginDto) {
        try {
            JwtResponse jwtResponse = userService.authenticateUser(loginDto);
            return ResponseEntity.ok(jwtResponse);
        } catch (AuthenticationException e) {
            logger.warn("Login failed for user: {}", loginDto.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    new ErrorResponse("Unauthorized", e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error during login: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new ErrorResponse("Error occurred during login", e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(
            @Valid @RequestBody RegisterDto registerDto) {
        try {
            UserDto user = userService.registerUser(registerDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(user);
        } catch (UserAlreadyExistsException e) {
            logger.warn("User registration failed - user already exists: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                    new ErrorResponse("User already exists", e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error occurred during registration: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new ErrorResponse("Error occurred during registration", e.getMessage())
            );
        }
    }

    @PostMapping("/refreshtoken")
    public ResponseEntity<?> refreshToken(
            @Valid @RequestBody RefreshTokenRequest request) {
        try {
            RefreshTokenResponse response = refreshTokenService.getRefreshToken(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Unexpected error during login: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new ErrorResponse("Error occurred during login", e.getMessage()));
        }
    }
}
