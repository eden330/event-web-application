package pl.pwr.thesis.web_event_application.scraper.cache;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;

@Configuration
public class CacheInitializer {

    private final CacheManager cacheManager;
    private final static String CACHE_NAME = "eventsCache";
    private final static String CACHE_KEY = "eventsMap";
    private static final Logger logger = LoggerFactory.getLogger(CacheInitializer.class);

    public CacheInitializer(CacheManager cacheManager) {
        this.cacheManager = cacheManager;
    }

    @PostConstruct
    public void initCache() {
        Cache cache = cacheManager.getCache(CACHE_NAME);
        if (cache != null) {
            cache.put(CACHE_KEY, new HashMap<>());
            logger.info("Cache initialized with empty map");
        } else {
            logger.warn("Cache with {} name not found!", CACHE_NAME);
        }
    }
}
