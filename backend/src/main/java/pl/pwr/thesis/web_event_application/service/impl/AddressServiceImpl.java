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

    private final AddressRepository addressRepository;
    private static final Logger logger = LoggerFactory.getLogger(CityServiceImpl.class);

    public AddressServiceImpl(AddressRepository addressRepository) {
        this.addressRepository = addressRepository;
    }

    @Override
    @Transactional
    public Address findOrSaveAddress(Address address) {
        try {
            return addressRepository.findAddressByStreetAndCity(address.getStreet(), address.getCity())
                    .orElseGet(() -> addressRepository.save(address));
        } catch (Exception e) {
            logger.error("Error in saving address: {} to database", address.getStreet(), e);
            throw new RuntimeException(e);
        }
    }
}
