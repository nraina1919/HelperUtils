var stateDetail = [];
var cityDetail = [];

$(document).ready(function () {
    if ((guestnum && guestnum > 0) || (isAuthenticatedUser && !hasCreditTerms)) {
        $('#PaymentMethod').val('CreditCard');
        totalCount();
    }

    $('#orderExpAction').click(function () {
        var $container = $('#orderExpContainer');
        var data = $.trim($('#orderExpData').val());
        if (data != '') {
            $('#divLoaderContainer').show();
            DataLayerModule.DataLayer.postRequest('/Checkout/OrderShareComment', { comment: data }, true)
            .done(function (result) {
                if (result.success) {
                    $container.html('Thank you for providing feedback regarding OffHighwayPlus.com. We value your business and appreciate your input.');
                }
                if (result.error) {
                    if (console)
                        console.log(result.detailError);
                    //cartNotifyAlert(true, '<strong>Error:</strong><br/>' + result.detailError, 'Ok', undefined, undefined, undefined, true);
                }
            })
            .always(function () {
                $('#divLoaderContainer').hide();
            });
        } else {
            cartNotifyAlert(true, 'Please enter some comment', 'Ok', undefined, undefined, undefined, true);
        }
    })

    $('#ShippingAddress_CountryCode').change(function () {
        countryCodeChange();
    });

    $('#ShippingAddress_State').change(function () {
        stateCodeChange();
    });

    $('.shipSameBillFakeClass').change(function () {
        if ($(this).is(':checked')) {
            $(this).attr('disabled', 'disabled');
            $('.shipAddressEditFakeClass').unbind('click');
            $('#ShipSameBillAddress').val(true);
            $('.shipLoaderFakeClass').show();
            $.get('/Checkout/ShippingAddress?shipSameBillAddress=true&shipCompanyName=' + shippingAddressDetail.userCompanyForOrder, function (result) {
                $('.shipSameBillFakeClass').removeAttr('disabled');
                $('.shipAddressEditFakeClass').unbind('click');
                $('.shipAddressEditFakeClass').bind('click', openShippingModalDetail);
                $('.shipLoaderFakeClass').hide();
                shippingAddressDetail = result.data;
                $('.shipAddressEditFakeClass').html(result.html);
                updateShippingModal();
            });
        }
        else {
            $(this).attr('disabled', 'disabled');
            $('.shipAddressEditFakeClass').unbind('click');
            $('#ShipSameBillAddress').val(false);
            $('.shipLoaderFakeClass').show();

            var shipClientAddress = new Object();
            shipClientAddress.addressID = shippingAddressDetailOriginal.Address_ID;
            shipClientAddress.addressShortName = shippingAddressDetailOriginal.Address_Short_Name;

            shipClientAddress.addressLine = shippingAddressDetailOriginal.Address_Line;
            shipClientAddress.addressLine1 = shippingAddressDetailOriginal.Address_Line1;
            shipClientAddress.addressLine2 = shippingAddressDetailOriginal.Address_Line2;
            shipClientAddress.addressLine3 = shippingAddressDetailOriginal.Address_Line3;
            shipClientAddress.city = shippingAddressDetailOriginal.City;
            shipClientAddress.state = shippingAddressDetailOriginal.State;
            shipClientAddress.pinCode = shippingAddressDetailOriginal.PinCode;
            shipClientAddress.zip = shippingAddressDetailOriginal.Zip;
            shipClientAddress.addressCountryID = shippingAddressDetailOriginal.Country_ID;

            shipClientAddress.countryCode = shippingAddressDetailOriginal.CountryCode;
            shipClientAddress.contactNo = shippingAddressDetailOriginal.Contact_No;
            shipClientAddress.fax = shippingAddressDetailOriginal.Fax;
            shipClientAddress.countryName = shippingAddressDetailOriginal.Country;
            shipClientAddress.AddressType = shippingAddressDetailOriginal.AddressType;
            //shipClientAddress.addressCreatedDate = shippingAddressDetail.Created_Date;
            //shipClientAddress.addressUpdatedDate = shippingAddressDetail.Updated_Date;


            $.get('/Checkout/ShippingAddress?checkoutShippingAddress=' + JSON.stringify(shipClientAddress) + '&shipCompanyName=' + shippingAddressDetailOriginal.userCompanyForOrder, function (result) {
                $('.shipSameBillFakeClass').removeAttr('disabled');
                $('.shipAddressEditFakeClass').unbind('click');
                $('.shipAddressEditFakeClass').bind('click', openShippingModalDetail);
                $('.shipLoaderFakeClass').hide();
                shippingAddressDetail = result.data;
                $('.shipAddressEditFakeClass').html(result.html);
                updateShippingModal();
            });
        }
    })

    $('.shipAddressEditFakeClass').click(function () {
        openShippingModalDetail();
    })

    $('#shipAddressCancelBtn').click(function () {
        $('#shipAddress-notify-modal').modal('hide');
    })

    $('#shipAddressBtn').click(function () {
        var isError = false;
        var errorSummary = [];
        var errorCounter = 1;

        if ($.trim($('#ShippingAddress_userCompanyForOrder').val()) == '') {
            isError = true;
            errorSummary.push(errorCounter + '. Company Name');
            errorCounter++;
        }

        if ($.trim($('#ShippingAddress_Address_Line').val()) == ''
            && $.trim($('#ShippingAddress_Address_Line1').val()) == ''
            && $.trim($('#ShippingAddress_Address_Line2').val()) == ''
            && $.trim($('#ShippingAddress_Address_Line3').val()) == '') {
            isError = true;
            errorSummary.push(errorCounter + '. Address');
            errorCounter++;
        }

        if ($.trim($('#ShippingAddress_State').val()) == '' && $('#ShippingAddress_State').is('select')) {
            isError = true;
            errorSummary.push(errorCounter + '. State');
            errorCounter++;
        }

        if ($.trim($('#ShippingAddress_City').val()) == '') {
            isError = true;
            errorSummary.push(errorCounter + '. City');
            errorCounter++;
        }

        if ($('#ShippingAddress_CountryCode').val() == '') {
            isError = true;
            errorSummary.push(errorCounter + '. Country');
            errorCounter++;
        }

        if ($.trim($('#ShippingAddress_PinCode').val()) == '') {
            isError = true;
            errorSummary.push(errorCounter + '. Zip Code');
            errorCounter++;
        }

        if (isError) {
            cartNotifyAlert(true, '<strong>Please provide inputs into all required fields:</strong><br/>' + errorSummary.join('<br/>'), 'Ok', undefined, undefined, undefined, true);
            return;
        }
        $('#shipAddressBtn').hide();
        $('#shipAddressCancelBtn').hide();
        $('.shipEditLoadingFakeClass').show();
        $.ajax({
            url: '/Checkout/ShippingAddress',
            type: 'POST',
            data: $('#shipAddressForm').serialize(),
            success: function (datum) {
                if (datum.success) {
                    shippingAddressDetail = datum.shipAddress;
                    shippingAddressDetailOriginal = datum.shipAddress;
                    $('.shipSameBillFakeClass').prop('checked', false);
                    $('#ShipSameBillAddress').val(false);
                    $('.shipAddressEditFakeClass').html(datum.shipperhtml);
                    cartNotifyAlert(true, 'Shipping Address Updated Successfully.', 'Ok', undefined, undefined, undefined, true);
                    $('#shipAddress-notify-modal').modal('hide');
                }

                //$.get('/Checkout/ShippingAddress?checkoutShippingAddress=' + $('#shipAddressForm').serialize(), function (result) {
                //    $('.shipSameBillFakeClass').prop('checked', false);
                //    $('#ShipSameBillAddress').val(false);
                //    shippingAddressDetail = result.data;
                //    $('.shipAddressEditFakeClass').html(result.html);
                //    cartNotifyAlert(true, 'Shipping Address Updated Successfully.', 'Ok', undefined, undefined, undefined, true);
                //    $('#shipAddress-notify-modal').modal('hide');
                //});
            },
            error: function (xhr, text, status) {
                cartNotifyAlert(true, status, 'Ok', undefined, undefined, undefined, true);
            },
            complete: function () {
                $('#shipAddressBtn').show();
                $('#shipAddressCancelBtn').show();
                $('.shipEditLoadingFakeClass').hide();
            }
        });
    })

    $('#CustomerPoNumberForBillToOwnAccount').keypress(function (e, i) {
        var regex = new RegExp('^[a-zA-Z 0-9]*$');
        if (!regex.test(String.fromCharCode(e.which))) {
            return false
        }
    })

    $('#ShippingAddress_Contact_No').keypress(function (e, i) {
        var regex = new RegExp('^[a-zA-Z 0-9]*$');
        if (!regex.test(String.fromCharCode(e.which))) {
            return false
        }
    })

    $('#ShippingAddress_Fax').keypress(function (e, i) {
        var regex = new RegExp('^[a-zA-Z 0-9]*$');
        if (!regex.test(String.fromCharCode(e.which))) {
            return false
        }
    })

    $('#LocalCarrier').change(function () {
        var selectTemplate = '<option selected="selected" value="0">Select shipper</option>';
        if ($(this).val() == '1') {
            $(carrierData).each(function (i, e) {
                if (e.Carrier == '1') {
                    selectTemplate += '<option value="' + e.ServiceLevel + '">' + e.ServiceLevelText + '</option>';
                }
            });
        }
        else if ($(this).val() == '3') {
            $(carrierData).each(function (i, e) {
                if (e.Carrier == '3') {
                    selectTemplate += '<option value="' + e.ServiceLevel + '">' + e.ServiceLevelText + '</option>';
                }
            });
        }
        else if ($(this).val() == '100') {
            $(carrierData).each(function (i, e) {
                if (e.Carrier == '100') {
                    selectTemplate += '<option value="' + e.ServiceLevel + '">' + e.ServiceLevelText + '</option>';
                }
            });
        }

        $('#ShippingMethod').empty().append(selectTemplate);
    })

    $('#ShippingPreference').change(function () {
        if ($(this).val() == ShippingPreference.AxletechPrepay) {//axletechprepay = 2
            $('.carrierSvcLevelValidationFakeClass').hide();
            $('#LocalCarrier').val(0);
            $('#LocalCarrier').attr('disabled', 'disabled');
            $('#ShippingMethod').val(0);
            $('#ShippingMethod').attr('disabled', 'disabled');
            $('#LCAccountNo').attr('disabled', 'disabled');
            $('#LCAccountNo').val('');
        } else {
            $('.carrierSvcLevelValidationFakeClass').show();
            $('#LocalCarrier').removeAttr('disabled');
            $('#ShippingMethod').removeAttr('disabled');
            $('#LCAccountNo').removeAttr('disabled');
        }

        totalCount();
    });

    $('.billingAddressEditFakeClass').click(function () {
        $('#billingAddress-notify-modal').modal();
    });

    $('#billAddressBtn').click(function () {
        $('#billingAddress-notify-modal').modal('hide');
    });

    $(document).on("click", 'a[data-type="PaymentMethod"]', function (e) {
        $('a[data-type="PaymentMethod"]').removeClass('selected');
        var shippingPreference = $('#ShippingPreference').val();

        if ($(this).data('mode') == 'CreditCard') {
            $('.poRequiredFakeClass').removeClass('checkoutPoBillField');
            $('.poRequiredFakeClass').html('')
        }
        else {
            $('.poRequiredFakeClass').addClass('checkoutPoBillField');
            $('.poRequiredFakeClass').html('*')
        }

        $(this).addClass('selected');
        $('#PaymentMethod').val($(this).attr('data-mode'));
        totalCount();
    });

    $(document).on("click", "input[data-type='checkout-submit']", function () {
        validateCheckoutForm();
    });

});

function showAllNote(eleClass, eleRemoveClass, src) {
    var $ele = $('.' + eleClass);
    $ele.removeClass(eleRemoveClass);
    $ele.html($ele.next().val());
    $('.' + src).hide();
}

function validateCheckoutForm() {
    var isError = false;
    var errorSummary = [];
    var ctr = 1;
    var $errorFocusElement = undefined;
    var hasPaymentSelected = false;
    var isGuestCheckout = false;
    if (guestnum && guestnum > 0) {
        isGuestCheckout = true;
    }

    $("[data-type='PaymentMethod']").each(function (i, v) {
        if ($(v).hasClass('selected'))
            hasPaymentSelected = true;
    })

    if (!hasPaymentSelected) {
        isError = true;
        errorSummary.push(ctr++ + '. Payment Method.');
        if ($errorFocusElement == undefined) {
            $errorFocusElement = $("[data-type='PaymentMethod']").first();
        }
    }

    if (!isGuestCheckout && $('.carrierSvcLevelValidationFakeClass').is(':visible')) {
        if ($('#LocalCarrier').val() == 0) {
            isError = true;
            errorSummary.push(ctr++ + '. Carrier.');
            if ($errorFocusElement == undefined) {
                $errorFocusElement = $('#LocalCarrier');
            }
        }

        if ($('#ShippingMethod').val() == 0) {
            isError = true;
            errorSummary.push(ctr++ + '. Service Level.');
            if ($errorFocusElement == undefined) {
                $errorFocusElement = $('#ShippingMethod');
            }
        }

        if ($.trim($('#LCAccountNo').val()) == '') {
            isError = true;
            errorSummary.push(ctr++ + '. Account #.');
            if ($errorFocusElement == undefined) {
                $errorFocusElement = $('#LCAccountNo');
            }
        }
    }

    if ($('.checkoutPoBillField').length > 0 && $('#CustomerPoNumberForBillToOwnAccount').val() == '') {
        isError = true;
        errorSummary.push(ctr++ + '. PO Number.');
        if ($errorFocusElement == undefined) {
            $errorFocusElement = $('#CustomerPoNumberForBillToOwnAccount');
        }
    }

    if (!$('#tcb').is(':checked')) {
        isError = true;
        errorSummary.push(ctr++ + '. Please read and accept Terms and Conditions.');
        if ($errorFocusElement == undefined) {
            $errorFocusElement = $('#tcb');
        }
    }

    if (restrictedCountryData && restrictedCountryData.length > 0) {
        if (shippingAddressDetail) {
            $.each(restrictedCountryData, function (i, country) {
                if (country.Country_ID == shippingAddressDetail.Country_ID) {
                    isError = true;
                    errorSummary.push(ctr++ + '. The order placement is not allowed for country <strong>' + $.trim(country.CountryName) + '</strong>. Please contact customer representative.');
                    return false;
                }
            });
        }
    }

    if (isError) {
        if ($errorFocusElement)
            $errorFocusElement.focus();
        if (ctr == 2 && errorSummary.length > 0) {
            errorSummary[0] = errorSummary[0].replace('1.', '');
        }

        cartNotifyAlert(true, '<strong>Please provide inputs into all required fields:</strong><br/>' + errorSummary.join('<br/>'), 'Ok', 'Cancel', undefined, undefined, true);
        return;
    }

    showLoader();
    scrollToElement();
    postCheckOutData();
    return;
}

function postCheckOutData() {
    var shipClientAddress = new Object();
    shipClientAddress.addressID = shippingAddressDetail.Address_ID;
    shipClientAddress.addressShortName = shippingAddressDetail.Address_Short_Name;

    shipClientAddress.addressLine = shippingAddressDetail.Address_Line;
    shipClientAddress.addressLine1 = shippingAddressDetail.Address_Line1;
    shipClientAddress.addressLine2 = shippingAddressDetail.Address_Line2;
    shipClientAddress.addressLine3 = shippingAddressDetail.Address_Line3;
    shipClientAddress.city = shippingAddressDetail.City;
    shipClientAddress.state = shippingAddressDetail.State;
    shipClientAddress.pinCode = shippingAddressDetail.PinCode;
    shipClientAddress.zip = shippingAddressDetail.Zip;
    shipClientAddress.addressCountryID = shippingAddressDetail.Country_ID;

    shipClientAddress.countryCode = shippingAddressDetail.CountryCode;
    shipClientAddress.contactNo = shippingAddressDetail.Contact_No;
    shipClientAddress.fax = shippingAddressDetail.Fax;
    shipClientAddress.countryName = shippingAddressDetail.Country;
    shipClientAddress.AddressType = shippingAddressDetail.AddressType;

    $('#CheckoutUserShipCompany').val(shippingAddressDetail.userCompanyForOrder);
    //shipClientAddress.addressCreatedDate = shippingAddressDetail.Created_Date;
    //shipClientAddress.addressUpdatedDate = shippingAddressDetail.Updated_Date;

    $.ajax({
        type: "POST",
        url: getSiteRootPath() + "/Checkout/Index",
        data: $("#frm-checkout").serialize() + '&checkoutAddress=' + JSON.stringify(shipClientAddress).replace(/\&/g, "%26"), // serializes the form's elements.
        success: function (data) {
            if (data.IsError == false) {
                if (data.PGHtml) {
                    $('.checkoutPaymentGatewayForm').html(data.PGHtml);
                    $('.auth-pgform').submit();
                }
                else
                    window.location.href = getSiteRootPath() + "/orders/orderconfirmation";
            }
            else {
                cartNotifyAlert(true, data.Message, 'Ok', undefined, undefined, undefined, true);
                hideLoader();
            }
        },
        error: function (xhr, text, status) {
            cartNotifyAlert(true, status, 'Ok', undefined, undefined, undefined, true);
            hideLoader();
        },
        complete: function () {

        }
    });
}

function showLoader() {
    $("#divLoaderContainer").show();
}

function hideLoader() {
    $("#divLoaderContainer").hide();
}

function openShippingModalDetail() {
    updateShippingModal();
    $('#shipAddress-notify-modal').modal();
}

function updateShippingModal() {
    if (shippingAddressDetail) {
        $('#ShippingAddress_Address_Line').val(shippingAddressDetail.Address_Line);
        $('#ShippingAddress_Address_Line1').val(shippingAddressDetail.Address_Line1);
        $('#ShippingAddress_Address_Line2').val(shippingAddressDetail.Address_Line2);
        $('#ShippingAddress_Address_Line3').val(shippingAddressDetail.Address_Line3);

        $('#ShippingAddress_Contact_No').val(shippingAddressDetail.Contact_No);
        $('#ShippingAddress_Fax').val(shippingAddressDetail.Fax);
        $('#ShippingAddress_CountryCode').val(shippingAddressDetail.CountryCode);
        $('#ShippingAddress_PinCode').val(shippingAddressDetail.PinCode);
        $('#ShippingAddress_userCompanyForOrder').val(shippingAddressDetail.userCompanyForOrder);

        countryCodeChange(this, function () {
            $('#ShippingAddress_State').val(shippingAddressDetail.State);
            stateCodeChange(this, function () {
                $('#ShippingAddress_City').val(shippingAddressDetail.City);
            }, true);
        }, true);
    }
}

function countryCodeChange(eventObject, callback, isEntityUpdate) {
    var selectTemplate = '<option selected="selected" value="">--Select State--</option>';
    var resultState = [];
    var countryCode = $('#ShippingAddress_CountryCode').val();

    if (countryCode == undefined || countryCode == null || $.trim(countryCode) == '') {
        return;
    }

    if (countryCode == 'US' || countryCode == 'CA') {
        var $parent = $('#ShippingAddress_State').parent();
        $parent.empty();
        $parent.append('<select class=\"form-control\" id=\"ShippingAddress_State\" name=\"ShippingAddress.State\"><option selected="selected" value="">--Select State--</option></select>');
    }
    else {
        var $parent = $('#ShippingAddress_State').parent();
        $parent.empty();
        $parent.append('<input type=\"text\" class=\"form-control\" value=\"\" id=\"ShippingAddress_State\" name=\"ShippingAddress.State\" />');
        if (callback)
            callback();
        return;
    }

    //$('#ShippingAddress_City').empty().append('<option selected="selected" value="">--Select City--</option>');

    $('.stateCityLoaderFakeClass').show();
    if (isEntityUpdate && stateDetail && stateDetail.length > 0) {
        if (stateDetail && stateDetail.length > 0) {
            $(stateDetail).each(function (i, state) {
                resultState.push(state);
            })
        }

        if (resultState && resultState.length > 0) {
            $(resultState).each(function (i, rst) {
                selectTemplate += '<option value="' + rst.StateCode + '">' + rst.StateName + '</option>';
            });

            $('#ShippingAddress_State').empty().append(selectTemplate);
        }
        $('.stateCityLoaderFakeClass').hide();
        if (callback)
            callback();
    }
    else {
        getStateByCountry(countryCode, function (result) {
            if (result && result.length > 0) {
                $(result).each(function (i, state) {
                    resultState.push(state);
                })
            }

            if (resultState && resultState.length > 0) {
                $(resultState).each(function (i, rst) {
                    selectTemplate += '<option value="' + rst.StateCode + '">' + rst.StateName + '</option>';
                });

                $('#ShippingAddress_State').empty().append(selectTemplate);
            }
            $('.stateCityLoaderFakeClass').hide();
            if (callback)
                callback();
        });
    }
}

function stateCodeChange(eventObject, callback, isEntityUpdate) {
    return;

    var selectTemplate = '<option selected="selected" value="">--Select City--</option>';
    var resultCity = [];
    var stateCode = $('#ShippingAddress_State').val();
    var countryCode = $('#ShippingAddress_CountryCode').val();
    var stateId = undefined;

    $('#ShippingAddress_City').empty().append('<option selected="selected" value="">--Select City--</option>');

    if (countryCode == undefined || countryCode == null || $.trim(countryCode) == '') {
        return;
    }

    if (stateCode == undefined || stateCode == null || $.trim(stateCode) == '') {
        return;
    }

    $('.stateCityLoaderFakeClass').show();
    if (isEntityUpdate && cityDetail && cityDetail.length > 0) {
        if (cityDetail && cityDetail.length > 0) {
            $(cityDetail).each(function (i, city) {
                if (city.Cities) {
                    $(city.Cities).each(function (i, data) {
                        resultCity.push(data);
                    })
                }
            })
        }

        if (resultCity && resultCity.length > 0) {
            $(resultCity).each(function (i, city) {
                selectTemplate += '<option value="' + city + '">' + city + '</option>';
            });

            $('#ShippingAddress_City').empty().append(selectTemplate);
        }
        $('.stateCityLoaderFakeClass').hide();
        if (callback)
            callback();
    }
    else {
        getCityByState(countryCode, stateCode, function (result) {
            if (result && result.length > 0) {
                $(result).each(function (i, city) {
                    $(city.Cities).each(function (v, data) {
                        resultCity.push(data);
                    });

                    return false;
                });
            }

            if (resultCity && resultCity.length > 0) {
                $(resultCity).each(function (i, city) {
                    selectTemplate += '<option value="' + city + '">' + city + '</option>';
                });

                $('#ShippingAddress_City').empty().append(selectTemplate);
            }
            $('.stateCityLoaderFakeClass').hide();
            if (callback)
                callback();
        });
    }
}
