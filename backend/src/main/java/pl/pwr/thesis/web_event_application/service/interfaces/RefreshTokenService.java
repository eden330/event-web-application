package pl.pwr.thesis.web_event_application.service.interfaces;

import pl.pwr.thesis.web_event_application.dto.payload.request.RefreshTokenRequest;
import pl.pwr.thesis.web_event_application.dto.payload.response.RefreshTokenResponse;
import pl.pwr.thesis.web_event_application.entity.RefreshToken;

import java.util.Optional;

public interface RefreshTokenService {

    Optional<RefreshToken> findByToken(String token);

    RefreshToken createRefreshToken(Long userId);

    RefreshToken verifyExpiration(RefreshToken refreshToken);

    int deleteByUserId(Long userId);

    RefreshTokenResponse getRefreshToken(RefreshTokenRequest request);

}
