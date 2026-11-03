package com.notfound.bookstore.service.impl;

    import com.notfound.bookstore.exception.AppException;
    import com.notfound.bookstore.exception.ErrorCode;
    import com.notfound.bookstore.model.dto.request.addressrequest.CreateAddressRequest;
    import com.notfound.bookstore.model.dto.request.addressrequest.UpdateAddressRequest;
    import com.notfound.bookstore.model.dto.response.addressresponse.AddressResponse;
    import com.notfound.bookstore.model.entity.Address;
    import com.notfound.bookstore.model.entity.User;
    import com.notfound.bookstore.model.mapper.AddressMapper;
    import com.notfound.bookstore.repository.AddressRepository;
    import com.notfound.bookstore.security.SecurityUtils;
    import com.notfound.bookstore.service.AddressService;
    import lombok.AccessLevel;
    import lombok.RequiredArgsConstructor;
    import lombok.experimental.FieldDefaults;
    import org.springframework.stereotype.Service;
    import org.springframework.transaction.annotation.Transactional;

    import java.util.List;
    import java.util.UUID;

    @Service
    @RequiredArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
    public class AddressServiceImpl implements AddressService {

        AddressRepository addressRepository;
        AddressMapper addressMapper;
        SecurityUtils securityUtils;

        @Override
        @Transactional
        public AddressResponse createAddress(CreateAddressRequest request) {
            User currentUser = securityUtils.getCurrentUser();

            Address address = addressMapper.toAddress(request);
            address.setUser(currentUser);

            Address savedAddress = addressRepository.save(address);
            return addressMapper.toAddressResponse(savedAddress);
        }

        @Override
        @Transactional
        public AddressResponse updateAddress(UUID id, UpdateAddressRequest request) {
            Address address = addressRepository.findById(id)
                    .orElseThrow(() -> new AppException(ErrorCode.ADDRESS_NOT_FOUND));

            validateAddressOwnership(address);

            addressMapper.updateAddressFromRequest(request, address);
            Address updatedAddress = addressRepository.save(address);
            return addressMapper.toAddressResponse(updatedAddress);
        }

        @Override
        @Transactional
        public void deleteAddress(UUID id) {
            Address address = addressRepository.findById(id)
                    .orElseThrow(() -> new AppException(ErrorCode.ADDRESS_NOT_FOUND));

            validateAddressOwnership(address);
            addressRepository.delete(address);
        }

        @Override
        public AddressResponse getAddressById(UUID id) {
            Address address = addressRepository.findById(id)
                    .orElseThrow(() -> new AppException(ErrorCode.ADDRESS_NOT_FOUND));

            validateAddressOwnership(address);
            return addressMapper.toAddressResponse(address);
        }

        @Override
        public List<AddressResponse> getUserAddresses() {
            User currentUser = securityUtils.getCurrentUser();
            List<Address> addresses = addressRepository.findByUserId(currentUser.getId());
            return addressMapper.toAddressResponseList(addresses);
        }

        private void validateAddressOwnership(Address address) {
            if (!securityUtils.canAccessResource(address.getUser().getId())) {
                throw new AppException(ErrorCode.FORBIDDEN);
            }
        }
    }