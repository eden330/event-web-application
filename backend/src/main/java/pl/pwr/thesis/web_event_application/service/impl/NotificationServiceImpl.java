package pl.pwr.thesis.web_event_application.service.impl;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import pl.pwr.thesis.web_event_application.entity.Event;
import pl.pwr.thesis.web_event_application.entity.Notification;
import pl.pwr.thesis.web_event_application.entity.User;
import pl.pwr.thesis.web_event_application.repository.EventRepository;
import pl.pwr.thesis.web_event_application.repository.NotificationRepository;
import pl.pwr.thesis.web_event_application.repository.UserRepository;
import pl.pwr.thesis.web_event_application.service.interfaces.NotificationService;

import java.io.IOException;
import java.time.LocalDate;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    @Value("${api.key.email.service}")
    private String apiKey;

    @Value("${email}")
    private String email;

    private final static int NUMBER_OF_DAYS = 1;

    UserRepository userRepository;
    EventRepository eventRepository;

    public NotificationServiceImpl(UserRepository userRepository, EventRepository eventRepository, NotificationRepository notificationRepository) {
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.notificationRepository = notificationRepository;
    }

    public void sendNotifications() {
        userRepository.findAllWithFavouriteEvents()
                .forEach(this::processUserNotification);
    }

    private boolean shouldSendNotification(Event event) {
        return event.getStartDate().toLocalDate().equals(LocalDate.now()
                .minusDays(NUMBER_OF_DAYS));
    }

    private void processUserNotification(User user) {
        user.getFavouriteEvents().stream()
                .filter(this::shouldSendNotification)
                .forEach(event -> sendNotification(user, event));
    }

    private void sendNotification(User user, Event event) {
        if (notificationRepository.existsByUserAndEvent(user, event)) {
            return;
        }
        Email from = new Email(email);
        String subject = "Reminder: Event: %s is approaching!".formatted(event.getName());
        Email to = new Email(user.getEmail());
        String htmlContent = """
                <html>
                    <body>
                        <h2>Don't Miss Your Favorite Event!</h2>
                        <p>Hi,</p>
                        <p>This is a reminder that the event <strong>%s</strong> is coming up soon!</p>
                        <p>Here are the event details:</p>
                        <ul>
                            <li><strong>Event Name:</strong> %s</li>
                            <li><strong>Start Date:</strong> %s</li>
                            <li><strong>End Date:</strong> %s</li>
                            <li><strong>Location:</strong> %s</li>
                            <li><strong>Address:</strong> %s</li>
                             <li><strong>City:</strong> %s</li>
                        </ul>
                        <p><img src="%s" alt="Event Image" style="max-width: 600px;"></p>
                        <p>We hope you enjoy the event!</p>
                    </body>
                </html>
                """.formatted(
                event.getName(),
                event.getName(),
                event.getStartDate(),
                event.getEndDate(),
                event.getLocation().getName(),
                event.getLocation().getAddress().getStreet(),
                event.getLocation().getAddress().getCity().getName(),
                event.getImage()
        );

        Content content = new Content("text/html", htmlContent);
        Mail mail = new Mail(from, subject, to, content);

        SendGrid sg = new SendGrid(apiKey);
        Request request = new Request();
        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            sg.api(request);

            Notification notification = new Notification();
            notification.setUser(user);
            notification.setEvent(event);
            notification.setSentDate(LocalDate.now());
            notificationRepository.save(notification);
        } catch (IOException ex) {
            System.out.println("Error sending email: " + ex.getMessage());
        }
    }
}
