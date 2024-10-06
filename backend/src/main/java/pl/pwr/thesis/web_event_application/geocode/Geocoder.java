package pl.pwr.thesis.web_event_application.geocode;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

@Service
public class Geocoder {

    @Value("${API_KEY_GEOCODING}")
    private String apiKey;
    @Value("${GEOCODING_BASE_URL}")
    private String baseUrl;
    private static final int NUMBER_OF_RETRIES = 2;
    private static final Logger logger = LoggerFactory.getLogger(Geocoder.class);

    public double[] geocodeLocation(String city, String street) {
        try {
            String apiUrl = constructApiQuery(city, street);

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(apiUrl))
                    .GET()
                    .build();

            HttpResponse<String> response =
                    client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                ObjectMapper objectMapper = new ObjectMapper();
                JsonNode rootNode = objectMapper.readTree(response.body());
                JsonNode featureNode = rootNode.get("features");

                if (featureNode != null && featureNode.isArray() && featureNode.size() > 0) {
                    JsonNode firstFeature = featureNode.get(0);
                    return convertToCoordinates(firstFeature);
                }
            } else {
                logger.error("Error in API request, status code: {}, response body: {}, URL: {}",
                        response.statusCode(), response.body(), apiUrl);
            }
        } catch (IOException | InterruptedException e) {
            logger.error("Exception during geocoding request: {}", e.getMessage());
        }

        logger.error("Geocoding failed for city: {} and street: {}," +
                " returning default null", city, street);
        return null;
    }

    public double[] geocodeLocationWithRetries(String city, String street) {
        for (int i = 0; i < NUMBER_OF_RETRIES; i++) {
            double[] result = geocodeLocation(city, street);
            if (result != null) {
                return result;
            }
        }
        logger.error("Geocoding failed after {} attempts for city: {}," +
                " street: {}", NUMBER_OF_RETRIES, city, street);
        return null;
    }

    private double[] convertToCoordinates(JsonNode firstFeature) {
        JsonNode geometryNode = firstFeature.get("geometry");
        if (geometryNode != null) {
            JsonNode coordinatesNode = geometryNode.get("coordinates");
            if (coordinatesNode != null && coordinatesNode.isArray() && coordinatesNode.size() >= 2) {
                double longitude = coordinatesNode.get(0).asDouble();
                double latitude = coordinatesNode.get(1).asDouble();
                return new double[]{latitude, longitude};
            }
        }
        return null;
    }

    private String constructApiQuery(String city, String street) {
        String fullQuery = String.join(", ", street, city);
        String encodedFullQuery = URLEncoder.encode(fullQuery, StandardCharsets.UTF_8);

        return String.format(
                baseUrl + "%s.json?key=%s&country=PL&fuzzyMatch=false",
                encodedFullQuery,
                apiKey);
    }
}
