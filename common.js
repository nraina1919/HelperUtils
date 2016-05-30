var XhrWebstoreSearch = [];
var XhrWebstoreSearchPager = [];
var XhrWebstoreProduct = [];

//This variable is used to hold XHR requests for webstore search. Also, used on search.js
//This variable is used to hold XHR requests for webstore product. Also, used on search.js

//This file contains the code which is common for the website

//update the user activity time
function precheckOutNewUser() {
    document.getElementById('preRegEle').style.display = 'block';
    document.getElementById('preLoginEle').style.display = 'none';
}

//function saveSearchHistory() {
//    if ($('#PageName').val() == '')
//        return;

//    $.ajax({
//        url: '/home/updatesearchhistorydate',
//        type: 'POST',
//        async: false,
//        cache: false,
//        data: { pageName: $('#PageName').val() },
//        success: function (result) {
//            if (console && console.log) {
//                console.log(result);
//            }
//        }
//    });
//}


//managage back button click (and backspace)
//var count = 0; // needed for safari
//window.onload = function () {
//    if (typeof history.pushState === "function") {
//        history.pushState("back", null, null);
//        window.onpopstate = function () {
//            history.pushState('back', null, null);
//            if (count == 1) {
//                if (window.location.pathname.toLowerCase() === "/userorders/ordersummary") {
//                    window.location = '/userorders/orders';
//                }
//                else {
//                    window.location = window.history.back();
//                    //history.go(-1);
//                }
//            }
//        };
//    }
//}

//$(window).bind('load', function () {
//    if (typeof history.pushState === "function") {
//        //history.pushState("back", null, null);
//        window.onpopstate = function () {
//            //history.pushState('back', null, null);
//            if (window.location.pathname.toLowerCase() === "/userorders/ordersummary") {
//                window.location = '/userorders/orders';
//            }
//            //else {
//            //    window.location = window.location.pathname.toLowerCase();
//            //    //return;
//            //}

//        };

//    }

//});

//setTimeout(function () { count = 1; }, 200);

$(window).bind('beforeunload', function () {
    //this will work only for Chrome
    if ($('#PageName').val() == '')
        return;

    $.ajax({
        url: '/home/updatesearchhistorydate',
        type: 'POST',
        //async: false,
        cache: false,
        data: { pageName: $('#PageName').val() },
        success: function (result) {
            if (console && console.log) {
                console.log(result);
            }
        }
    });
});

//Decimal to currency formatter, puts commas at 1000th places
Number.prototype.formatMoney = function (c, d, t) {
    var n = this,
        c = isNaN(c = Math.abs(c)) ? 2 : c,
        d = d == undefined ? "." : d,
        t = t == undefined ? "," : t,
        s = n < 0 ? "-" : "",
        i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

///Bankers rounding - use for decimal rounding
function evenRound(num, decimalPlaces) {
    var d = decimalPlaces || 0;
    var m = Math.pow(10, d);
    var n = +(d ? num * m : num).toFixed(8); // Avoid rounding errors
    var i = Math.floor(n), f = n - i;
    var e = 1e-8; // Allow for rounding errors in f
    var r = (f > 0.5 - e && f < 0.5 + e) ?
        ((i % 2 == 0) ? i : i + 1) : Math.round(n);
    return d ? r / m : r;
}

//scroll to loader - UX
function scrollToElement(elementId) {
    if (!elementId)
        elementId = 'divLoaderContainer';

    $('html, body').animate({
        scrollTop: $("#" + elementId).offset().top
    }, 500);
}

//check if IE or get IE version
function isIE() {
    var myNav = navigator.userAgent.toLowerCase();
    return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

//Code for handling show/hide events
(function ($) {
    $.each(['show', 'hide'], function (i, ev) {
        var el = $.fn[ev];
        $.fn[ev] = function () {
            this.trigger(ev);
            return el.apply(this, arguments);
        };
    });
})(jQuery);

function getStateByCountry(countryCode, callback) {
    $.get(BusinessLayerModule.BusinessLayer.Endpoints.GetStateByCountryUrl + '?countryCode=' + countryCode, function (result) {
        if (callback) {
            callback(result);
        }
    });
}

function getCityByState(countryCode, stateCode, callback) {
    $.get(BusinessLayerModule.BusinessLayer.Endpoints.GetCityByStateUrl + '?countryCode=' + countryCode + '&stateCode=' + stateCode, function (result) {
        if (callback) {
            callback(result);
        }
    });
}

function placeholderDataUpdate($placeholderInputs, summary) {
    if ($placeholderInputs && $placeholderInputs.length > 0) {
        $.each($placeholderInputs, function (idx, ele) {
            var $element = $(ele);
            if ($element.val() == '') {
                var dataArray = $element.data('placeholder').split(',');
                var tempPlaceholderData = '';
                $element.val('');
                $.each(dataArray, function (i, val) {
                    if ($.trim(val) != '') {
                        tempPlaceholderData += (val + '\n');
                    }
                });
                $element.val(summary + '\n' + tempPlaceholderData);
            }
        });
    }
}

$(function () {

    //Breadcrumb casing
    if (1 == 0 && $('.breadcrumb-aohp') && $('.breadcrumb-aohp').length > 0) {
        var $brc = $('.breadcrumb-aohp');
        $.each($brc.find('li'), function (i, v) {
            var $ele = $(v);
            if ($ele.find('a').length > 0) {
                var $link = $ele.find('a:first');
                if ($link.find('i').length == 0) {
                    $link.html(capitalizeFirstLetter($.trim($link.html().toLowerCase())));
                }
            }
            else {
                $ele.html(capitalizeFirstLetter($.trim($ele.html().toLowerCase())));
            }
        });
    }

    if (1 == 0) {
        var placeholderSummary = '';
        var $placeholderInputs = $('*[data-placeholder]');
        placeholderDataUpdate($placeholderInputs, placeholderSummary);
        $placeholderInputs.focus(function () {
            if ($(this).val().indexOf(placeholderSummary) >= 0) {
                $(this).val('');
            }
        });

        $placeholderInputs.blur(function () {
            if ($(this).val() == '') {
                placeholderDataUpdate($placeholderInputs, placeholderSummary);
            }
        })
    }

    $('#mydiv').hide();

    //for Searching Header dropdown start
    $("#SearchCategoryUL li").click(function () {
        var $this = $(this);
        var _value = $(this).attr('data-attr-value');
        $SearchCategory = $("#SearchCategory");
        $("#SearchCategoryUL li").removeClass('selected');
        $SearchCategory.html($('a', $this).html());
        $this.addClass('selected');
        BusinessLayerModule.BusinessLayer.HideToolTip($("#txtSearch"));
        if (_value == '1') {
            $("#txtSearch").attr('placeholder', 'Search Product part number').val('');
            $SearchCategory.attr('data-attr-value', '1');
        } else {
            $("#txtSearch").attr('placeholder', 'Search Website Content').val('');
            $SearchCategory.attr('data-attr-value', '2');
        }
    });
    //for Searching Header dropdown end

    // Auto suggestion from client side
    var options = {
        source: function (request, response) {
            //if ($('#cms-src').length > 0 || $("#SearchCategory").attr('data-attr-value') === '1') {
            if (!$('#txtSearch').hasClass('loadinggif')) {
                $('#txtSearch').addClass('loadinggif');
            }
            // var Url = BusinessLayerModule.BusinessLayer.Endpoints.GetAutoCompleteUrl;
            var Url = "/Base/partAutoComplete";

            var searchText = BusinessLayerModule.BusinessLayer.EncodeMaterialForAutoComplete(request.term);
            var postData = { "searchKey": searchText };
            var _limit = 10;

            // getAutoSuggestResult(searchText);
            //Url = Url.replace("{0}", searchText).replace("{1}", _limit).replace("{2}", "json");
            //DataLayerModule.DataLayer.getRequest(Url, true).done(function (data) {
            var jqXHR = DataLayerModule.DataLayer.postRequest(Url, postData, true).done(function (data) {
                var results = [];

                for (var key in data) {
                    results.push({
                        label: key + (data[key] != '' ? " - " + data[key] : ''),
                        value: key
                    });
                }

                if (Array.isArray(results) && results != '') {
                    var Name = [];
                    if (results.length < _limit) {
                        _limit = results.length;
                    }
                    for (var i = 0; i < _limit; i++) {
                        Name.push(results[i]);
                    }
                    response(Name);
                    $('#txtSearch').removeClass('loadinggif');
                    BusinessLayerModule.BusinessLayer.HideToolTip($("#txtSearch"));
                } else {
                    BusinessLayerModule.BusinessLayer.ShowToolTip($("#txtSearch"), 'Please click search');
                    $("#txtSearch").autocomplete("close");
                    $('#txtSearch').removeClass('loadinggif');
                }

            }).fail(function (jqXHR, textStatus, errorThrown) {
                BusinessLayerModule.BusinessLayer.ShowToolTip($("#txtSearch"), 'Please click search');
                $("#txtSearch").autocomplete("close");
                $('#txtSearch').removeClass('loadinggif');

                $("#txtSearch").autocomplete("close");
                $('#txtSearch').removeClass('loadinggif');
                console.log("Error in service", textStatus);
            });
        },
        messages: {
            noResults: '',
            results: function () { }
        },
        select: function (e, i) {
            //window.location.href = '/productdetails/' + $("#txtSearch").val(i.item.value);
            $("#txtSearch").val(i.item.value);
            //$("#btnSearch").trigger("click");
        },
        minLength: 3
    };

    $("body").on("select", "#txtSearch", function () {
        $(this).trigger('click');
    });

    $("body").on("click", "#txtSearch", function () {
        $(this).autocomplete(options).keyup(function (e) {
            if (e.which === 13) {
                $(".ui-menu-item").hide();
                $(".ui-menu-item").parent().hide();
            }
        });
        $(this).focus(function () {
            if (!$(this).hasClass('loadinggif')) {
                $(this).autocomplete("search");
            }
        }).autocomplete("widget").addClass("fixed-height");
    });

    $("body").on("click", "[data-toggle=tooltip]", function () {
        if ($('#cms-src').length > 0) {
            $(this).tooltip({ selector: '[data-toggle=tooltip]', trigger: 'manual' });
        }
        else
            $(this).tooltip({ selector: '[data-toggle=tooltip]' });
    });

    //$("#txtSearch").autocomplete(options).focus(function () {
    //    if (!$('#txtSearch').hasClass('loadinggif')) {
    //        $(this).autocomplete("search");
    //    }

    //}).autocomplete("widget").addClass("fixed-height");

    $("body").on("focusout mouseout", "#txtSearch", function () {
        //BusinessLayerModule.BusinessLayer.HideToolTip($("#txtSearch"));
    })

    // Search the product
    $("#btnSearch").click(function () {
        //BusinessLayerModule.BusinessLayer.HideToolTip($("#txtSearch"));
        searchProd();
    });

    // Search the product on textbox enter
    $('#txtSearch').keydown(function (e) {
        if (e.keyCode === 13) {
            e.preventDefault();
            $("#btnSearch").trigger("click");
        }
        if ($(this).val().length > 1) {
            BusinessLayerModule.BusinessLayer.HideToolTip($("#txtSearch"));
        }
    });

    //Advanced Search button click Event
    $('#btnAdvancedSearch').click(function () {
        displayInfoWindow("Service Is Unavailable.");
    });

    // Validate the quantity field 


    $(document).on('keypress', '.quantity', function (e) {

        var _maxLenght = 5;
        var _ua = window.navigator.userAgent;
        var _msie = _ua.indexOf("MSIE ");
        var _qtyVal = $(this).val().replace(/,/g, '');

        if (_msie > 0)      // If Internet Explorer, return version number
        {
            _maxLenght = 5;
        }
        var length = _qtyVal.length;
        if (length >= _maxLenght && e.keyCode != 8 && e.keyCode != 35 && e.keyCode != 36 && e.keyCode != 37 && e.keyCode != 39) {
            e.preventDefault(); return false;
        }
    });


    $(document).on('ontouchstart', '.quantity', function (e) {

        var _maxLenght = 5;
        var _ua = window.navigator.userAgent;
        var _msie = _ua.indexOf("MSIE ");
        var _qtyVal = $(this).val().replace(/,/g, '');

        if (_msie > 0)      // If Internet Explorer, return version number
        {
            _maxLenght = 5;
        }
        var length = _qtyVal.length;
        if (length > _maxLenght)
        { e.preventDefault(); return false; }
    });

    $(document).on('keydown', '.quantity', function (e) {

        //For IOS change keydown to keyup
        //var v = this.value.replace(',', '');
        //if ($.isNumeric(v) === false) {
        //    //chop off the last char entered
        //    this.value = this.value.slice(0, -1);
        //}

        // For WEB 
        // Allow: backspace, delete, tab, escape and enter
        if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110]) !== -1 ||
            // Allow: Ctrl+A
            (e.keyCode == 65 && e.ctrlKey === true) ||
            // Allow: home, end, left, right, down, up
            (e.keyCode >= 35 && e.keyCode <= 40)) {
            // let it happen, don't do anything
            return;
        }
        // Ensure that it is a number and stop the key press
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57) || e.keyCode == 221) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }

    });

    $(document).on('paste', '.quantity', function (e) {
        e.preventDefault(); //disable paste        
    });

    $('body').on('change focusout', '.quantity', function () {
        if ($(this).data('min-qty') && parseInt($(this).data('min-qty')) > 1) {
            if ($(this).val() < $(this).data('min-qty')) {
                $(this).val($(this).data('min-qty'))
            }
        }
    });

    $('body').on('change', '.quantity', function () {
        if ($(this).val() === "") {
            if ($(this).data('min-qty') && parseInt($(this).data('min-qty')) > 1) {
                $(this).val($(this).data('min-qty'));
            }
            else {
                $(this).val(1);
            }
        }
    });


    // 'Add To Cart'  button functionality for all grid
    $(document).on('click', '.add-cart', function () {
        var _isBom = $(this).attr('data-type');
        var _allowReload = $(this).attr('data-reload');
        if (_allowReload == 'True' || _allowReload == true) {
            _allowReload = true;
        }
        else { _allowReload = false; }

        var $this = $(this);
        var partId = $this.attr('data-attr-partId');
        var isCallFromProductDetails = $this.attr('data-isProductDetails');
        var qty = 0;
        var qtyObject;
        if (isCallFromProductDetails == "1") {
            qtyObject = $('#SinglePart').find('input[name="quantity"]');
            qty = qtyObject.val();
        }
        else {
            qtyObject = $this.closest('div').find('input[name="quantity"]');
            qty = qtyObject.val();
        }

        //var qty = $("[id='qty_" + partId + "']").val();
        if (typeof qty == 'undefined' || qty == 0) {
            BusinessLayerModule.BusinessLayer.ShowToolTip($(qtyObject), "Invalid Quantity");
            return;
        }

        $this.next().show();
        $this.hide();

        addToCart(partId, qty, function (msg, uiElements, responseData, isMaterialPriceError) {

            $this.next().hide();
            $this.show();

            if (msg != "exception") {
                if (isMaterialPriceError)
                    return;
                if (msg != "" && typeof msg !== 'undefined') {
                    if (isIE() != false) {
                        BusinessLayerModule.BusinessLayer.ShowToolTip($(qtyObject).next(), msg);
                    }
                    else {
                        BusinessLayerModule.BusinessLayer.ShowToolTip($(qtyObject), msg);
                    }
                } else {


                    if (_isBom == 'bom') {
                        $($this).parent('h4').hide();
                        $($this).parent('h4').parent('div').find('h4[id="' + partId + '_addedNotify"]').show();
                        $($this).closest('tr').find('.show-bom').attr('aded-bom', 'true');
                        $($this).closest('tr').find('.show-bom').attr('aded-bom-quantity', qty);
                    }
                    else {
                        if (_allowReload == true)
                        { window.location.reload(true); showLoader(); }
                        var btn = $('h4[id="' + partId + '_addedCart"]');
                        $.each(btn, function (i, item) {
                            $(item).hide();
                        });

                        var notifybtn = $('h4[id="' + partId + '_addedNotify"]');
                        $.each(notifybtn, function (i, item) {
                            $(item).show();
                        });
                    }
                }
            }
        });
    });

    //#region Loader
    function showLoader() {
        $("#divLoaderContainer").show();
    }

    function hideLoader() {
        $("#divLoaderContainer").hide();
    }

    $(document).on('click', '.cross-notify', function (e) {
        $(this).parent().parent().hide();
        $(this).parent().parent().prev().show();

        /// For BOM component details.
        $(this).closest('div[class="form-inline"]').find('.added-cart').show();
    });

    // Notify stock change icon functionality
    $(document).on('click', '.outstock', function () {
        if (!$(this).hasClass('outstockLegendFakeClass')) {
            outStockEvent($(this));
        }
    });

    // Notified stock change icon functionality
    $(document).on('click', '.outstock-filled', function () {
        outStockFilledEvent($(this));
    });

    // Notify button functionality To Open the Modal
    //$(document).on('click', '.btnNotify', function () {
    //    //notifyStock($(this));
    //});

    //Notify Email button functionality
    $(document).on('click', '#btnEmailToNotify', function () {
        var $this = $(this);
        if (!$this.hasClass('active')) {
            var $txtEmailToNotify = $('#txtEmailToNotify'),
                    emailIdText = $txtEmailToNotify.val();
            if (emailIdText === "") {
                BusinessLayerModule.BusinessLayer.ShowToolTip($txtEmailToNotify, 'Please Enter Email Id');
                return;
            }
            if (emailIdText.indexOf(',') === -1) {
                if (!ValidationModule.Validation.isValidEmail(emailIdText)) {
                    BusinessLayerModule.BusinessLayer.ShowToolTip($txtEmailToNotify, 'Invalid Email Id');
                    return;
                }
            } else {
                var emailIDList = emailIdText.split(','), i = 0;
                for (i = 0; i < emailIDList.length; i = i + 1) {
                    if (!ValidationModule.Validation.isValidEmail(emailIDList[i])) {
                        $txtEmailToNotify.focus();
                        BusinessLayerModule.BusinessLayer.ShowToolTip($txtEmailToNotify, 'Invalid Email Id');
                        return;
                    }
                }
            }
            var NotificationData = {};
            NotificationData.EmailID = emailIdText;

            var type = $this.attr('data-attr-value');
            if (type == "1") {
                // from Single products
                var partIdList = [];
                partIdList.push($this.attr('data-attr-partid'));
                $this.removeAttr('data-attr-partid');
                NotificationData.PartIdList = partIdList;

            } else if (type == "2") {
                //from grid list
                var partIdList = [];
                $('.outstock-filled').each(function () {
                    var $this = $(this);
                    partIdList.push($this.attr('data-attr-partid'));
                });
                if (partIdList.length === 0) {
                    $('#divErrorNotify').removeClass('hide').html('Please Select The Product(s) To Notify');
                    return;
                }
                NotificationData.PartIdList = partIdList;
            } else if (type == "3") {
                // from you might also consider grid
            }

            $('#divErrorNotify').addClass('hide').html('');
            $("#saveNotificationLoader").removeClass('hide');
            $this.addClass('active');
            var url = BusinessLayerModule.BusinessLayer.Endpoints.GetSendNotificationUrl;
            DataLayerModule.DataLayer.postRequest(url, NotificationData, true).done(function (data) {
                // $('#divErrorNotify').removeClass('hide').html(data.Message);
                $("#saveNotificationLoader").addClass('hide');
                $this.removeClass('active');
                $("#notifyModal").modal('hide');
                $("#message", "#divNotifyDialogue").html(data.Message);
                $("#divNotifyDialogue").modal('show');
                $('.outstock-filled').removeClass('outstock-filled').addClass('outstock');
            }).fail(function () {
                $("#saveNotificationLoader").addClass('hide');
                $this.removeClass('active');
            }).always(function () {
                if ($('.btnNotify').hasClass('stockAlertCssRequire')) {
                    $('.btnNotify').css({ 'cursor': 'not-allowed', 'opacity': '0.65', 'box-shadow': 'none' });
                    $('.btnNotify').unbind('click');
                }
            });
        }
    });

    $(document).on('keydown', '#txtEmailToNotify', function (e) {
        var $this = $(this);
        var emailIdText = $this.val();
        if (emailIdText.length === 1) {
            BusinessLayerModule.BusinessLayer.HideToolTip($this);
        }
        if (emailIdText.indexOf(',') === -1) {
            if (ValidationModule.Validation.isValidEmail(emailIdText)) {
                BusinessLayerModule.BusinessLayer.HideToolTip($this);
            }
        } else {
            var emailIDList = emailIdText.split(','), i = 0;
            for (i = 0; i < emailIDList.length; i = i + 1) {
                if (ValidationModule.Validation.isValidEmail(emailIDList[i])) {
                    BusinessLayerModule.BusinessLayer.HideToolTip($this);
                }
            }
        }

        if (e.keyCode === 13) {
            $("#btnEmailToNotify").trigger("click");
        }
    });
});

//Display the information information window
function displayInfoWindow(msg) {
    //swal("", msg);
    $("#message").html(msg);
    $("#divNotifyDialogue").modal('show');

}

function cmsSearchKeyDown(event, sourceElementId, targetClass) {
    var $src = $('#' + sourceElementId);
    var $tgt = $('.' + targetClass);
    if ($src && event.keyCode === 13) {
        searchProd(targetClass);
    }
}

function searchProd(srcClass) {
    var sText = $('#txtSearch').val();
    if (sText.trim() == '')
        return;

    $('.ui-menu-item').parent().hide();
    $('#divLoaderContainer').hide();
    $('#txtSearch').attr('disabled', 'disabled');
    XhrWebstoreSearch = [];
    if (XhrWebstoreSearchPager && XhrWebstoreSearchPager.length > 0) {
        $('.loaderFakeClass').hide();
        $.each(XhrWebstoreSearchPager, function (i, v) {
            v.abort();
        })
        XhrWebstoreSearchPager = [];
    }
    var $ctrl = undefined;
    var isCms = $('#cms-src').length;
    var tempSrcEvent = undefined;

    $ctrl = $('.' + srcClass);
    if ($ctrl && isCms) {
        tempSrcEvent = $ctrl.attr('href');
        $ctrl.attr('href', 'javascript:void(0);');
    }
    try {

        var searchText = $("#txtSearch").val();

        searchText = BusinessLayerModule.BusinessLayer.EncodeMaterial(searchText);
        //MungeParameterForUri(searchText, function (searchText) {
        if (searchText.length > 1) {
            window.location.href = getSiteRootPath() + "/search/" + searchText;

        } else {
            $('.ui-menu-item').parent().hide();
            BusinessLayerModule.BusinessLayer.ShowToolTip($("#txtSearch"), 'Please enter a minimum of 2 characters');
            $('#txtSearch').removeAttr('disabled');
        }
        // });


    }
    catch (er) {
        alert('__searchProd__' + er);
        if ($ctrl && isCms) {
            $ctrl.attr('href', tempSrcEvent);
        }
        $('#txtSearch').removeAttr('disabled');
        $('.ui-menu-item').parent().hide();
    }
}

function MungeParameterForUri(material, callback) {
    var differed = DataLayerModule.DataLayer.getRequest("/Base/MungeParameterForUri/" + material, false);
    differed.done(function (data) {
        callback && callback(data);
    }).fail(function () {
        callback && callback(BusinessLayerModule.BusinessLayer.EncodeMaterial(material));
    });
}

//function updateTableAlignment() {
//    var cssWidth = '99.5';
//    var width = window.innerWidth
//    if (width > 992) {
//        var tbodyHeight = $('.table-history').children('tbody').height();

//        if (tbodyHeight >= 605) {
//            $('table.table-history thead tr').css({ "width": cssWidth + "%" });
//            $('table.table-history thead tr th').css({ "border-bottom": "0px" });
//            $('table.table-history tbody').css({ "overflow-y": "auto" });
//        }
//    }
//}

function updateTableAlignmentCartDashboard() {
    var cssWidth = '98.5';
    var width = window.innerWidth
    if (width > 992) {
        var tbodyHeight = $('.table-dash-two').children('tbody').height();

        if (tbodyHeight >= 160) {
            $('table.table-dash-two thead tr').css({ "width": cssWidth + "%" });
            $('table.table-dash-two thead tr th').css({ "border-bottom": "0px" });
            $('table.table-dash-two tbody').css({ "overflow-y": "auto" });
        }
    }
}


function updateTableAlignmentMainCart() {
    var cssWidth = '98.2';
    var width = window.innerWidth
    if (width > 992) {
        var tbodyHeight = $('.table-aligned-cart').children('tbody').height();

        if (tbodyHeight >= 350) {
            $('table.table-aligned-cart thead tr').css({ "width": cssWidth + "%" });
            $('table.table-aligned-cart thead tr th').css({ "border-bottom": "0px" });
        }
    }
}


function updateTableAlignmentOrderConfirmation() {
    var cssWidth = '98';
    var width = window.innerWidth
    if (width > 992) {
        var tbodyHeight = $('.table-confirmation').children('tbody').height();

        if (tbodyHeight >= 430) {
            $('table.table-confirmation thead tr').css({ "width": cssWidth + "%" });
            $('table.table-confirmation thead tr th').css({ "border-bottom": "0px" });

        }
    }
}

function updateTableAlignmentCheckOut() {
    var cssWidth = '98';
    var width = window.innerWidth
    if (width > 992) {
        var tbodyHeight = $('.table-checkout').children('tbody').height();

        if (tbodyHeight >= 430) {
            $('table.table-checkout thead tr').css({ "width": cssWidth + "%" });
            $('table.table-checkout thead tr th').css({ "border-bottom": "0px" });
        }
    }
}


function updateTableAlignmentMultiPart() {
    var cssWidth = '99.4';
    var width = window.innerWidth
    if (width > 992) {
        var tbodyHeight = $('.multisearch-result').children('tbody').height();

        if (tbodyHeight >= 565) {
            $('table.multisearch-result thead tr').css({ "width": cssWidth + "%" });
            $('table.multisearch-result thead tr th').css({ "border-bottom": "0px" });
            $('table.multisearch-result tbody').css({ "overflow-y": "auto" });
            $('table.multisearch-result tbody').css({ "overflow-x": "hidden" });
        }
    }
}


$(document).ready(function () {
    $(document).on('show', '.table-history', function () {

        updateTableAlignment();
    })
    $('body').on('click', '.ui-menu-item', function () {
        //searchProd('searchCmsProdFakeClass');
        if ($.trim($('#txtSearch').val()) == '')
            return;

        var searchText = BusinessLayerModule.BusinessLayer.EncodeMaterial($('#txtSearch').val());
        window.location.href = getSiteRootPath() + '/productdetails/' + searchText;
    })

    $(document).on('show', '.table-dashboard', function () {
        updateTableAlignmentCartDashboard();
    })

    $(document).on('show', '.multisearch-result', function () {

        updateTableAlignmentMultiPart();
    })
})

$(document).on('keydown', '.numbers', function (e) {

    //For IOS change keydown to keyup
    //var v = this.value.replace(',', '');
    //if ($.isNumeric(v) === false) {
    //    //chop off the last char entered
    //    this.value = this.value.slice(0, -1);
    //}

    // For WEB 
    // Allow: backspace, delete, tab, escape and enter
    if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110]) !== -1 ||
        // Allow: Ctrl+A
        (e.keyCode == 65 && e.ctrlKey === true) ||
        // Allow: home, end, left, right, down, up
        (e.keyCode >= 35 && e.keyCode <= 40)) {
        // let it happen, don't do anything
        return;
    }
    // Ensure that it is a number and stop the key press
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57) || e.keyCode == 221) && (e.keyCode < 96 || e.keyCode > 105)) {
        e.preventDefault();
    }

});

function validateEmail(sEmail) {
    var filter = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
    if (filter.test(sEmail)) {
        return true;
    }
    else {
        return false;
    }
}

function termsConditions(showModal) {
    if (showModal)
        $('#tc-notify-modal').modal();
    else
        $('#tc-notify-modal').modal('hide');
}

function getAutoSuggestResult(searchKey) {
    var url = "/Base/partAutoComplete";
    var postData = { "searchKey": searchKey };
    var jqXHR = DataLayerModule.DataLayer.postRequest(url, "", true).done(function (data) {
    }).fail(function () {

    });
}

function notifyStock($ele) {
    //if ($($ele).attr('disabled') != 'disabled') {
    $('#divErrorNotify').addClass('hide').html('');
    $('#btnEmailToNotify').attr('data-attr-value', $($ele).attr('data-attr-value'));
    if ($($ele).attr('data-attr-value') == 1) {
        $('#btnEmailToNotify').attr('data-attr-partid', $($ele).attr('data-attr-partid'));
    }

    $("#notifyModal").modal('show');
    //}
}

function outStockEvent($ele) {
    var $this = $($ele);
    if ($this.hasClass('uiMultiResultNotifyHeaderFakeClass')) {
        return;
    }

    $($this).removeClass('outstock').addClass('outstock-filled');
    if ($('.outstock-filled').length > 0) {
        //$('.btnNotify').removeAttr('disabled');
        $('.btnNotify').bind('click', function () { notifyStock($('.btnNotify')); });
        $('.btnNotify').css({ 'cursor': '', 'opacity': '', 'box-shadow': '' });
        if ($($this).hasClass('detailExcludeFakeClass')) {
            notifyStock($ele);
        }
    }
}

function outStockFilledEvent($ele) {
    var $this = $($ele);
    $($this).removeClass('outstock-filled').addClass('outstock');
    if ($('.outstock-filled').length === 0) {
        //$('.btnNotify').attr('disabled', 'disabled');
        $('.btnNotify').css({ 'cursor': 'not-allowed', 'opacity': '0.65', 'box-shadow': 'none' });
        $('.btnNotify').unbind('click');
    }
}

$(document).ready(function () {
    if ($('#prod-detail').length > 0) {
        $('.btnNotify').bind('click', function () { notifyStock($('#singleNotify')); });
    }

    $('#orderdata').click(function () {
        updateUserDashboardCss();
        setTimeout(updateUserDashboardCss, 5);
    })
});
//    var url = "/Home/CategoriesContent";
//    var jqXHR = DataLayerModule.DataLayer.postRequest(url, "", true).done(function (data) {
//        $('#megaMenu').replaceWith(data.MegaMenuHtmlContent);
//        $('#CategoryList').replaceWith(data.footerCatoriesHtmlContent);
//    }).fail(function () {

//    });
//});




function updateSeoCss() {
    updateUserDashboardCss(true);
}

function updateCmsCss() {
    updateUserDashboardCss();
}

function updateUserDashboardCss(isSeo) {
    if (window.innerWidth > 976) {
        if (isSeo) {
            var div2 = $('.height-fake-l');
            div2.prev().css('height', (parseInt(div2.css('height')) - 42) + 'px');
        }
        else {
            var div2 = $('.height-fake-l');
            div2.prev().css('height', (parseInt(div2.css('height'))) + 'px');
        }
    }
}

