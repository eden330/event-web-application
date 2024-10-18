package pl.pwr.thesis.web_event_application.service.impl;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import pl.pwr.thesis.web_event_application.dto.payload.request.RefreshTokenRequest;
import pl.pwr.thesis.web_event_application.dto.payload.response.RefreshTokenResponse;
import pl.pwr.thesis.web_event_application.entity.RefreshToken;
import pl.pwr.thesis.web_event_application.exception.TokenRefreshException;
import pl.pwr.thesis.web_event_application.repository.RefreshTokenRepository;
import pl.pwr.thesis.web_event_application.repository.UserRepository;
import pl.pwr.thesis.web_event_application.security.jwt.JwtUtils;
import pl.pwr.thesis.web_event_application.service.interfaces.RefreshTokenService;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenServiceImpl implements RefreshTokenService {

    @Value("${jwt.refresh.expiration}")
    private Long refreshTokenDurationMs;

    private final RefreshTokenRepository refreshTokenRepository;

    private final UserRepository userRepository;

    private final JwtUtils jwtUtils;

    public RefreshTokenServiceImpl(RefreshTokenRepository refreshTokenRepository,
                                   UserRepository userRepository,
                                   JwtUtils jwtUtils) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.userRepository = userRepository;
        this.jwtUtils = jwtUtils;
    }

    @Override
    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    @Override
    @Transactional
    public RefreshToken createRefreshToken(Long userId) {
        refreshTokenRepository.deleteByUser(userRepository.findById(userId).get());

        RefreshToken refreshToken = new RefreshToken();

        refreshToken.setUser(userRepository.findById(userId).get());
        refreshToken.setExpiryDate(LocalDateTime.now().plusSeconds(refreshTokenDurationMs / 1000));
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken = refreshTokenRepository.save(refreshToken);

        return refreshToken;
    }

    @Override
    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.delete(token);
            throw new TokenRefreshException(token.getToken(),
                    "Refresh token was expired. Please make a new signin request");
        }

        return token;
    }

    @Override
    public int deleteByUserId(Long userId) {
        return refreshTokenRepository.deleteByUser(userRepository.findById(userId).get());
    }

    @Override
    public RefreshTokenResponse getRefreshToken(RefreshTokenRequest request) {
        String requestRefreshToken = request.getRefreshToken();

//        var us = findByToken(requestRefreshToken);
//        verifyExpiration(us.get());
//        var use = us.get().getUser();
        return findByToken(requestRefreshToken)
                .map(this::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String token = jwtUtils.generateJwtTokenFromUsername(user.getUsername());
                    return new RefreshTokenResponse(
                            token,
                            requestRefreshToken,
                            "Bearer"
                    );
                })
                .orElseThrow(() -> new TokenRefreshException(requestRefreshToken,
                        "Refresh token is not in database!"));
    }
}

