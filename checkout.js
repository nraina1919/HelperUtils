
$(document).ready(function () {

    $('#CustomerPoNumberForBillToOwnAccount').keypress(function (e, i) {
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
        totalCount();
    });

    $('.billingAddressEditFakeClass').click(function () {
        $('#billingAddress-notify-modal').modal();
    });

    $('#billAddressBtn').click(function () {
        $('#billingAddress-notify-modal').modal('hide');
    });

    $('.shipAddressEditFakeClass').click(function () {
        $('#shipAddress-notify-modal').modal();
    })

    $('#shipAddressCancelBtn').click(function () {
        $('#ShippingAddress_Address_Line').val(shippingAddressDetail.Address_Line);
        $('#ShippingAddress_Address_Line1').val(shippingAddressDetail.Address_Line1);
        $('#ShippingAddress_Address_Line2').val(shippingAddressDetail.Address_Line2);
        $('#ShippingAddress_Address_Line3').val(shippingAddressDetail.Address_Line3);

        $('#ShippingAddress_Contact_No').val(shippingAddressDetail.Contact_No);
        $('#ShippingAddress_Fax').val(shippingAddressDetail.Fax);
        $('#ShippingAddress_Country_ID').val(shippingAddressDetail.Country_ID);

        $('#ShippingAddress_City').val(shippingAddressDetail.City);
        $('#ShippingAddress_State').val(shippingAddressDetail.State);
        $('#ShippingAddress_PinCode').val(shippingAddressDetail.PinCode);

        $('#shipAddress-notify-modal').modal('hide');
    })

    $('#shipAddressBtn').click(function () {
        var isError = false;
        var errorSummary = [];
        var errorCounter = 1;
        if ($.trim($('#ShippingAddress_Address_Line').val()) == ''
            && $.trim($('#ShippingAddress_Address_Line1').val()) == ''
            && $.trim($('#ShippingAddress_Address_Line2').val()) == ''
            && $.trim($('#ShippingAddress_Address_Line3').val()) == '') {
            isError = true;
            errorSummary.push(errorCounter + '. Address');
            errorCounter++;
        }

        if ($.trim($('#ShippingAddress_State').val()) == '') {
            isError = true;
            errorSummary.push(errorCounter + '. State');
            errorCounter++;
        }

        if ($.trim($('#ShippingAddress_City').val()) == '') {
            isError = true;
            errorSummary.push(errorCounter + '. City');
            errorCounter++;
        }

        if ($('#ShippingAddress_Country_ID').val() == '') {
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
            cartNotifyAlert(true, '<strong>Please provide all required fields:</strong><br/>' + errorSummary.join('<br/>'), 'Ok', undefined, undefined, undefined, true);
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
                $.get('/Checkout/ShippingAddress', function (result) {
                    shippingAddressDetail = result.data;
                    $('.shipAddressEditFakeClass').html(result.html);
                    cartNotifyAlert(true, 'Shipping Address Updated Successfully.', 'Ok', undefined, undefined, undefined, true);
                    $('#shipAddress-notify-modal').modal('hide');
                });
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

    $(document).on("click", 'a[data-type="PaymentMethod"]', function (e) {
        $('a[data-type="PaymentMethod"]').removeClass('selected');
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
        cartNotifyAlert(true, '<strong>Please provide all required fields:</strong><br/>' + errorSummary.join('<br/>'), 'Ok', 'Cancel', undefined, undefined, true);
        return;
    }

    showLoader();
    postCheckOutData();
    return;
}

function postCheckOutData() {
    $.ajax({
        type: "POST",
        url: getSiteRootPath() + "/Checkout/Index",
        data: $("#frm-checkout").serialize(), // serializes the form's elements.
        success: function (data) {
            if (data.IsError == false) {
                if (data.PGHtml) {
                    $('.checkoutPaymentGatewayForm').html(data.PGHtml);
                    $('.auth-pgform').submit();
                }
                else
                    window.location.href = getSiteRootPath() + "/Orders/OrderConfirmation";
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
