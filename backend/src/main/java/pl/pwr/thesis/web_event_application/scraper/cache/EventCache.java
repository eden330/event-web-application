package pl.pwr.thesis.web_event_application.scraper.cache;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component
public class EventCache {

    private final CacheManager cacheManager;
    private final static String CACHE_NAME = "eventsCache";
    private final static String CACHE_KEY = "eventsMap";
    private final static Logger logger = LoggerFactory.getLogger(EventCache.class);

    public EventCache(CacheManager cacheManager) {
        this.cacheManager = cacheManager;
    }

    public Map<UUID, String> getCacheMap() {
        Cache cache = cacheManager.getCache(CACHE_NAME);
        if (cache != null) {
            Object cachedObject = cache.get(CACHE_KEY, Object.class);
            if (cachedObject instanceof Map) {
                try {
                    @SuppressWarnings("unchecked")
                    Map<UUID, String> eventsCacheMap = (Map<UUID, String>) cachedObject;
                    return eventsCacheMap;
                } catch (ClassCastException e) {
                    logger.error("Cached map is not of expected type Map<UUID, String>.", e);
                }
            }
            Map<UUID, String> newCacheMap = new HashMap<>();
            cache.put(CACHE_KEY, newCacheMap);
            return newCacheMap;
        }
        return new HashMap<>();
    }

    public boolean addEventToCache(String json, Map<UUID, String> eventsCacheMap) {
        UUID jsonUUID = UUID.nameUUIDFromBytes(json.getBytes(StandardCharsets.UTF_8));
        boolean isPresent = eventsCacheMap.containsKey(jsonUUID);
        if (!isPresent) {
            eventsCacheMap.put(jsonUUID, json);
            Cache cache = cacheManager.getCache(CACHE_NAME);
            if (cache != null) {
                cache.put(CACHE_KEY, eventsCacheMap);
            }
            return true;
        }
        return false;
    }

    public boolean clearCache() {
        Cache cache = cacheManager.getCache(CACHE_NAME);
        if (cache != null) {
            cache.evict(CACHE_KEY);
            cache.put(CACHE_KEY, new HashMap<>());
            logger.info("Cache cleared and initialized with empty map!");
            return true;
        }
        logger.error("Error occurred while clearing cache. Cache not found.");
        return false;
    }
}
