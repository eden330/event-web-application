package pl.pwr.thesis.web_event_application.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import pl.pwr.thesis.web_event_application.security.jwt.AccessDeniedHandlerImpl;
import pl.pwr.thesis.web_event_application.security.jwt.AuthEntryPointJwt;
import pl.pwr.thesis.web_event_application.security.jwt.AuthTokenFilter;
import pl.pwr.thesis.web_event_application.security.jwt.JwtUtils;
import pl.pwr.thesis.web_event_application.security.service.UserDetailsServiceImpl;


@Configuration
@EnableMethodSecurity
public class WebSecurityConfig {

    private final UserDetailsServiceImpl userDetailsService;
    private final AuthEntryPointJwt unauthorizedHandler;
    private final AccessDeniedHandlerImpl accessDeniedHandler;
    private final JwtUtils jwtUtils;

    public WebSecurityConfig(UserDetailsServiceImpl userDetailsService,
                             AuthEntryPointJwt unauthorizedHandler,
                             AccessDeniedHandlerImpl accessDeniedHandler, JwtUtils jwtUtils) {
        this.userDetailsService = userDetailsService;
        this.unauthorizedHandler = unauthorizedHandler;
        this.accessDeniedHandler = accessDeniedHandler;
        this.jwtUtils = jwtUtils;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .exceptionHandling(exception ->
                        exception.authenticationEntryPoint(unauthorizedHandler)
                                .accessDeniedHandler(accessDeniedHandler))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/categories/**").permitAll()
                        .requestMatchers("/api/cities/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/events/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/events").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/notifications/send").permitAll()
                        .requestMatchers(HttpMethod.POST,"api/users/login").permitAll()
                        .requestMatchers(HttpMethod.POST,"api/users/register").permitAll()

                        .requestMatchers(HttpMethod.GET, "/api/users/profile").hasRole("USER")
                        .requestMatchers(HttpMethod.POST, "/api/users/logout").hasRole("USER")
                        .requestMatchers(HttpMethod.POST, "/api/users/update-preferences").hasRole("USER")
                        .requestMatchers(HttpMethod.POST, "/api/users/handle-favourite-event/**").hasRole("USER")
                        .requestMatchers(HttpMethod.GET, "/api/users/favourite-events").hasRole("USER")
                        .requestMatchers(HttpMethod.GET, "/api/users/event/recommendations").hasRole("USER")
                        .requestMatchers(HttpMethod.GET, "/api/users/events/reactions").hasRole("USER")

                        .requestMatchers(HttpMethod.GET, "/api/users").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/events/delete/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/users/delete/**").hasRole("ADMIN")

                        .anyRequest().authenticated()
                );


        http.authenticationProvider(authenticationProvider());

        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter(jwtUtils, userDetailsService);
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();

        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());

        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authConfiguration) throws Exception {
        return authConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
