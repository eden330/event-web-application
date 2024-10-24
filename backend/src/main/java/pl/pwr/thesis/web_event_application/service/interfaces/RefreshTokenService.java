package pl.pwr.thesis.web_event_application.service.interfaces;

import org.springframework.http.ResponseCookie;
import pl.pwr.thesis.web_event_application.dto.payload.response.RefreshTokenResponse;
import pl.pwr.thesis.web_event_application.entity.RefreshToken;

import java.util.Optional;

public interface RefreshTokenService {

    Optional<RefreshToken> findByToken(String token);

    RefreshToken createRefreshToken(Long userId);

    RefreshToken verifyExpiration(RefreshToken refreshToken);

    ResponseCookie createRefreshTokenCookie(Long userId);

    void deleteByUserId(Long userId);

    RefreshTokenResponse getRefreshToken(String refreshToken);

}
