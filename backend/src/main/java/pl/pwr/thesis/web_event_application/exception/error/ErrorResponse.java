package pl.pwr.thesis.web_event_application.exception.error;

import lombok.AllArgsConstructor;

@AllArgsConstructor
public class ErrorResponse {

    private String message;
    private String exception;

    public ErrorResponse(String message) {
        this.message = message;
    }
}
