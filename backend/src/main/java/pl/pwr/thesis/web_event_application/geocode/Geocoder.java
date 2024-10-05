package pl.pwr.thesis.web_event_application.geocode;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
    private String API_KEY;

    @Value("${GEOCODING_BASE_URL}")
    private String baseUrl;

    public double[] geocodeLocation(String city, String street) throws IOException, InterruptedException {
        // TODO: increase accuracy of geocoding of coordinates
        String encodedStreet = URLEncoder.encode(street, StandardCharsets.UTF_8);
        String encodedCity = URLEncoder.encode(city, StandardCharsets.UTF_8);

        String apiUrl = String.format(
                baseUrl + "?access_key=%s&query=%s&region=%s&country=PL" +
                        "&limit=1&results.latitude,results.longitude",
                API_KEY,
                encodedStreet,
                encodedCity);

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
            JsonNode resultsNode = rootNode.get("data");

            if (resultsNode.isArray() && resultsNode.size() > 0) {
                JsonNode firstResult = resultsNode.get(0);
                double latitude = firstResult.path("latitude").asDouble();
                double longitude = firstResult.path("longitude").asDouble();

                return new double[]{latitude, longitude};
            } else {
                throw new IOException("No results found for the provided location.");
            }
        } else {
            throw new IOException("Error in API request, status code: " + response.statusCode());
        }
    }
}
