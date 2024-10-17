package pl.pwr.thesis.web_event_application.geocode;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.lang3.StringUtils;
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

    @Value("${api.key.geocoding}")
    private String apiKey;
    @Value("${geocoding.base.url}")
    private String baseUrl;
    private static final int NUMBER_OF_RETRIES = 2;
    private static final Logger logger = LoggerFactory.getLogger(Geocoder.class);

    public double[] geocodeLocation(String city, String street) {
        try {
            int index = street.indexOf("/");
            street = street.substring(0, index > 0 ? index : street.length());
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

                if (featureNode != null && featureNode.isArray() && !featureNode.isEmpty()) {
                    JsonNode accurateNode = searchForMostAccurateResult(featureNode, city, street);
                    if (accurateNode != null) {
                        return convertToCoordinates(accurateNode);
                    }
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

    private JsonNode searchForMostAccurateResult(JsonNode featureNode, String city, String street) {
        String cleanedStreet = getRidOffPrefixes(street);
        String trimmedCity = city.trim();
        JsonNode cityOnlyMatch = null;

        for (var jsonNode : featureNode) {
            String placeName = jsonNode.get("place_name").asText().trim();
            String[] placeParts = placeName.split(",");

            String placeStreet = "";
            String placeCity = " ";
            if (placeParts.length >= 3) {
                placeStreet = placeParts[0].trim();
                placeCity = placeParts[1].trim().substring(6).trim();
            } else {
                placeCity = placeParts[0].trim();
            }

            if (placeCity.equalsIgnoreCase(trimmedCity)) {
                if (StringUtils.containsIgnoreCase(placeStreet, cleanedStreet) ||
                        street.isBlank()) {
                    return jsonNode;
                }

                if (cityOnlyMatch == null) {
                    cityOnlyMatch = jsonNode;
                }
            }
        }

        return cityOnlyMatch;
    }

    private String getRidOffPrefixes(String street) {
        String prefixRegex = "(?i)(pl\\.|ul\\.|al\\.|aleja|św\\.)\\s*";
        return street.replaceAll(prefixRegex, "").trim();
    }

    public double[] geocodeLocationWithRetries(String city, String street) {
        for (int i = 0; i < NUMBER_OF_RETRIES; i++) {
            double[] result = geocodeLocation(city, street);
            if (result != null) {
                return result;
            }
            street = "";
        }
        logger.error("Geocoding failed after {} attempts for city: {}," +
                " street: {}", NUMBER_OF_RETRIES, city, street);
        return null;
    }

    private double[] convertToCoordinates(JsonNode firstFeature) {
        JsonNode coordinatesNode = firstFeature.get("center");
        if (coordinatesNode != null && coordinatesNode.isArray() && coordinatesNode.size() >= 2) {
            double longitude = coordinatesNode.get(0).asDouble();
            double latitude = coordinatesNode.get(1).asDouble();
            return new double[]{latitude, longitude};
        }
        return null;
    }

    private String constructApiQuery(String city, String street) {
        String fullQuery = street.isBlank() ?
                String.join(",", city, "Polska") :
                String.join(", ", street, city);

        String encodedFullQuery = URLEncoder.encode(fullQuery, StandardCharsets.UTF_8);

        return String.format(
                baseUrl + "%s.json?key=%s&country=PL&fuzzyMatch=false",
                encodedFullQuery,
                apiKey);
    }
}
