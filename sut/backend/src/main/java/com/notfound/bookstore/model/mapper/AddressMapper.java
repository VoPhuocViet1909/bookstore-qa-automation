package com.notfound.bookstore.model.mapper;

import com.notfound.bookstore.model.dto.request.addressrequest.CreateAddressRequest;
import com.notfound.bookstore.model.dto.request.addressrequest.UpdateAddressRequest;
import com.notfound.bookstore.model.dto.response.addressresponse.AddressResponse;
import com.notfound.bookstore.model.entity.Address;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AddressMapper {

    @Mapping(source = "provinceId", target = "provinceId")
    @Mapping(source = "districtId", target = "districtId")
    @Mapping(source = "wardCode", target = "wardCode")
   AddressResponse toAddressResponse(Address address);

   List<AddressResponse> toAddressResponseList(List<Address> addresses);

   @Mapping(target = "id", ignore = true)
   @Mapping(target = "user", ignore = true)
   Address toAddress(CreateAddressRequest request);

   @Mapping(target = "id", ignore = true)
   @Mapping(target = "user", ignore = true)
   @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
   void updateAddressFromRequest(UpdateAddressRequest request, @MappingTarget Address address);
}