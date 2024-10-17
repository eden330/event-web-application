package pl.pwr.thesis.web_event_application;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class WebEventApplication {

    public static void main(String[] args) {
        SpringApplication.run(WebEventApplication.class, args);
    }
}
