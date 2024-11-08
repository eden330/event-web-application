package pl.pwr.thesis.web_event_application.scraper;

import com.fasterxml.jackson.core.JacksonException;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.ObjectCodec;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;
import pl.pwr.thesis.web_event_application.entity.Address;
import pl.pwr.thesis.web_event_application.entity.Category;
import pl.pwr.thesis.web_event_application.entity.City;
import pl.pwr.thesis.web_event_application.entity.Event;
import pl.pwr.thesis.web_event_application.entity.Location;
import pl.pwr.thesis.web_event_application.enums.EventCategory;
import pl.pwr.thesis.web_event_application.machinelearning.EventClassifier;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

public class EventDeserializer extends JsonDeserializer<Event> {

    @Override
    public Event deserialize(JsonParser jsonParser, DeserializationContext deserializationContext) throws IOException, JacksonException {
        ObjectCodec codec = jsonParser.getCodec();
        JsonNode node = codec.readTree(jsonParser);

        Event event = new Event();
        event.setName(node.get("name").asText());
        event.setDescription(node.get("description").asText());
        event.setImage(node.get("image").asText());

        Category category = new Category();
        var mlCategory = EventClassifier.predictCategory(event.getDescription());
        EventCategory eventCategory = EventCategory.valueOf(mlCategory);
        category.setEventCategory(eventCategory);
        event.setCategory(category);

        String startDateString = node.get("startDate").asText();
        String endDateString = node.get("endDate").asText();

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEE MMM dd yyyy HH:mm:ss 'GMT'Z '('zzzz')'", Locale.ENGLISH);


        LocalDateTime startDate = ZonedDateTime.parse(startDateString, formatter).toLocalDateTime();
        LocalDateTime endDate = ZonedDateTime.parse(endDateString, formatter).toLocalDateTime();

        event.setStartDate(startDate);
        event.setEndDate(endDate);

        JsonNode locationNode = node.get("location");
        Location location = new Location();
        location.setName(locationNode.get("name").asText());

        JsonNode addressNode = locationNode.get("address");
        Address address = new Address();
        address.setStreet(addressNode.get("streetAddress").asText());

        City city = new City();
        city.setName(addressNode.get("addressLocality").asText());

        location.setAddress(address);
        address.setCity(city);
        event.setLocation(location);

        return event;
    }
}
