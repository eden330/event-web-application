package pl.pwr.thesis.web_event_application.controller;

import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pl.pwr.thesis.web_event_application.dto.authorization.LoginDto;
import pl.pwr.thesis.web_event_application.dto.authorization.RegisterDto;
import pl.pwr.thesis.web_event_application.dto.authorization.UserDto;
import pl.pwr.thesis.web_event_application.dto.list.EventDto;
import pl.pwr.thesis.web_event_application.dto.payload.request.UpdateRequest;
import pl.pwr.thesis.web_event_application.dto.payload.response.JwtResponse;
import pl.pwr.thesis.web_event_application.dto.payload.response.RefreshTokenResponse;
import pl.pwr.thesis.web_event_application.dto.user.FavouriteEventDto;
import pl.pwr.thesis.web_event_application.dto.user.ReactedEventDto;
import pl.pwr.thesis.web_event_application.dto.user.UserProfileDto;
import pl.pwr.thesis.web_event_application.exception.TokenRefreshException;
import pl.pwr.thesis.web_event_application.exception.UserAlreadyExistsException;
import pl.pwr.thesis.web_event_application.exception.error.ErrorResponse;
import pl.pwr.thesis.web_event_application.security.service.UserDetailsImpl;
import pl.pwr.thesis.web_event_application.security.util.SecurityUtil;
import pl.pwr.thesis.web_event_application.service.interfaces.ReactionService;
import pl.pwr.thesis.web_event_application.service.interfaces.RefreshTokenService;
import pl.pwr.thesis.web_event_application.service.interfaces.UserService;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("api/users")
public class UserController {

    private final UserService userService;
    private final RefreshTokenService refreshTokenService;
    private final SecurityUtil securityUtil;
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    private final ReactionService reactionService;

    public UserController(UserService userService,
                          RefreshTokenService refreshTokenService,
                          SecurityUtil securityUtil, ReactionService reactionService) {
        this.userService = userService;
        this.refreshTokenService = refreshTokenService;
        this.securityUtil = securityUtil;
        this.reactionService = reactionService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(
            @Valid @RequestBody LoginDto loginDto) {
        try {
            JwtResponse jwtResponse = userService.authenticateUser(loginDto);
            ResponseCookie responseCookie = refreshTokenService.
                    createRefreshTokenCookie(jwtResponse.getId());

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, responseCookie.toString())
                    .body(jwtResponse);
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
    public ResponseEntity<?> refreshToken(HttpServletRequest request) {
        try {
            Cookie[] cookies = request.getCookies();
            String refreshToken = Arrays.stream(cookies)
                    .filter(cookie -> "refreshTokenCookie".equals(cookie.getName()))
                    .findFirst()
                    .map(Cookie::getValue)
                    .orElseThrow(() -> new TokenRefreshException(null, "Refresh token not found"));

            RefreshTokenResponse response = refreshTokenService.getRefreshToken(refreshToken);
            return ResponseEntity.ok(response);
        } catch (TokenRefreshException e) {
            logger.warn("Refresh token is expired.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    new ErrorResponse("Unauthorized", e.getMessage())
            );
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        try {
            ResponseCookie responseCookie =
                    refreshTokenService.createRefreshTokenCookie(null);
            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, responseCookie.toString())
                    .body("Logout successful!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Logout failed", e.getMessage()));
        }
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<UserProfileDto> showProfile() {
        UserDetailsImpl principal = (UserDetailsImpl) securityUtil.getCurrentUser();
        UserProfileDto userProfileDto = userService.getUserProfile(principal.id());

        return ResponseEntity.ok(userProfileDto);
    }

    @PostMapping("/delete")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> deleteUserAccount() {
        logger.info("Received request to delete user account");
        try {
            UserDetailsImpl principal = (UserDetailsImpl) securityUtil.getCurrentUser();
            if (principal != null) {
                refreshTokenService.deleteByUserId(principal.id());
                userService.deleteUserById(principal.id());
            }

            return ResponseEntity.ok("Account deleted successfully!");
        } catch (Exception e) {
            logger.error("Error occurred while deleting account: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to delete account", e.getMessage()));
        }
    }

    @PostMapping("/update-preferences")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> updateUserPreferences(
            @RequestBody UpdateRequest updateRequest) {
        logger.info("Received request to update user preferences");
        try {
            UserDetailsImpl principal = (UserDetailsImpl) securityUtil.getCurrentUser();
            if (principal == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("User is not authenticated."));
            }

            var userInformationDto =
                    userService.updateUserPreferences(principal.id(), updateRequest);

            logger.info("User preferences updated successfully for user ID: {}", principal.id());
            return ResponseEntity.status(HttpStatus.OK).body(userInformationDto);
        } catch (Exception e) {
            logger.error("Error updating user preferences: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to update account preferences", e.getMessage()));
        }
    }

    @PostMapping("/handle-favourite-event/{eventId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> handleFavouriteEvent(@PathVariable Long eventId) {
        logger.info("Received request to handle favourite event: {}", eventId);

        try {
            UserDetailsImpl principal = (UserDetailsImpl) securityUtil.getCurrentUser();

            if (principal == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("User is not authenticated."));
            }

            boolean isFavourite = userService.handleFavouriteEvent(principal.id(), eventId);

            if (isFavourite) {
                logger.info("Event {} added to favourites for user ID: {}", eventId, principal.id());
                return ResponseEntity.ok("Favourite event added successfully!");
            } else {
                logger.info("Event {} removed from favourites for user ID: {}", eventId, principal.id());
                return ResponseEntity.ok("Favourite event removed successfully!");
            }
        } catch (EntityNotFoundException e) {
            logger.error("Event or user not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("Event or user not found", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error handling favourite event: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to handle favourite event", e.getMessage()));
        }
    }

    @GetMapping("/is-favourite-event/{eventId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> checkIfFavouriteEvent(@PathVariable Long eventId) {
        logger.info("Checking if event is a favourite: {}", eventId);

        try {
            UserDetailsImpl principal = (UserDetailsImpl) securityUtil.getCurrentUser();

            if (principal == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("User is not authenticated."));
            }

            boolean isFavourite = userService.checkIfEventIsFavourite(principal.id(), eventId);
            return ResponseEntity.ok(isFavourite);
        } catch (EntityNotFoundException e) {
            logger.error("Event or user not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("Event or user not found", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error checking favourite event status: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to check favourite event status", e.getMessage()));
        }
    }

    @GetMapping("/favourite-events")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> showFavouriteEvents() {
        UserDetailsImpl principal = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long userId = principal.id();

        logger.info("Received request to fetch favourite events for user ID: {}", userId);

        try {
            List<FavouriteEventDto> favouriteEvents =
                    userService.findFavouriteEvents(userId);

            if (favouriteEvents.isEmpty()) {
                logger.warn("No favourite events found for user ID: {}", userId);
                return ResponseEntity.status(HttpStatus.NO_CONTENT)
                        .body(new ErrorResponse("No favourite events found for this user."));
            }

            logger.info("Successfully fetched {} favourite events for user ID: {}", favouriteEvents.size(), userId);
            return ResponseEntity.ok(favouriteEvents);

        } catch (EntityNotFoundException e) {
            logger.error("User not found with ID: {}", userId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("User not found", e.getMessage()));

        } catch (Exception e) {
            logger.error("Error fetching favourite events for user ID: {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error fetching favourite events", e.getMessage()));
        }
    }

    @PostMapping("/event/{eventId}/reaction")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> addEventReaction(
            @PathVariable Long eventId,
            @RequestParam String reaction
    ) {
        UserDetailsImpl principal = (UserDetailsImpl) securityUtil.getCurrentUser();
        logger.info("Received request to add Reaction - User: {} for Event {}",
                principal.id(), eventId);

        try {

            boolean isAdded = userService.handleEventReaction(principal.id(), eventId, reaction);

            logger.info("Successfully added reaction - User: {} for Event {}", principal.id(), eventId);
            return ResponseEntity.ok(isAdded);

        } catch (EntityNotFoundException e) {
            logger.error("User or Event not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("User not found", e.getMessage()));

        } catch (Exception e) {
            logger.error("Error adding event reaction for user ID: {}: {}",
                    principal.id(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error adding event reaction", e.getMessage()));
        }
    }

    @GetMapping("/event/recommendations")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> fetchEventRecommendations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        UserDetailsImpl principal = (UserDetailsImpl) securityUtil.getCurrentUser();
        logger.info("Received request to display recommendations of events for - User: {}",
                principal.id());

        try {
            List<EventDto> recommendedEvents = userService.
                    findRecommendedEvents(principal.id(), size, page);

            logger.info("Successfully fetched recommended events for - User: {}", principal.id());
            return ResponseEntity.ok(recommendedEvents);

        } catch (EntityNotFoundException e) {
            logger.error("User doesn't exist");
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("User not found", e.getMessage()));

        } catch (Exception e) {
            logger.error("Error fetching recommended Events for user ID: {}: {}",
                    principal.id(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(
                            "Error fetching recommended Events for user", e.getMessage()));
        }
    }

    @GetMapping("/events/reactions")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getUserReactedEventIds() {
        UserDetailsImpl principal = (UserDetailsImpl) securityUtil.getCurrentUser();
        Long userId = principal.id();

        try {
            List<ReactedEventDto> reactedEvents = reactionService.
                    findReactedEventIdsAndTypesByUserId(userId);
            return ResponseEntity.ok(reactedEvents);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error fetching reacted events", e.getMessage()));
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<UserDto> users = userService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            logger.error("Error fetching all users: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to fetch all users", e.getMessage()));
        }
    }

    @PostMapping("/delete/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUserByAdmin(@PathVariable Long userId) {
        logger.info("Received request to delete user with ID: {}", userId);
        try {
            userService.deleteUserByAdmin(userId);
            return ResponseEntity.ok("User deleted successfully.");
        } catch (EntityNotFoundException e) {
            logger.error("User not found with ID: {}", userId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("User not found", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error deleting user with ID {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to delete user", e.getMessage()));
        }
    }
}
