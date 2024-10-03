package pl.pwr.thesis.web_event_application.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.pwr.thesis.web_event_application.entity.Address;
import pl.pwr.thesis.web_event_application.repository.AddressRepository;
import pl.pwr.thesis.web_event_application.service.interfaces.AddressService;

@Service
public class AddressServiceImpl implements AddressService {

    private final AddressRepository repository;
    private static final Logger logger = LoggerFactory.getLogger(CityServiceImpl.class);

    public AddressServiceImpl(AddressRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public Address saveAddress(Address address) {
        return repository.findAddressByStreetAndCity(address.getStreet(), address.getCity())
                .orElseGet(() -> repository.save(address));
    }
}
