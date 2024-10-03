package pl.pwr.thesis.web_event_application;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.StandardEnvironment;

import java.util.HashMap;
import java.util.Map;

@SpringBootApplication
public class WebEventApplication {

    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.load();

        Map<String, Object> envVars = new HashMap<>();
        envVars.put("DB_URL", dotenv.get("DB_URL"));
        envVars.put("DB_USERNAME", dotenv.get("DB_USERNAME"));
        envVars.put("DB_PASSWORD", dotenv.get("DB_PASSWORD"));
        envVars.put("SCRAPING_URL", dotenv.get("SCRAPING_URL"));

        StandardEnvironment env = new StandardEnvironment();
        env.getPropertySources().addLast(new MapPropertySource("dotenvVars", envVars));


        SpringApplication app = new SpringApplication(WebEventApplication.class);
        app.setEnvironment(env);
        app.run(args);
    }

    
}
