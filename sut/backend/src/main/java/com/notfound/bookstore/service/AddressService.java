package com.notfound.bookstore.service;

import com.notfound.bookstore.model.dto.request.addressrequest.CreateAddressRequest;
import com.notfound.bookstore.model.dto.request.addressrequest.UpdateAddressRequest;
import com.notfound.bookstore.model.dto.response.addressresponse.AddressResponse;

import java.util.List;
import java.util.UUID;

public interface AddressService {

    AddressResponse createAddress(CreateAddressRequest request);

    AddressResponse updateAddress(UUID id, UpdateAddressRequest request);

    void deleteAddress(UUID id);

    AddressResponse getAddressById(UUID id);

    List<AddressResponse> getUserAddresses();
}