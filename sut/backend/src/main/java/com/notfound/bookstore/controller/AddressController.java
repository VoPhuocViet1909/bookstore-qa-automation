package com.notfound.bookstore.controller;

import com.notfound.bookstore.model.dto.request.addressrequest.CreateAddressRequest;
import com.notfound.bookstore.model.dto.request.addressrequest.UpdateAddressRequest;
import com.notfound.bookstore.model.dto.response.ApiResponse;
import com.notfound.bookstore.model.dto.response.addressresponse.AddressResponse;
import com.notfound.bookstore.service.AddressService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
* Controller xử lý các chức năng liên quan đến địa chỉ người dùng
* Cho phép người dùng quản lý danh sách địa chỉ giao hàng
* Bao gồm thêm, sửa, xóa, xem địa chỉ
*/
@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AddressController {

     AddressService addressService;

     /**
      * Thêm địa chỉ mới cho người dùng hiện tại
      *
      * @param request Thông tin địa chỉ bao gồm recipientName, phoneNumber, street, ward, district, province, latitude, longitude
      * @return Thông tin địa chỉ vừa được tạo
      */
     @PostMapping
     @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
     public ApiResponse<AddressResponse> createAddress(@Valid @RequestBody CreateAddressRequest request) {
         AddressResponse address = addressService.createAddress(request);
         return ApiResponse.<AddressResponse>builder()
                 .code(1000)
                 .message("Thêm địa chỉ thành công")
                 .result(address)
                 .build();
     }

     /**
      * Cập nhật thông tin địa chỉ
      * Người dùng chỉ có thể cập nhật địa chỉ của chính mình, ADMIN có thể cập nhật tất cả
      *
      * @param id ID của địa chỉ cần cập nhật
      * @param request Thông tin cập nhật
      * @return Thông tin địa chỉ sau khi cập nhật
      */
     @PutMapping("/{id}")
     @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
     public ApiResponse<AddressResponse> updateAddress(
             @PathVariable UUID id,
             @Valid @RequestBody UpdateAddressRequest request) {
         AddressResponse address = addressService.updateAddress(id, request);
         return ApiResponse.<AddressResponse>builder()
                 .code(1000)
                 .message("Cập nhật địa chỉ thành công")
                 .result(address)
                 .build();
     }

     /**
      * Xóa địa chỉ
      * Người dùng chỉ có thể xóa địa chỉ của chính mình, ADMIN có thể xóa tất cả
      *
      * @param id ID của địa chỉ cần xóa
      * @return Kết quả xóa địa chỉ
      */
     @DeleteMapping("/{id}")
     @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
     public ApiResponse<Void> deleteAddress(@PathVariable UUID id) {
         addressService.deleteAddress(id);
         return ApiResponse.<Void>builder()
                 .code(1000)
                 .message("Xóa địa chỉ thành công")
                 .build();
     }

     /**
      * Lấy thông tin chi tiết của một địa chỉ
      * Người dùng chỉ có thể xem địa chỉ của chính mình, ADMIN có thể xem tất cả
      *
      * @param id ID của địa chỉ cần xem
      * @return Thông tin chi tiết của địa chỉ
      */
     @GetMapping("/{id}")
     @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
     public ApiResponse<AddressResponse> getAddressById(@PathVariable UUID id) {
         AddressResponse address = addressService.getAddressById(id);
         return ApiResponse.<AddressResponse>builder()
                 .code(1000)
                 .message("Lấy thông tin địa chỉ thành công")
                 .result(address)
                 .build();
     }

     /**
      * Lấy danh sách tất cả địa chỉ của người dùng hiện tại
      *
      * @return Danh sách địa chỉ của người dùng
      */
     @GetMapping("/user")
     @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
     public ApiResponse<List<AddressResponse>> getUserAddresses() {
         List<AddressResponse> addresses = addressService.getUserAddresses();
         return ApiResponse.<List<AddressResponse>>builder()
                 .code(1000)
                 .message("Lấy danh sách địa chỉ thành công")
                 .result(addresses)
                 .build();
     }
}