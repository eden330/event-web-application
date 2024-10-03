package pl.pwr.thesis.web_event_application.scraper;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.By;
import org.openqa.selenium.InvalidArgumentException;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

@Component
public class WebScraper {

    // @Value("${SCRAPING_URL}")
    private String scrapingUrl = "https://goout.net/en/poland/events/lezxxnfti/";
    private final static String EVENT_DIV_HTML = "//div[@data-v-a4578fba" +
            " and @data-v-7238e093 and .//div[contains(@class, 'column-inner')]]";
    private final static String DOC_HEIGHT = "document.body.scrollHeight";
    private final static int ATTEMPTS_NUMBER = 3;
    private final Logger logger = Logger.getLogger(WebScraper.class.getName());

    public Set<String> scrapEvents() {
        // test
//        System.out.println(dummyValues());
//        return dummyValues();

        WebDriverManager.chromedriver().setup();
        logger.log(Level.INFO, "Web driver initialized");

        ChromeOptions options = new ChromeOptions();
//        String[] optionsArray = new String[]{
//                "--headless=new", "--no-sandbox", "--disable-dev-shm-usage",
//                "--disable-gpu"
//        };
        options.addArguments();

        WebDriver driver = new ChromeDriver(options);

        try {
            driver.get(scrapingUrl);

            JavascriptExecutor executor = (JavascriptExecutor) driver;

            scrollPage(driver, executor);

            return scrapEventsJson(driver, executor);
        } catch (InvalidArgumentException e) {
            logger.log(Level.SEVERE, "Exception in scraping events");
            return new HashSet<>();
        } finally {
            logger.log(Level.INFO, "Web driver closed");
            driver.quit();
        }
    }

    private Set<String> scrapEventsJson(WebDriver driver, JavascriptExecutor executor) {
        Set<String> eventsJsonSet = new LinkedHashSet<>();

        List<WebElement> eventDivs = driver.findElements(
                By.xpath(EVENT_DIV_HTML));

        logger.log(Level.INFO, "Number of event divs read: " + eventDivs.size());

        for (WebElement eventDiv : eventDivs) {
            boolean isSuccess = false;
            int retryCount = 0;

            while (!isSuccess && retryCount < ATTEMPTS_NUMBER) {
                try {
                    executor.executeScript("arguments[0].scrollIntoView(true);", eventDiv);

                    WebElement eventJsonElem = eventDiv.findElement(
                            By.xpath(".//script[@type='application/ld+json']"));
                    String eventJson = eventJsonElem.getAttribute("innerHTML");

                    eventsJsonSet.add(eventJson);

                    isSuccess = true;

                } catch (StaleElementReferenceException e) {
                    retryCount++;
                    logger.log(Level.WARNING, "Stale element reference, retrying... (" + retryCount + "/3)");
                    if (retryCount == 3) {
                        logger.log(Level.SEVERE, "Failed to process element after retries, skipping element.");
                    }
                }
            }
        }
        eventsJsonSet.forEach(System.out::println);
        logger.log(Level.INFO, "Number of json event elements: " + eventsJsonSet.size());

        return eventsJsonSet;
    }

    private void scrollPage(WebDriver driver, JavascriptExecutor executor) {
        // for testing purposes (read just initial events)
        while (true) {
            int sizeBeforeScroll = driver.findElements(By.xpath(EVENT_DIV_HTML)).size();

            executor.executeScript("window.scrollBy(0, " + DOC_HEIGHT + ")");

            try {
                new WebDriverWait(driver, Duration.ofSeconds(5)).until(driver1 -> {
                    int sizeAfterScroll = driver.findElements(By.xpath(EVENT_DIV_HTML)).size();
                    return sizeAfterScroll > sizeBeforeScroll;
                });
            } catch (TimeoutException e) {
                logger.log(Level.WARNING, "No more events to load. Scrolling stopped!");
                break;
            }

        }
    }
}
