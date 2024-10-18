package pl.pwr.thesis.web_event_application.dto.authorization;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class LoginDto {

    @NotBlank
    @Size(min = 3, max = 20)
    private String username;
    @NotBlank
   // @Size(min = 8, max = 120, message = "Password must be between 8 and 120 characters")
    //@Pattern(regexp = "^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[@#$%^&+=]).*$",
      //      message = "Password must contain at least one letter, one number, and one special character")
    private String password;
}
