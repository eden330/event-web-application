package pl.pwr.thesis.web_event_application.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.pwr.thesis.web_event_application.service.interfaces.NotificationService;

@RestController
@RequestMapping("api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private static final Logger logger = LoggerFactory.getLogger(NotificationController.class);

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping("/send")
    public ResponseEntity<String> sendNotifications() {
        logger.info("Received request to send notifications");
        try {
            notificationService.sendNotifications();
            return ResponseEntity.ok("Notifications sent successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error sending notifications: " + e.getMessage());
        }
    }
}
