package pl.pwr.thesis.web_event_application.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;
import pl.pwr.thesis.web_event_application.enums.EventCategory;

@Entity
@Table(name = "categories")
@NoArgsConstructor
@Data
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;
    @Column(name = "name")
    @Enumerated(EnumType.STRING)
    private EventCategory eventCategory;
    @Column(name = "image")
    private String image;
}
