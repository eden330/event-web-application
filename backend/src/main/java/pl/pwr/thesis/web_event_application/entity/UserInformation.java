package pl.pwr.thesis.web_event_application.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.List;

@Entity
@Table(name = "user_detail")
@NoArgsConstructor
@Data
public class UserInformation {

    @Id
    @Column(name = "user_id")
    private Long id;
    @OneToOne
    @MapsId // indicates that the primary key values will be copied from the User entity
    // user_id is both the primary key and a foreign key.
    @JoinColumn(name = "user_id") // owning side
    @ToString.Exclude
    private User user;

    @ManyToMany
    @JoinTable(
            name = "user_detail_category",
            joinColumns = @JoinColumn(name = "user_detail_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private List<Category> categories;
    @ManyToOne
    @JoinColumn(name = "city_id")
    private City city;

    public UserInformation(List<Category> categories, City city) {
        this.categories = categories;
        this.city = city;
    }
}
