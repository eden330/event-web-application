package pl.pwr.thesis.web_event_application.geocode;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.text.similarity.LevenshteinDistance;
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
import java.text.Normalizer;
import java.util.Locale;

@Service
public class Geocoder {

    @Value("${api.key.geocoding}")
    private String apiKey;
    @Value("${geocoding.base.url}")
    private String baseUrl;
    private static final Logger logger = LoggerFactory.getLogger(Geocoder.class);

    public double[] geocodeLocation(String city, String street) {
        return geocodeLocation(city, street, false);
    }

    private String createUrl(String city, String street) {
        String fullQuery = URLEncoder.encode(street + ", " + city, StandardCharsets.UTF_8);
        if (street.isBlank()) {
            fullQuery = URLEncoder.encode(city, StandardCharsets.UTF_8);
        }
        return String.format(baseUrl + "?query=%s&country=PL&lang=en", fullQuery);
    }

    private double[] handleResponse(HttpResponse<String> response, boolean isFallback,
                                    String originalCity, String apiUrl) throws JsonProcessingException {
        if (response.statusCode() == 200) {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode rootNode = objectMapper.readTree(response.body());
            JsonNode featureNode = rootNode.get("addresses");

            if (featureNode != null && featureNode.isArray() && !featureNode.isEmpty()) {
                JsonNode firstAddress = featureNode.get(0);
                String responseCity = normalizeCityName(firstAddress.get("city").asText());

                if (isCityNameMatch(originalCity, responseCity)
                        || responseCity.toLowerCase().contains(originalCity.toLowerCase())) {
                    double latitude = firstAddress.get("latitude").asDouble();
                    double longitude = firstAddress.get("longitude").asDouble();
                    return new double[]{latitude, longitude};
                } else if (!isFallback) {
                    return geocodeLocation(originalCity, "", true);
                }
            }
            return geocodeLocation(originalCity, "", true);
        } else {
            logger.error("Error in API request, status code: {}, response body: {}, URL: {}",
                    response.statusCode(), response.body(), apiUrl);
        }
        return null;
    }


    private double[] geocodeLocation(String city, String street, boolean isFallback) {
        try {
            var apiUrl = createUrl(city, street);

            URI uri = URI.create(apiUrl);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(uri)
                    .header("Authorization", apiKey)
                    .GET()
                    .build();
            HttpClient client = HttpClient.newHttpClient();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            return handleResponse(response, isFallback, city, apiUrl);

        } catch (IOException | InterruptedException e) {
            logger.error("Exception during geocoding request: {}", e.getMessage());
        }

        logger.error("Geocoding failed for city: {} and street: {}," +
                " returning default null", city, street);
        return null;
    }

    private String normalizeCityName(String cityName) {
        String normalized = Normalizer.normalize(cityName, Normalizer.Form.NFD)
                .replaceAll("[\\p{InCombiningDiacriticalMarks}]", "");
        return normalized.toLowerCase(Locale.ROOT);
    }

    private boolean isCityNameMatch(String originalCity, String responseCity) {
        String normalizedOriginalCity = normalizeCityName(originalCity);
        String normalizedResponseCity = normalizeCityName(responseCity);

        if (normalizedOriginalCity.equals(normalizedResponseCity)) {
            return true;
        }

        // Use Levenshtein distance for a fuzzy match
        LevenshteinDistance levenshtein = new LevenshteinDistance();
        int distance = levenshtein.apply(normalizedOriginalCity, normalizedResponseCity);

        return distance <= 2;  // Allow minor differences (like "Cracow" and "Krakow")
    }
}