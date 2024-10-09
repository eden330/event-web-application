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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import pl.pwr.thesis.web_event_application.scraper.cache.EventCache;

import java.time.Duration;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Component
public class WebScraper {

     @Value("${SCRAPING_URL}")
    private String scrapingUrl;
    private final static String EVENT_DIV_HTML = "//div[@data-v-a4578fba" +
            " and @data-v-7238e093 and .//div[contains(@class, 'column-inner')]]";
    private final static String DOC_HEIGHT = "document.body.scrollHeight";
    private final static int ATTEMPTS_NUMBER = 3;
    private final EventCache eventCache;
    private static final Logger logger = LoggerFactory.getLogger(WebScraper.class);

    public WebScraper(EventCache eventCache) {
        this.eventCache = eventCache;
    }

    public Set<String> scrapEvents() {
        WebDriverManager.chromedriver().setup();
        logger.info("Web driver initialized");

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
            logger.error("Exception in scraping events", e);
            return new HashSet<>();
        } finally {
            logger.info("Web driver closed");
            driver.quit();
        }
    }

    private Set<String> scrapEventsJson(WebDriver driver, JavascriptExecutor executor) {
        Set<String> eventsJsonSet = new LinkedHashSet<>();

        List<WebElement> eventDivs = driver.findElements(
                By.xpath(EVENT_DIV_HTML));

        logger.info("Number of event divs read: " + eventDivs.size());

        Map<UUID, String> eventsCacheMap = eventCache.getCacheMap();

        for (WebElement eventDiv : eventDivs) {
            boolean isSuccess = false;
            int retryCount = 0;

            while (!isSuccess && retryCount < ATTEMPTS_NUMBER) {
                try {
                    executor.executeScript("arguments[0].scrollIntoView(true);", eventDiv);

                    WebElement eventJsonElem = eventDiv.findElement(
                            By.xpath(".//script[@type='application/ld+json']"));
                    String eventJson = eventJsonElem.getAttribute("innerHTML");

                    boolean isAdded = eventCache.addEventToCache(eventJson, eventsCacheMap);
                    if (isAdded) {
                        eventsJsonSet.add(eventJson);
                        //logger.info("New event added to result set: {}", eventJson);
                    } else {
                        logger.info("Duplicate event found, skipping: {}", eventJson);
                    }
                    isSuccess = true;

                } catch (StaleElementReferenceException e) {
                    retryCount++;
                    logger.warn("Stale element reference, retrying... (" + retryCount + "/3)");
                    if (retryCount == 3) {
                        logger.warn("Failed to process element after retries, skipping element.");
                    }
                }
            }
        }
       //  eventsJsonSet.forEach(System.out::println);
        logger.info("Number of json event elements: " + eventsJsonSet.size());

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
                logger.warn("No more events to load. Scrolling stopped!");
                break;
            }
        }
    }
}
