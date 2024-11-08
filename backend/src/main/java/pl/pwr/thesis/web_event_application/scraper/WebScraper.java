package pl.pwr.thesis.web_event_application.scraper;

import org.openqa.selenium.By;
import org.openqa.selenium.ElementClickInterceptedException;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import pl.pwr.thesis.web_event_application.scraper.cache.EventCache;

import java.net.MalformedURLException;
import java.net.URL;
import java.time.Duration;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Component
public class WebScraper {

    @Value("${scraping.url}")
    private String scrapingUrl;
    @Value("${selenium.url}")
    private String seleniumUrl;
    private final static String EVENT_DIV_HTML =
            "//div[@data-v-a4578fba and @data-v-7238e093 and .//div[contains(@class, 'column-inner')]]";
    private final EventCache eventCache;
    private static final int TOTAL_ATTEMPTS = 3;
    private static final Logger logger = LoggerFactory.getLogger(WebScraper.class);

    public WebScraper(EventCache eventCache) {
        this.eventCache = eventCache;
    }

    public WebDriver setupDriver() {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless"); 
        options.addArguments("--no-sandbox"); 
        options.addArguments("--disable-dev-shm-usage"); 
        options.addArguments("--disable-gpu"); 
        options.addArguments("--remote-allow-origins=*"); 

        try {
            return new RemoteWebDriver(new URL(seleniumUrl), options);
        } catch (MalformedURLException e) {
            throw new RuntimeException("Failed to connect to Selenium Chrome container", e);
        }
    }

    public Set<String> scrapEvents() {
        WebDriver driver = setupDriver();

        logger.info("Web driver initialized");

        try {
            driver.get(scrapingUrl);
            dismissOverlay(driver);

            JavascriptExecutor executor = (JavascriptExecutor) driver;

            scrollToAbsoluteBottom(driver, executor);

            executor.executeScript("window.scrollTo(0, 0);");
            logger.info("Scrolled back to the top of the page.");

            return scrapEventsJson(driver, executor);
        } catch (Exception e) {
            logger.error("Exception in scraping events", e);
            return new HashSet<>();
        } finally {
            logger.info("Web driver closed");
            driver.quit();
        }
    }

    private void dismissOverlay(WebDriver driver) {
        try {
            ((JavascriptExecutor) driver).executeScript(
                    "document.querySelector('.goout-cookie-overlay').style.display='none';");
            logger.info("Cookie overlay dismissed using JavaScript.");

        } catch (Exception e) {
            logger.warn("Failed to dismiss overlay: " + e.getMessage());
        }
    }

    private void scrollToAbsoluteBottom(WebDriver driver, JavascriptExecutor executor) {
        final long[] lastHeight = {(long) executor.executeScript("return document.body.scrollHeight")};
        final long[] startTime = {System.currentTimeMillis()};

        while (true) {
            if (isFooterVisible(driver)) {
                executor.executeScript("arguments[0].scrollIntoView({block: 'start'});",
                        driver.findElement(By.xpath("//footer")));
                logger.info("Scrolled to the beginning of the footer.");
            } else {
                executor.executeScript("window.scrollTo(0, document.body.scrollHeight);");
                logger.info("Scrolling to the bottom of the page...");
            }

            boolean heightChanged = new WebDriverWait(driver, Duration.ofSeconds(5))
                    .until((ExpectedCondition<Boolean>) driver1 -> {
                        long newHeight = (long) executor.executeScript("return document.body.scrollHeight");
                        if (newHeight != lastHeight[0]) {
                            lastHeight[0] = newHeight;
                            startTime[0] = System.currentTimeMillis();
                            return true;
                        }
                        return System.currentTimeMillis() - startTime[0] > 5000;
                    });

            if (!heightChanged) {
                logger.info("No height change detected for 5 seconds. Assuming end of content.");
                break;
            }

            if (!clickShowMoreEventsButton(driver)) {
                logger.info("No more 'Show more events' button found. Assuming end of content.");
                break;
            }
        }
    }


    private boolean isFooterVisible(WebDriver driver) {
        try {
            WebElement footer = driver.findElement(By.xpath("//footer"));
            return footer.isDisplayed();
        } catch (NoSuchElementException e) {
            return false;
        }
    }

    private boolean clickShowMoreEventsButton(WebDriver driver) {
        try {
            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));
            WebElement loadMoreButton = wait.until(driver1 -> {
                try {
                    WebElement button = driver1.findElement(By.xpath("//button[contains(text(), 'Show more events')]"));
                    if (button.isDisplayed() && button.isEnabled()) {
                        ((JavascriptExecutor) driver1).executeScript("arguments[0].scrollIntoView({block: 'center'});", button);
                        return button;
                    }
                    return null;
                } catch (NoSuchElementException e) {
                    return null;
                }
            });

            if (loadMoreButton != null) {
                loadMoreButton.click();
                logger.info("Clicked 'Show more events' button.");
                return true;
            } else {
                logger.info("No 'Show more events' button found.");
                return false;
            }
        } catch (TimeoutException e) {
            logger.info("Timeout while trying to find or click 'Show more events' button.");
            return false;
        } catch (ElementClickInterceptedException | StaleElementReferenceException e) {
            logger.warn("Exception when clicking button, retrying overlay dismissal.");
            dismissOverlay(driver);
            return false;
        }
    }

    private Set<String> scrapEventsJson(WebDriver driver, JavascriptExecutor executor) {
        Set<String> eventsJsonSet = new LinkedHashSet<>();
        List<WebElement> eventDivs = driver.findElements(By.xpath(EVENT_DIV_HTML));
        Map<UUID, String> eventsCacheMap = eventCache.getCacheMap();
        logger.info("Number of event divs read: {}", eventDivs.size());

        for (WebElement eventDiv : eventDivs) {
            boolean isSuccess = false;
            int retryCount = 0;

            while (!isSuccess && retryCount < TOTAL_ATTEMPTS) {
                try {
                    executor.executeScript("arguments[0].scrollIntoView(true);", eventDiv);

                    WebElement eventJsonElem = eventDiv.findElement(
                            By.xpath(".//script[@type='application/ld+json']"));
                    String eventJson = eventJsonElem.getAttribute("innerHTML");

                    boolean isAdded = eventCache.addEventToCache(eventJson, eventsCacheMap);
                    if (isAdded) {
                        eventsJsonSet.add(eventJson);
                    } else {
                        logger.info("Duplicate event found, skipping.");
                    }
                    isSuccess = true;

                } catch (StaleElementReferenceException e) {
                    retryCount++;
                    logger.warn("Stale element reference, retrying... ({}/3)", retryCount);
                    if (retryCount == TOTAL_ATTEMPTS) {
                        logger.warn("Failed to process element after retries, skipping element.");
                    }
                } catch (NoSuchElementException e) {
                    logger.warn("No JSON data found in this event div.");
                    break;
                }
            }
        }
        logger.info("Number of unique JSON event elements collected: {}", eventsJsonSet.size());
        return eventsJsonSet;
    }
}
