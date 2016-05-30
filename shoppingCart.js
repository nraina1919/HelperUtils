
function placeReorder(fieldsClass, contentloaderClass, buttonClass, orderId) {
    cartNotifyAlert(true, 'This action will add the item(s) of Order Id <strong>' + orderId + '</strong> to the cart.<br/>Are you sure you want to proceed ?', 'Ok', 'Cancel', function () {
        var $loader = $('.' + contentloaderClass);
        var $button = $('.' + buttonClass);
        if ($loader)
            $loader.show();
        if ($button)
            $button.hide();
        OrderSummary.Main.prepareReorder(fieldsClass,
            function (responseData) {//success callback
                updateCartCount(responseData.Count);
                cartNotifyAlert(true, 'Order Id <strong>' + orderId + '</strong> has been added to the cart.', 'Ok', 'Cancel', function () { window.location = getSiteRootPath() + '/Cart' }, undefined, true);
                if ($loader)
                    $loader.hide();
                if ($button)
                    $button.show();
            },
            function (responseData) {//error callback
                if (responseData && responseData.Exception) {
                    cartNotifyAlert(true, '<strong>Request Failed</strong><br/>' + responseData.Exception, 'Ok', 'Cancel', undefined, undefined, true);
                    if ($loader)
                        $loader.hide();
                    if ($button)
                        $button.show();
                    return;
                }
                if (responseData && responseData.Data) {
                    var _content = '<strong>Request Failed</strong><br/>';
                    var _ctr = 1;
                    $.each(responseData.Data, function (i, v) {
                        _content += '<span>' + _ctr + '. ' + v.MaterialName + ' - Error: '
                            + (v.PriceError ? 'Item is not available' : (v.MinimumOrderQuantityError ? 'Please order at least Minimum Quantity' : 'This product is not backorderable'))
                            + '</span>';
                        _content += '<br/>';
                        _ctr++;
                    });
                    cartNotifyAlert(true, _content, 'Ok', 'Cancel', undefined, undefined, true);
                }
                else {
                    alert(responseData);
                }
                if ($loader)
                    $loader.hide();
                if ($button)
                    $button.show();
            });
    }, undefined, undefined, undefined, true);
}

function EventTriggerDetail(control, controlHref, loaderControl) {
    this.control = control;
    this.controlHref = controlHref;
    this.loaderControl = loaderControl;
}


function cartNotifyAlert(isShow, content, okbtnContent, cancelBtnContent, okCallback, cancelCallback, isHideCancel, isKeepOk, isShowModalLoader) {
    $confirmAlert = $('.confirm-alert');
    $contentElement = $('.cartArchiveNotifyAlertFakeClass');
    $okBtn = $('#okRemoveCart');        //-->> CartMain page
    $cancelBtn = $('#cancelRemoveCart');//-->> CartMain page
    $loadingGif = $('.loadingFakeClass');
    var _modalLoader = $('#modal-loader');
    if (_modalLoader != undefined) {
        $(_modalLoader).hide();
    }

    $okBtn.show();
    if (isHideCancel) {
        $cancelBtn.hide();
    }
    else
        $cancelBtn.show();

    $content = content;
    if (isShow) {
        $confirmAlert.modal({
            //backdrop: 'static',
            //keyboard: false
        });
        $contentElement.html(($content == null || $content == '' || $content == undefined) ? 'No Content' : $content);
        $okBtn.html((okbtnContent == null || okbtnContent == '' || okbtnContent == undefined) ? 'Ok' : okbtnContent);
        if (!isHideCancel)
            $cancelBtn.html((cancelBtnContent == null || cancelBtnContent == '' || cancelBtnContent == undefined) ? 'Cancel' : cancelBtnContent);
        $okBtn.unbind('click');
        $okBtn.click(function () {
            if (isShowModalLoader) {
                $okBtn.hide();
                $cancelBtn.hide();
                if (_modalLoader != undefined) {
                    $(_modalLoader).show();
                }
            }
            else if (!isKeepOk) {
                $confirmAlert.modal('hide');
                $contentElement.html('');
            }
            else {
                $okBtn.hide();
                $cancelBtn.hide();
                $loadingGif.show();
            }
            if (okCallback) {
                if (isKeepOk)
                    okCallback($okBtn, $cancelBtn, $confirmAlert, $contentElement, $loadingGif);
                else
                    okCallback();
            }
        });
        if (!isHideCancel) {
            $cancelBtn.unbind('click');
            $cancelBtn.click(function () {
                $confirmAlert.modal('hide');
                $contentElement.html('');
                if (cancelCallback)
                    cancelCallback();
            });
        }
    }
    else {
        $confirmAlert.modal('hide');
        $contentElement.html('');
    }
}

/// Go to shopping cart page if user logged in.
function goToCart() {
    validateUserWithCallback(function () {
        window.location.href = getSiteRootPath() + '/cart';
    });
}

function checkUncheckCmsAddCart(ctrl) {
    var $main = $(ctrl);
    var $items = $('input[class*=cmsCartCboxMaterialFakeClass]');
    if ($main.is(':checked')) {
        $.each($items, function (i, v) {
            if (!$(v).hasClass('cmsqtyAlt')) {
                v.checked = true;
            }
        });
    }
    else {
        $.each($items, function (i, v) { v.checked = false; });
    }
}


function cmsAddCart(materialCheckClass, qtyClass, currentCustomerClass, addCartButtonMainClass) {
    var btnSrc = $('button.' + addCartButtonMainClass);
    var items = $('.' + materialCheckClass);
    var qtyElements = $('.' + qtyClass);
    var selectedItems = [];
    var uiElements = [];

    var tempTarget = btnSrc.attr('onclick');
    btnSrc.attr('onclick', 'javascript:void(0);');
    try {
        $.each(items, function (idx, val) {
            if ($(val).is(':checked')) {
                var materialId = $(val).data('material');
                var qty = undefined;
                $.each(qtyElements, function (v, e) {
                    if ($(e).attr('data-material') == materialId) {
                        qty = $(e).val();
                        var _loader = $(e).parent().find('img:first');
                        if (_loader.length == 0)
                            _loader = $(e).parent().parent().find('img:first');
                        var _btnRowAddCart = _loader.prev();
                        _loader.show();
                        _btnRowAddCart.hide();
                        uiElements.push({ Loader: _loader, RowCartBtn: _btnRowAddCart, CartBtnMain: btnSrc, CartBtnMainTarget: tempTarget });
                        return;
                    }
                })
                if (materialId && qty) {
                    selectedItems.push({ MaterialID: materialId, Quantity: qty });
                }
            }
        });
        if (selectedItems.length > 0) {
            postCartData(selectedItems, function (msg, uiElements, responeData, isMaterialPriceError) {
                if (uiElements) {
                    $.each(uiElements, function (i, v) {
                        var _partId = $(v.RowCartBtn).attr('data-attr-partId');
                        $(v.CartBtnMain).attr('onclick', v.CartBtnMainTarget);
                        $(v.Loader).hide();
                        $(v.RowCartBtn).show();
                        if (isMaterialPriceError)
                            return;
                        if (msg) {
                            if (responeData.MaterialName == _partId) {
                                var $element = $("#qty_" + _partId);
                                $element.attr('data-original-title', msg);
                                $element.tooltip('show');
                            }
                        }
                        else {
                            var btn = $('h4[id="' + _partId + '_addedCart"]');
                            $.each(btn, function (i, item) {
                                $(item).hide();
                            });

                            var notifybtn = $('h4[id="' + _partId + '_addedNotify"]');
                            $.each(notifybtn, function (i, item) {
                                $(item).show();
                            });

                        }
                    });
                }
            }, true, uiElements);
        }
        else {
            cartNotifyAlert(true, 'Please select checkboxes for items to be added to the cart.', 'Ok', 'Cancel', undefined, undefined, true);
            btnSrc.attr('onclick', tempTarget)
            if (uiElements) {
                $.each(uiElements, function (i, v) {
                    $(v.Loader).hide();
                    $(v.RowCartBtn).show();
                    $(v.CartBtnMain).attr('onclick', v.CartBtnMainTarget);
                });
            }
        }
    }
    catch (err) {
        alert('__cmsAddCart__' + err);
        if (uiElements) {
            $.each(uiElements, function (i, v) {
                $(v.Loader).hide();
                $(v.RowCartBtn).show();
                $(v.CartBtnMain).attr('onclick', v.CartBtnMainTarget);
            });
        }
    }
}

//Add single material into shopping cart.
function addToCart(materailID, quantity, callBack) {
    var isCms = false;
    if ($('#cms-src').length > 0) {
        isCms = true;
    }
    if (isCms) {
        if (materailID != "") {
            var _cart = [];
            var _quantity = undefined;
            $.each($('.quantityWebstoreSearch'), function (i, v) {
                if ($(v).attr('id') == 'qty_' + materailID) {
                    _quantity = $(v).val();
                    return;
                }
            })
            _cart.push({ MaterialID: materailID, Quantity: _quantity });
            postCartData(_cart, callBack, isCms);
        } else {
            $(".add-cart").show().next().hide();
            displayInfo('Your Cart Is Empty.');
        }
    }
    else {
        if (materailID != "") {
            var _cart = [];
            var _quantity = quantity;//$("[id='qty_" + materailID + "']").val(); //$('#qty_' + materailID).val();
            _cart.push({ MaterialID: materailID, Quantity: _quantity });
            postCartData(_cart, callBack);
        } else {
            $(".add-cart").show().next().hide();
            displayInfo('Your Cart Is Empty.');
        }
    }
}

// Add multiple items into the shopping cart.
function addMultiItemsToCart(callBack) {
    $("#myModel").modal('hide');
    var _cart = [];
    $('.itemcheck:checked').filter(function () {
        var _materailID = $(this).val();
        var _count = $(this).data('attr-count');
        var _quantity = $('input[id="qty_' + _materailID + '"][data-attr-count="' + _count + '"]').val(); //$('#qty_' + _materailID).val(); 
        _cart.push({ MaterialID: _materailID, Quantity: _quantity });
    });

    if (_cart.length == 0) {
        if ($('.itemcheck').length > 0) {
            $("#alertMsg").html("Please Select At least One Item.");
        }
        else {
            $("#alertMsg").html("Items cannot be added to the cart.");
        }
        $("#myModel").modal('show');
        $('.addmultipartProductToCart').removeClass('inactive').html('Add To Cart');
        return;
    } else {
        postCartData(_cart, callBack);
    }
}

// Post added cart items on the server.
function postCartData(cart, callBack, isCms, cmsUIElements) {
    if (cart.length > 0) {
        var _url = (isCms ? '/Cms/CmsCustomerAddToCart' : '/Cart/AddToCart');

        DataLayerModule.DataLayer.postRequest(_url, cart, true).done(function (_data) {
            if (_data.userSessionError) {
                UIHelper.WebHelper.userValidationPrompt();
                return;
            }
            if (_data.memcacheSessionError) {
                UIHelper.WebHelper.userValidationPrompt();
                return;
            }
            if (isCms && _data.error) {
                cartNotifyAlert(true, '<strong>Error:</strong></br>' + _data.error, 'Ok', '', undefined, undefined, true);
                callBack && callBack(undefined, cmsUIElements, undefined);
                return;
            }
            if (isCms && _data.FailedMaterialPricing) {
                cartNotifyAlert(true, 'Pricing for material <strong>' + _data.Material + '</strong> not found for this customer.', 'Ok', '', undefined, undefined, true);
                callBack && callBack(undefined, cmsUIElements, undefined, true);
                return;
            }
            if (_data.IsException == true) {
                displayInfo("Unable to add item in cart at this moment. Please try again later.");
                callBack && callBack("exception", "");
            }
            else if (_data.IsError == true) {
                $.each(_data.Data, function (index, obj) {
                    var _msg = obj.Message;

                    if (isCms)
                        callBack && callBack(_msg, cmsUIElements, obj);
                    else
                        callBack && callBack(_msg, obj.MaterialName);
                });
            } else {
                if (_data.Count > 0) {
                    if (isCms) {
                        Cms.UserManageCart.showCustomerCart('currentCustomerFakeClass', 'mainCartDetail', 'cmsCartLoaderFakeClass', 'userPresenceFakeClass', 'userSearchfakeClass', 'userSessionLoaerLinkFakeClass');
                        //<<UPDATE CMS CUSTOMER CART

                        callBack && callBack(undefined, cmsUIElements);
                    }
                    else {
                        updateCartCount();
                        callBack && callBack();
                    }
                }
                else {
                    callBack && callBack("exception", "");
                }
            }
        }).fail(function () {

        }).always(function () {
        });

    } else {
        displayInfo('Your Cart Is Empty.');
        if (isCms)
            callBack && callBack(undefined, cmsUIElements);
    }
}

// Update cart item count.
function updateCartCount(count) {
    $('#CartCount').html(count);
}

// Get selected items list in multi part.
function getCartItems() {
    var _cart = [];
    $($('input[data-ctid]')).filter(function () {
        var _cartDetailID = $(this).val();
        var _quantity = $('#qty_' + _cartDetailID).val();
        var _note = $('#note_' + _cartDetailID).val();
        if (_note == undefined)
        { _note = ""; }
        _cart.push({ Id: _cartDetailID, Quantity: _quantity, Note: _note });
    });
    return _cart;
}

// Save selected items in cart. 
function savecartCallback(isCms) {
    var _cartName = $.trim($('#txtCartName').val());
    $('#CartNameError').html('');
    if (_cartName != "") {
        if (_cartName.length < 3) {
            $('#CartNameError').html('Cart Name Must Be At Least 3 Characters Long.');
            return;
        }
        var _letters = /^[0-9a-zA-Z\s]+$/;
        if (_cartName.match(_letters)) {
            var _cart = getCartItems();
            postSaveCartData(_cart, _cartName, $('#cart-group'), $('.loader-savecart'), isCms);
        } else {
            $('#CartNameError').html('Only Alphanumeric Characters And Spaces Are Valid In This Field.');
        }
    } else {
        $('#CartNameError').html('Please Enter Cart Name.');
    }
}
function savecart() {

    var isCms = false
    var $cmsSrc = $('#cms-src');//<<---- CHECK IF CMS SITE
    if ($cmsSrc.length > 0)
        isCms = true;
    if (isCms)
        savecartCallback(isCms);
    else {
        if (validateSaveCart() == false) {
            showSaveCartLoader();
            validateUserWithCallback(function () {
                savecartCallback();
            }, function () { hideSaveCartLoader(); });
        }
    }
}

function validateSaveCart() {
    var _isError = false;
    var _cartName = $.trim($('#txtCartName').val());
    $('#CartNameError').html('');
    if (_cartName != "") {
        if (_cartName.length < 3) {
            $('#CartNameError').html('Cart Name Must Be At Least 3 Characters Long.');
            _isError = true;
        }

        var _letters = /^[0-9a-zA-Z\s]+$/;
        if (!_cartName.match(_letters)) {
            $('#CartNameError').html('Only Alphanumeric Characters And Spaces Are Valid In This Field.');
            _isError = true;
        }
    } else {
        $('#CartNameError').html('Please Enter Cart Name.');
        _isError = true;
    }
    return _isError;
}

function showSaveCartLoader() {
    $('#cart-group').hide();
    $('.loader-savecart').show();
}

function hideSaveCartLoader() {
    $('#cart-group').show();
    $('.loader-savecart').hide();
}

// Post cart items and cart name for save cart.
function postSaveCartData(cart, cartName, $inputGroup, $loader, isCms) {
    $loader.show();
    $inputGroup.hide();
    if (cart.length > 0) {
        $.ajax({
            url: getSiteRootPath() + (isCms ? '/Cms/CmsCustomerSaveCart' : '/Cart/SaveCart'),
            data: isCms ? JSON.stringify({ 'Cart': cart, 'cartName': cartName, 'customerId': $('#hdnuid').val(), 'uniqueId': $('#hdnuname').val() }) : JSON.stringify({ 'Cart': cart, 'cartName': cartName }),
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            success: function (result) {
                if (result.userSessionError) {
                    UIHelper.WebHelper.userValidationPrompt();
                    return;
                }
                if (result.memcacheSessionError) {
                    UIHelper.WebHelper.userValidationPrompt();
                    return;
                }
                if (result.status == true) {
                    if (isCms) {
                        updateCmsCartUI(undefined, $('#hdnuid').val(), function () {
                            showMessageDialog("Cart Saved Successfully.");
                            $loader.hide();
                            $inputGroup.show();

                        });
                    }
                    else {
                        LoadCartList();
                        $loader.hide();
                        $inputGroup.show();
                        //showMessageDialog("Cart Saved Successfully.");
                        showSuccessMessageDialog("Cart Saved Successfully.", $('div[data-id="save-cart-box"]'), $('div[data-id="save-cart-message"]'));
                    }
                }
                else {
                    $('#CartNameError').html(result.Msg);
                    $loader.hide();
                    $inputGroup.show();
                }
            }
            , error: function (xhr, text, status) {
                $loader.hide();
                $inputGroup.show();
                $('#CartNameError').html("Cart Not Saved Successfully.");

            }
        });
    } else {
        $loader.hide();
        $inputGroup.show();
        $('#CartNameError').html("Products Not Found.");
    }
}

// Load saved carts name for showing in dropdown.
function LoadCartList(customerId) {
    $.ajax({
        url: getSiteRootPath() + '/Cart/LoadCartList',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ 'customerId': (customerId ? customerId : '') }),
        dataType: 'json',
        success: function (data) {
            var _opt = "<option>--Select Cart --</option>";
            $.each(data, function (index, item) {
                _opt += " <option data-cartname='" + item.CartName + "' title='" + item.CartName + "' value='" + item.CartID + "'>" + item.DisplayCartName + "</option> ";
            });
            $('#ddlCart').html(_opt);
        }
    });
}

function undoArchiveCartProduct(ctId, hdnClass) {
    try {
        var _ids = $('.' + hdnClass).val();
        var _pid = [];
        var _undoOldHref = '';
        var _cancelOldHref = '';
        $undoCartElement = $('#undoCart');
        $cancelCartElement = $('#cancelCart');

        $undoCartElement.html('Undoing');
        _undoOldHref = $undoCartElement.attr('href');
        _cancelOldHref = $cancelCartElement.attr('href');
        $undoCartElement.attr('href', 'javascript:void(0);');
        $cancelCartElement.attr('href', 'javascript:void(0);');

        if (_ids.length > 1) {
            $.each(_ids.split(','), function (i, v) {
                _pid.push(v);
            });
        }
        $.ajax({
            url: getSiteRootPath() + '/Cart/UndoArchiveCartProduct',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ 'productId': _pid, 'cartId': ctId }),
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    //update UI
                    updateCartUI();

                } else if (response.error) {
                    alert(response.error);
                }
            },
            error: function (xhr, text, status) {
                alert(text);
            },
            complete: function (xhr, text, status) {
                $undoCartElement.html('Undo');
                $undoCartElement.attr('href', _undoOldHref);
                $cancelCartElement.attr('href', _cancelOldHref);
                $('.' + hdnClass).val('');
                cartNotifyAlert(false);
            }
        });
    } catch (err) {
        alert('__undoArchiveCartProduct__' + err);
    }
}

function updateCartContent(deletedRows) {
    var dataRows = [];
    dataRows = $('.userCartFakeClass > tbody > tr');

    var archivedRows = [];
    if (dataRows.length > 0) {
        var trGrayClass = 'gray';
        $.each(deletedRows, function (i, id) {
            $.each(dataRows, function (i, row) {
                $(row).removeClass(trGrayClass);
                if ($(row).attr('data-rowid') == 'row' + id) {
                    $(row).remove();
                    return;
                }
            });
        });

        dataRows = $('.userCartFakeClass > tbody > tr');

        if (dataRows.length == 0) {
            $('.userCartFakeClass > tbody').append('<tr><td colspan="10"><h3 class="cart-emptymsg text-center"><span class="">Your cart is empty</span></h3></td></tr>')
            window.location.reload();
        }

        var ctr = 1;
        $.each($(dataRows), function (i, row) {
            if (!$(row).hasClass('tr-suspended')) {
                if (ctr == 1) {
                    if (!$(row).hasClass('tr-suspended')) {
                        $(row).addClass(trGrayClass);
                    }
                    ctr = 2
                }
                else if (ctr == 2) {
                    if (!$(row).hasClass('tr-suspended')) {
                        $(row).addClass(trGrayClass);
                    }
                    ctr = 3;
                }
                else if (ctr == 3) {
                    ctr = 4;
                }
                else if (ctr == 4) {
                    ctr = 1;
                }
            }
        });
    }
}

function archiveCartProduct(productId, ctId, rowid, eventElement, isCms, Uid, miscCallback, pname) {
    try {

        if (eventElement && eventElement.length > 0) {
            $.each(eventElement, function (i, eventArg) {
                $(eventArg.control).attr('href', 'javascript:void(0);');
                $(eventArg.loaderControl).show();
            });
        }
        $('.archivedItemFakeClass').val(productId.join(','));
        $.ajax({
            url: getSiteRootPath() + (isCms ? '/Cms/CmsCustomerArchiveCartProduct' : '/Cart/ArchiveCartProduct'),
            type: 'POST',
            contentType: 'application/json',
            data: isCms ? JSON.stringify({ 'productId': productId, 'cartId': ctId, 'customerId': $('#hdnuid').val(), 'uniqueId': $('#hdnuname').val() }) : JSON.stringify({ 'productId': productId, 'cartId': ctId, 'isGuestCartRemoval': guestnum, 'itemName': pname }),
            dataType: 'json',
            success: function (response) {
                if (response.userSessionError) {
                    if (miscCallback)
                        miscCallback();
                    if (eventElement)
                        resetEventTrigger(eventElement);
                    UIHelper.WebHelper.userValidationPrompt();
                    return;
                }
                if (response.memcacheSessionError) {
                    if (miscCallback)
                        miscCallback();
                    if (eventElement)
                        resetEventTrigger(eventElement);
                    UIHelper.WebHelper.userValidationPrompt();
                    return;
                }
                if (response.success) {
                    //update UI
                    if (isCms) {
                        $('#cmsUpdatedDate').html(response.UpdatedDateTime);
                        $('#cmsUpdatedBy').html(response.UpdatedBy);
                        var dataRows = $('.userCartFakeClass > tbody > tr');
                        var archivedRows = [];
                        updateCartContent(rowid);
                        if (miscCallback)
                            miscCallback();
                        if (eventElement)
                            resetEventTrigger(eventElement);
                        totalCount();
                        //updateCmsCartUI(eventElement, Uid, miscCallback);
                    }
                    else {
                        //updateCartUI(eventElement, miscCallback);
                        updateCartContent(rowid);
                        if (miscCallback)
                            miscCallback();
                        if (eventElement)
                            resetEventTrigger(eventElement);
                        totalCount();
                        updateCartCount();
                    }
                } else if (response.error) {
                    resetEventTrigger(eventElement);
                    displayInfo(response.error);
                }
            },
            error: function (xhr, text, status) {
                resetEventTrigger(eventElement);
                displayInfo(text);
                if (miscCallback)
                    miscCallback();
            },
            complete: function (xhr, text, status) {

            }
        });
    }
    catch (error) {
        if (miscCallback)
            miscCallback();
        resetEventTrigger(eventElement);
        displayInfo(error);
    }
}

function updateCmsCartUI(eventElement, uid, callback) {
    var $userSessionLink = $('.userPresenceFakeClass');
    var $cmsCart = $('#mainCartDetail');
    var $cmsCartLoader = $('.cmsCartLoaderFakeClass');
    var $userInput = $('.userSearchfakeClass');
    var $sessionLoader = $('.userSessionLoaerLinkFakeClass');
    var userTempHrefs = [];
    var userContainer = { UserSessionLoader: $sessionLoader, UserSessionLoaderHref: $sessionLoader.attr('href'), UserInput: $userInput, UIElements: [] };
    $userInput.attr('disabled', 'disabled');
    $sessionLoader.attr('href', 'javascript:void(0);');
    $.each($userSessionLink, function (index, anchor) {
        userTempHrefs.push({ Element: $(anchor), Href: $(anchor).attr('href') });
        $(anchor).attr('href', 'javascript:void(0);');
    });
    if (userTempHrefs.length > 0)
        userContainer.UIElements = userTempHrefs;
    $cmsCart.html('');
    $cmsCartLoader.show();
    $.ajax({
        url: getSiteRootPath() + '/Cms/UserManageCartMain',
        type: 'POST',
        data: { customerId: uid, uniqueId: $('#hdnuname').val() },
        success: function (response) {
            if (response.error) {
                alert(response.error);
                return;
            }
            if (response.nodata) {
                $('#mainCartDetail').html('');
                alert('User offline.');
                return;
            }
            if (callback) {
                callback();
            }
            $('#mainCartDetail').html(response);
        },
        error: function (xhr, text, status) {
            if (callback) {
                callback();
            }
            alert('__eventElement__' + text);
        },
        complete: function (xhr, text, status) {
            resetEventTrigger(eventElement);
            $cmsCartLoader.hide();
            if (userContainer.UserInput)
                $(userContainer.UserInput).removeAttr('disabled');
            if (userContainer.UserSessionLoader) {
                $(userContainer.UserSessionLoader).attr('href', userContainer.UserSessionLoaderHref);
            }
            if (userContainer.UIElements && userContainer.UIElements.length > 0) {
                $.each(userContainer.UIElements, function (index, datum) {
                    $(datum.Element).attr('href', datum.Href);
                });
            }
        }
    });
}

// Load shopping cart items.
function updateCartUI(eventElement, miscCallback) {
    $.ajax({
        url: getSiteRootPath() + '/Cart/GetCartProductList',
        type: 'GET',
        success: function (response) {
            if (miscCallback && miscCallback != null) {
                miscCallback();
            }
            $('#cartMainDetail').html(response);
            updateCartCount();
        },
        error: function (xhr, text, status) {
            if (miscCallback && miscCallback != null) {
                miscCallback();
            }
            alert('__eventElement__' + text);
        },
        complete: function (xhr, text, status) {
            resetEventTrigger(eventElement);

        }
    });
}

function updateCartAll(cartId, srcClass, srcLoaderClass, isCms, Uid) {
    var _pid = [];
    var _rowId = [];
    var _elements = [];
    showSuccessMessageDialog('', $('div[data-id="confirm-alert-message"]'), $('div[data-id="confirm-alert-box"]'));
    $.each($('input[data-ctid]'), function (i, v) {
        $current = $(v);
        if ($current.is(':checked')) {
            _pid.push($current.val());
            _rowId.push($current.data('rowid'));

            //var _loaderControl = $('.fakeLoaderClass' + $current.data('rowid'));
            //var _control = _loaderControl.parent();
            //var _controlDetail = _control.attr('href');

            //var _ele = new EventTriggerDetail(_control, _controlDetail, _loaderControl);
            //_elements.push(_ele);
        }
    });
    if (_pid.length > 0 && _rowId.length > 0) {

        cartNotifyAlert(true, 'Are you sure you want to remove selected item(s) from your cart ?', 'Ok', 'Cancel', function ($okBtn, $cancelBtn, $confirmAlert, $contentElement, $loadingGif) {
            var miscCallback = function () {
                $loadingGif.hide();
                //  $contentElement.html('Item(s) removed successfully.');
                cartNotifyAlert(true, 'Item(s) removed successfully.', 'Ok', undefined, undefined, undefined, true);
                //showSuccessMessageDialog('Item(s) removed successfully.', $('div[data-id="confirm-alert-box"]'), $('div[data-id="confirm-alert-message"]'));
                $okBtn.show();
                $okBtn.unbind('click');
                $okBtn.bind('click', function () { $confirmAlert.modal('hide'); $contentElement.html(''); $okBtn.unbind('click'); })
                $cancelBtn.hide();
                updateCartCount();
            }
            var $src = $('#' + srcClass);
            var _ele = new EventTriggerDetail($src, $src.attr('href'), $('.' + srcLoaderClass));
            _elements.push(_ele);
            archiveCartProduct(_pid, cartId, _rowId, _elements, isCms, Uid, miscCallback);
        }, function () {

        }, undefined, true);
    }
    else {
        cartNotifyAlert(true, 'Please select checkboxes for items to get removed.', 'Ok', 'Cancel', undefined, undefined, true);
    }
}

function updateCartSingle(pname, productId, cartId, rowId) {
    cartNotifyAlert(true, 'Are you sure you want to remove <strong>' + pname + '</strong> from your cart ?', 'Ok', 'Cancel', function () {
        var _pid = [];
        var _rowId = [];
        var _elements = [];

        var _loaderControl = $('.fakeLoaderClass' + rowId);
        var _control = _loaderControl.parent();
        var _controlDetail = _control.attr('href');

        var _ele = new EventTriggerDetail(_control, _controlDetail, _loaderControl);
        _elements.push(_ele);

        _pid.push(productId);
        _rowId.push(rowId);

        archiveCartProduct(_pid, cartId, _rowId, _elements);
    }, function () {

    });
}

function checkoutArchiveItem(pname, productId, cartId, rowclass, formElementClass) {
    var _pid = [];
    _pid.push(productId);
    cartNotifyAlert(true, 'Are you sure you want to remove <strong>' + pname + '</strong> from your cart ?', 'Ok', 'Cancel', function ($okBtn, $cancelBtn, $confirmAlert, $contentElement, $loadingGif) {
        var miscCallback = function () {
            $loadingGif.hide();
            cartNotifyAlert(true, 'Item(s) Removed Successfully.', 'Ok', 'Cancel', undefined, undefined, true);
            $okBtn.show();
            $okBtn.unbind('click');
            $okBtn.bind('click', function () { $confirmAlert.modal('hide'); $contentElement.html(''); $okBtn.unbind('click'); })
            $cancelBtn.hide();

            $('tr[data-row=' + rowclass + ']').remove();
            $('.' + formElementClass).remove();
            $dataRows = $('tr[data-row*=row');
            var formElements = $("input[id*='CartDetail_CartProductsList']");
            if ($dataRows.length == 0) {
                window.location.href = '/Cart';
                return;
            }

            var formCtr = 0;
            var formRows = [];
            $.each($dataRows, function (i, tr) {
                if ($(tr).attr('class') == 'gray')
                    formRows.push($(tr));
                if ($(tr).attr('class') == 'white')
                    formRows.push($(tr));
            });
            $.each(formRows, function (i, row) {
                $(row).find("input:hidden").each(function (i, ele) {
                    $(ele).attr('name', $(ele).attr('name').replace(/(\d+)/g, formCtr))
                    $(ele).attr('id', $(ele).attr('id').replace(/(\d+)/g, formCtr))
                });
                formCtr++;
            });

            $dataRows.removeClass('gray');
            $dataRows.removeClass('white');
            $dataRows.removeClass('tr-notes');

            var ctr = 0;
            $.each($dataRows, function (i, ele) {
                if (ctr == 0) {
                    $(ele).addClass('gray');
                    ctr = 1;
                }
                else if (ctr == 1) {
                    $(ele).addClass('tr-notes gray');
                    ctr = 2;
                }
                else if (ctr == 2) {
                    $(ele).addClass('white');
                    ctr = 3;
                }
                else if (ctr == 3) {
                    $(ele).addClass('tr-notes white');
                    ctr = 0;
                }
            });

            $('.checkoutCartCountFakeClass').html($('tr[data-row*=row').length / 2);
            updateCartCount();
        }

        archiveCartProduct(_pid, cartId, undefined, undefined, false, undefined, miscCallback, pname);
    }, function () {

    }, undefined, true);
}

// Update shopping cart items count.
function updateCartCount() {
    $.ajax({
        url: getSiteRootPath() + '/Cart/MainCartCount',
        type: 'POST',
        success: function (response) {
            if (response.success) {
                $mainCart = $('#CartCount');
                if ($mainCart) {
                    $mainCart.html(response.count);
                }
            }
            if (response.error) {
                alert('__updateCartCount__' + response.error);
            }
        },
        error: function (xhr, text, status) {
            //alert('__updateCartCount__' + text);
        },
        complete: function (xhr, text, status) {
        }
    });
}

function resetEventTrigger(eventElement) {
    if (eventElement && eventElement != null) {
        $.each(eventElement, function (i, val) {
            $.each(eventElement, function (i, eventArg) {
                $(eventArg.control).attr('href', eventArg.controlHref);
                $(eventArg.loaderControl).hide();
            });
        });
    }
}

function checkboxEnableDisable(ctrl) {
    var $main = $(ctrl);
    var $items = $('input[data-ctid]');
    if ($main.is(':checked')) {
        $.each($items, function (i, v) { v.checked = true; });
    }
    else {
        $.each($items, function (i, v) { v.checked = false; });
    }
}

// Validate user is logged in or not.
function validateUserLogin() {
    var _status = 0;
    $.ajax({
        url: getSiteRootPath() + '/Base/ValidateUser',
        type: 'POST',
        async: false,
        success: function (result) {
            _status = result;
        },
        fail: function () {
            console.log("from validateUserLogin");
        }
    });
    return _status;
}

// Validate user is logged in or not.
function validateUserWithCallback(callBack, failureCallBack) {
    var url = '/Base/ValidateUser';
    var jqXHR = DataLayerModule.DataLayer.getRequest(url).done(function (data) {
        if (data != '1') {
            displayInfo('Please Login Before Accessing The Cart.');
            failureCallBack && failureCallBack();
            $(".add-cart").show().next().hide();

            return;
        } else {
            callBack && callBack();
        }
    }).fail(function () {
        failureCallBack && failureCallBack();
        displayInfo('Please Login Before Accessing The Cart.');
    });
}

// Display message dialog with message.
function showMessageDialog(message) {
    //$(".close-x").trigger('click');
    //$('#ModelMessage').html(message);
    //$('#notify-model').modal('show');
    cartNotifyAlert(true, message, 'Ok', undefined, undefined, undefined, true);
}

function showSuccessMessageDialog(message, hideContainer, showContainer) {
    $(hideContainer).find('span[data-id="Message"]').html(message);
    $(showContainer).find('span[data-id="Message"]').html(message);
    $(hideContainer).hide();
    $(showContainer).show();
}

// Validate entered key is alphanumeric or not.
function isAlphaNumeric(e) {
    var _keyCode = e.keyCode == 0 ? e.charCode : e.keyCode;
    var ret = ((_keyCode >= 48 && _keyCode <= 57) || (_keyCode >= 65 && _keyCode <= 90) || (_keyCode >= 97 && _keyCode <= 122) || (e.charCode != e.keyCode) || e.charCode == 95 || e.charCode == 32);
    return ret;
}

$(function () {


    $("body").on("click", 'button[data-type="savedcartdropdown"]', function (e) {
        $('#ddlCart').prop('selectedIndex', 0);
    });

    $("body").on("click", 'a[data-type="cart"]', function (e) {
        goToCart();
        return false;
    });

    // Stop auto close of my saved carts drilldown on click of notify-message dialog.
    $("body").on("click", '#notify-message', function (e) {
        return false;
    });

    // Validate cart name and characters on key press.
    $("body").on("keypress", '#txtCartName', function (e) {
        if (e.keyCode == 13) {
            savecart();
        } else {
            return isAlphaNumeric(e);
        }
    });

    // Close dialog box
    $("body").on("click", '.btnclose', function (e) {
        $(".close-x").trigger('click');
    });

    // Clear all error messages when user perform action on cart(add to cart/replace /delete cart).
    $("body").on("click", '.cartaction', function (e) {
        var _operation = $(this).attr('data-id');
        cartAction(_operation);
    });

    // Clear all error message when user click on save cart.
    $("body").on("click", '.savecart', function (e) {
        $('#txtCartName').val('');
        $('#CartNameError').html('');
        $('#cart-group').show();
        $('.loader-savecart').hide();
        setTimeout(function () {
            $('#txtCartName').focus();
        }, 500);

    });

    $(document).on("click", "#save-cart", function (e) {
        showSuccessMessageDialog("", $('div[data-id="save-cart-message"]'), $('div[data-id="save-cart-box"]'));
        $('div[data-id="save-cart-modal"]').modal({
            //backdrop: 'static',
            //keyboard: false
        });
    });

    // Perform add to cart operation.
    function addCartCallback(isCms) {
        var _cartID = $('#ddlCart').val();
        if (_cartID > 0) {
            var _operation = $('.AddtoCart').attr('data-operation');
            if (_operation != null && _operation != "") {
                postCartOperationData(_cartID, _operation, $('#AddToCartError'), $('.loader-add'), $('.AddtoCart'), $('.AddCancel'), undefined, isCms);
            }
            else {
                $('#AddToCartError').html('Invalid Operation.');
            }
        } else {
            $('#AddToCartError').html('Please Select Cart From The Cart List.');
        }
    }

    $("body").on("click", '.AddtoCart', function (e) {
        var isCms = false
        var $cmsSrc = $('#cms-src');//<<---- CHECK IF CMS SITE
        if ($cmsSrc.length > 0)
            isCms = true;
        $('#AddToCartError').html('');
        if (isCms)
            addCartCallback(isCms);
        else
            addCartCallback();
    });

    // Perform replace cart operation.
    function replaceCartCallback(isCms) {
        $('#ReplaceCartError').html('');
        var _isError = validateCart($('#ReplaceCartError'));
        if (_isError == false) {
            var _cartID = $('#ddlCart').val();
            var _operation = $('.ReplaceCart').attr('data-operation');
            if (_operation != null && _operation != "") {
                postCartOperationData(_cartID, _operation, $('#ReplaceCartError'), $('.loader-replace'), $('.ReplaceCart'), $('.ReplaceCancel'), undefined, isCms);
            } else {
                $('#ReplaceCartError').html('Invalid Operation.');
            }
        }
    }
    $("body").on("click", '.ReplaceCart', function (e) {
        var isCms = false
        var $cmsSrc = $('#cms-src');//<<---- CHECK IF CMS SITE
        if ($cmsSrc.length > 0)
            isCms = true;
        if (isCms)
            replaceCartCallback(isCms);
        else
            replaceCartCallback();
    });

    // Perform delete cart operation.
    function deleteCartCallback() {
        var _containerName = 'delete-cart';
        $('#DeleteCartError').html('');
        var _cartID = $('#ddlCart').val();
        if (_cartID > 0) {
            var _operation = $('.DeleteCart').attr('data-operation');
            if (_operation != null && _operation != "") {
                postCartOperationData(_cartID, _operation, $('#DeleteCartError'), $('.loader-delete'), $('.DeleteCart'), $('.DeleteCancel'), function (result, $loader, $okbutton, $cancelbutton) {
                    if ($('#cms-src').length > 0) {
                        updateCmsCartUI(undefined, $('#hdnuid').val(), function () {
                            $loader.hide();
                            $okbutton.show();
                            $cancelbutton.show();
                            showMessageDialog(result.Message);
                            $('.loader-delete').hide();
                            $('.DeleteCart').show();
                            $('.DeleteCancel').show();
                        });
                    }
                    else {
                        LoadCartList();
                        $loader.hide();
                        $okbutton.show();
                        $cancelbutton.show();
                        showSuccessMessageDialog(result.Message, $('div[data-id="' + _containerName + '-box"]'), $('div[data-id="' + _containerName + '-message"]'));
                        //  showMessageDialog(result.Message);
                        $('.loader-delete').hide();
                        $('.DeleteCart').show();
                        $('.DeleteCancel').show();
                    }

                }, $('#cms-src').length > 0);
            }
            else {
                $('#DeleteCartError').html('Invalid Operation');
            }
        } else {
            $('#DeleteCartError').html('Please Select Cart From The Cart List.');
        }
    }

    $("body").on("click", '.DeleteCart', function (e) {
        var isCms = false
        var $cmsSrc = $('#cms-src');//<<---- CHECK IF CMS SITE
        if ($cmsSrc.length > 0)
            isCms = true;
        if (isCms)
            deleteCartCallback(isCms);
        else
            deleteCartCallback();
    });

    // Validate quantity.
    $(document).on("click keypress", '.quantity', function (e) {
        BusinessLayerModule.BusinessLayer.ShowToolTip($(this), '');
    });

    $('html.touch .cartquantity').keypress(function () {
    })

    // Update shopping cart pricing total according to item quantity.
    $("body").on("keypress", '.cartquantity', function (e) {
        if (e.keyCode == 13) {
            var $formQty = $(this).prev();
            $formQty.val($(this).val())
            if ($(this).val().length > 5) {
                $(this).val($(this).val())
            }
            var _quantiy = $(this).val();
            var _id = $(this).attr('data-id');
            var _netPrice = $(this).attr('data-netprice');
            var _totalNetPrice = (_netPrice * _quantiy);
            $('#netTotalPrice_' + _id).html('$' + _totalNetPrice.formatMoney(2));
            totalCount();
        }
    });

    $("body").on("blur focusout change", '.cartquantity', function (e) {
        if ($(this).val().length > 5) {
            $(this).val($(this).val())
        }
        if ($(this).val() == '' || $(this).val() == 0)
            $(this).val(1);
        var _quantiy = $(this).val();
        var $formQty = $(this).prev();
        $formQty.val($(this).val())
        var _id = $(this).attr('data-id');
        var _netPrice = $(this).attr('data-netprice');
        var _totalNetPrice = (_netPrice * _quantiy);
        $('#netTotalPrice_' + _id).html('$' + _totalNetPrice.formatMoney(2));
        totalCount();
    });

    // Update shopping cart pricing total.
    $("body").on("input keyup", '.cartquantity', function (e) {
        if ($(this).val().length > 5) {
            $(this).val($(this).val())
        }
        var _quantiy = $(this).val();
        var $formQty = $(this).prev();
        $formQty.val($(this).val())
        var _id = $(this).attr('data-id');
        var _netPrice = $(this).attr('data-netprice');
        var _totalNetPrice = (_netPrice * _quantiy);
        $('#netTotalPrice_' + _id).html('$' + _totalNetPrice.formatMoney(2));
        totalCount();
    });

    $(document).on("click", 'a[data-type="checkout"]', function (e) {
        saveCartDetails(function () {
            if (isAuthenticatedUser) {
                window.location.href = getSiteRootPath() + "/checkout";
            } else {
                window.location.href = getSiteRootPath() + '/precheckout?gid=' + guestCartSessionID;
            }
        });
    });

    $(document).on("click", 'a[data-type="savecart"]', function (e) {
        return;
        saveCartDetails(function () {
            cartNotifyAlert(true, UIHelper.WebHelper.ClientMessage.MainCartSave, 'Ok', undefined, undefined, undefined, true);
        });
    });

    function saveCartDetails(callback) {
        var absoletedLength = $('.tr-suspended').length;
        var invalidPriceItemLength = $('tr[data-error="price"]').length;
        var _msg = "";
        var _isError = false;
        var _hasZeroPricingItem = false;

        $('.itemPriceNet').each(function (i, ele) {
            if (parseFloat($(ele).val()) <= 0) {
                _hasZeroPricingItem = true;
                return;
            }
        });

        if (_hasZeroPricingItem) {
            _msg = "Some items are not eligible for checkout. Please remove them before proceeding for checkout.";
            _isError = true;
        } else if (absoletedLength > 0 && invalidPriceItemLength > 0) {
            _msg = "Please Remove Suspended And Invalid Price Items Before Proceed To Checkout";
            _isError = true;
        }
        else if (absoletedLength > 0) {
            _msg = "Please Remove Suspended Items Before Proceed To Checkout";
            _isError = true;
        }
        else if (invalidPriceItemLength > 0) {
            _msg = "Please Remove Invalid Price Items Before Proceed To Checkout";
            _isError = true;
        }
        else if (parseFloat($('#GrandTotal').html().replace('$', '').replace(/,/g, '')) < minimumCartAmount) {
            _msg = "In order to process the request, the minimum cart amount should be atleast <strong>$" + minimumCartAmount + "</strong>";
            _isError = true;
        }
        else if (isAuthenticatedUser && $("a[data-type='checkout']").data('hasaccount').toLowerCase() == 'false' && $("a[data-type='checkout']").data('isguestuser').toLowerCase() == 'false') {
            _msg = "Your transaction cannot be completed. Please call Customer Service at  " + contactUsCustomerTollFree + ', ' + contactUsCustomerInternationalNoFormatted + '.';
            _isError = true;
        }
        if (_isError == true) {
            showMessageDialog(_msg);
            return false;
        }

        showLoader();//<LOADER WORKING QUERY
        scrollToElement();
        var _cart = getCartItems();
        var _note = $('#Note').val();
        var _pcode = $('#pcode').val();
        if (_cart.length > 0) {
            $.ajax({
                url: getSiteRootPath() + '/Cart/CacheCartDetails/',
                data: JSON.stringify({ 'Cart': _cart, 'note': _note, 'pcode': _pcode }),
                type: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                success: function (result) {
                    var _minqty = "";
                    var _avai = "";
                    if (result.IsError == true) {
                        $('p[data-type="message"]').hide();
                        if (result.isCodeError == true) {
                            showMessageDialog(result.Message);
                        }
                        else {
                            $.each(result.Data, function (i, v) {
                                var _id = 'data-id="item-' + v.id + '"';
                                if (v.MinimumOrderQuantityError == true) {
                                    if (_minqty == '') {
                                        _minqty = v.MaterialName;
                                    }
                                    else { _minqty = _minqty + ',' + v.MaterialName; }
                                    $('p[' + _id + ']').html("*Minimum Quantity Error");
                                    $('p[' + _id + ']').show();
                                }
                                else {
                                    if (_avai == '') {
                                        _avai = v.MaterialName;
                                    }
                                    else { _avai = _avai + ',' + v.MaterialName; }
                                    var _msg = "";
                                    if (v.QuantityAvailable > 0 && v.QuantityRequest > 0) {
                                        _msg = "*You Have Requested " + v.QuantityRequest + " , But We Have Only " + v.QuantityAvailable + " Available.";
                                    }
                                    else if (v.QuantityAvailable == 0) {
                                        _msg = "*This product is not available. it will soon be available.";
                                        $('#qty_' + v.id).attr('disabled', 'disabled');
                                        $('#qty_' + v.id).val(0);
                                        $('#qty_' + v.id).trigger('click');
                                    }
                                    else if (v.QuantityRequest == 0) {
                                        _msg = "*Quantity should be greater than 0.";
                                    }
                                    $('p[' + _id + ']').html(_msg);
                                    $('p[' + _id + ']').show();
                                }

                            });
                        }
                        hideLoader();
                    }
                    else {
                        callback && callback();
                    }

                },
                error: function (request, status, error) {
                    hideLoader();
                },
                complete: function () {
                    //hideLoader();
                }
            });
        }
    }

    $('#pcode').keyup(function (e) {
        this.value = this.value.replace(/[^a-zA-Z0-9]/g, '');

    });

    //#region Loader
    function showLoader() {
        $("#divLoaderContainer").show();
    }

    function hideLoader() {
        $("#divLoaderContainer").hide();
    }

    // Check saved cart selected or not.
    function validateCart(container) {
        $(container).html('');
        var _errorMsg = "";
        var _isError = false;
        var _cartID = $('#ddlCart').val();
        if (_cartID > 0) {

        } else {
            _isError = true; _errorMsg = "Please Select Cart From The Cart List.";
        }
        if (_isError == true) {
            $(container).html(_errorMsg);
        }
        return _isError;
    }

    // Send request for perform (Add to cart/Replace cart/Delete cart) operation.
    function postCartOperationData(cartID, operation, container, $loader, $okbutton, $cancelbutton, callback, isCms) {
        $okbutton.hide();
        $cancelbutton.hide();
        $loader.show();
        var _containerName = $($okbutton).attr('data-id');
        try {
            $.ajax({
                url: getSiteRootPath() + (isCms ? '/Cms/CmsShoppingCartOperation' : '/Cart/ShoppingCartOperation'),
                data: isCms ? JSON.stringify({ 'cartID': cartID, 'operation': operation, 'customerId': $('#hdnuid').val(), 'uniqueId': $('#hdnuname').val() }) : JSON.stringify({ 'cartID': cartID, 'operation': operation }),
                type: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                success: function (result) {

                    if (result.isSucceed == true) {
                        if (callback) {
                            callback(result, $loader, $okbutton, $cancelbutton);
                        }
                        else {
                            if (isCms) {
                                updateCmsCartUI(undefined, $('#hdnuid').val(), function () {
                                    showMessageDialog(result.Message);
                                    $loader.hide();
                                    $okbutton.show();
                                    $cancelbutton.show();
                                });
                            }
                            else {
                                updateCartUI(undefined, function () {
                                    // showMessageDialog(result.Message); 
                                    showSuccessMessageDialog(result.Message, $('div[data-id="' + _containerName + '-box"]'), $('div[data-id="' + _containerName + '-message"]'));
                                    $loader.hide();
                                    $okbutton.show();
                                    $cancelbutton.show();
                                });
                            }
                        }

                    }
                    else {
                        //$(container).html(result.Message);
                        showSuccessMessageDialog(result.Message, $('div[data-id="' + _containerName + '-box"]'), $('div[data-id="' + _containerName + '-message"]'));
                    }
                }, error: function (xhr, text, status) {
                    showSuccessMessageDialog('Please Check Your Login.', $('div[data-id="' + _containerName + '-box"]'), $('div[data-id="' + _containerName + '-message"]'));
                    $loader.hide();
                    $okbutton.show();
                    $cancelbutton.show();
                }, complete: function (xhr, text, status) {

                }
            });
        }
        catch (err) {
            alert('__PostCartOperationData__' + err);
            $loader.hide();
            $okbutton.show();
            $cancelbutton.show();
        }
    }
});

// Show message in dialog box.
function displayInfo(msg) {
    //swal("", msg)
    $("#message").html(msg);
    $("#divNotifyDialogue").modal('show');
}

function loadUsers(staticLoaderClass, dynamicLoaderClass, userSearchInputClass, userSearchContentClass, currentCustomerIDElementClass, userDetailActiveClass) {
    var $sloader = $('.' + staticLoaderClass);
    var $dloader = $('.' + dynamicLoaderClass);
    if ($dloader.is(':visible'))
        return;
    $sloader.hide();
    $dloader.show();
    Cms.UserManageCart.searchUser(userSearchInputClass, userSearchContentClass, function () {
        $sloader.show();
        $dloader.hide();
    }, currentCustomerIDElementClass, userDetailActiveClass);
}


function cmsValidateCart() {
    if ($('.mainCartLoaderFakeClass').is(':visible'))
        return;
    $('.mainCartLoaderFakeClass').show();
    var _cart = getCartItems();
    var _note = $('#Note').val();
    var _pcode = $('#pcode').val();
    if (_cart.length > 0) {
        $.ajax({
            url: getSiteRootPath() + '/Cms/WebstoreValidateCart',
            data: JSON.stringify({ 'customerId': $('#hdnuid').val(), 'uniqueId': $('#hdnuname').val(), 'Cart': _cart, 'note': _note, 'pcode': _pcode }),
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            success: function (result) {
                if (result.userSessionError) {
                    UIHelper.WebHelper.userValidationPrompt();
                    return;
                }
                if (result.memcacheSessionError) {
                    UIHelper.WebHelper.userValidationPrompt();
                    return;
                }
                if (result.UpdatedDateTime && result.UpdatedDateTime != null) {
                    $('#cmsUpdatedDate').html(result.UpdatedDateTime);
                }
                if (result.UpdatedBy && result.UpdatedBy != null) {
                    $('#cmsUpdatedBy').html(result.UpdatedBy);
                }
                if (result.error) {
                    alert('__cmsValidateCart__' + result.error);
                    return;
                }
                var _minqty = "";
                var _avai = "";
                var errorMsgsElements = $('[data-validate-msg]');
                $.each(errorMsgsElements, function (i, v) {
                    $(v).html('');
                })
                if (result.IsError == true) {
                    $('p[data-type="message"]').hide();
                    $.each(result.Data, function (i, v) {
                        var _id = 'data-id="item-' + v.id + '"';
                        $('p[' + _id + ']').html('');
                        if (v.MinimumOrderQuantityError == true) {
                            if (_minqty == '') {
                                _minqty = v.MaterialName;
                            }
                            else { _minqty = _minqty + ',' + v.MaterialName; }
                            $('p[' + _id + ']').html("*Minimum Quantity Error");
                        }
                        else {
                            if (_avai == '') {
                                _avai = v.MaterialName;
                            }
                            else { _avai = _avai + ',' + v.MaterialName; }
                            var _msg = "";
                            if (v.QuantityAvailable > 0 && v.QuantityRequest > 0) {
                                _msg = "*You Have Requested " + v.QuantityRequest + " , But We Have Only " + v.QuantityAvailable + " Available.";
                            }
                            else if (v.QuantityAvailable == 0) {
                                _msg = "*This product is not available. it will soon be available.";
                                //$('#qty_' + v.id).attr('disabled', 'disabled');
                                //$('#qty_' + v.id).val();
                                $('#qty_' + v.id).trigger('click');
                            }
                            else if (v.QuantityRequest == 0) {
                                _msg = "*Quantity should be greater than 0.";
                            }
                            $('p[' + _id + ']').html(_msg);
                        }
                    });
                }
                else {
                    cartNotifyAlert(true, 'Cart has been validated and saved successfully', 'Ok', 'Cancel', undefined, undefined, true);
                }
            },
            error: function (request, status, error) {
            },
            complete: function () {
                $('.mainCartLoaderFakeClass').hide();
            }
        });
    }
    else {
        $('.mainCartLoaderFakeClass').hide();
    }
}

function userValidationFailedPrompt() {
    cartNotifyAlert(true, 'User Offline', 'Ok', 'Cancel');
}


// Calculate shopping cart price total, Dont send parameters, ignore them used on checkout.js refer s&h matrix.
function totalCount() {
    var _toatl = 0;
    var removeShippingCharge = undefined;
    var isPayCheck = undefined;
    var isTBD = undefined;
    var shippingPreference = $('#ShippingPreference').val();

    if (shippingPreference == ShippingPreference.CustomerOwnAccount) {
        removeShippingCharge = true;
    }
    else {
        removeShippingCharge = false;
    }

    if ($('#PaymentMethod').val() == 'CreditCard') {
        if (isAuthenticatedUser && hasCreditTerms) {
            if (shippingPreference == ShippingPreference.AxletechPrepay) {//shipp - axletech
                isPayCheck = true;
                isTBD = false;
            }
            else {
                isPayCheck = true;
                isTBD = true;
            }
        }
    }
    else {
        if (isAuthenticatedUser && hasCreditTerms) {
            isPayCheck = true;
            isTBD = true;
        }
    }

    $('.netpricetotal').filter(function () {
        _toatl = Number(parseFloat($(this).html().replace(/,/g, '').replace('$', ''))) + _toatl;
    });

    var isCheckOut = false;
    try {
        if (clientShippingPercentage)
            isCheckOut = true;
    }
    catch (err) {
        isCheckOut = false;
    }

    if (isCheckOut) {
        var _shippingCostDefault = shippingChargeAmountDefault;
        var _shippingCharges = evenRound(parseFloat(_toatl * (clientShippingPercentage / 100)), 2);
        var _unitCostCharges = evenRound(parseFloat(_toatl * (clientUnitDownPercentage / 100)), 2);

        $('#UnitDownChrgs').html('$' + _unitCostCharges.formatMoney(2));
        $('#SubTotal').html('$' + _toatl.formatMoney(2));
        if (removeShippingCharge == true) {
            $('.shipChargeFakeClass').hide();
            $('#ShipChrgs').html('');
        }
        else {
            if (isPayCheck) {
                if (isTBD) {
                    $('.shipChargeFakeClass').show();
                    $('#ShipChrgs').html('TBD');
                }
                else {
                    $('.shipChargeFakeClass').show();
                    $('#ShipChrgs').html('$' + (_shippingCharges > _shippingCostDefault ? _shippingCharges : _shippingCostDefault).formatMoney(2));
                }
            }
            else {
                if (!hasCreditTerms) {
                    $('.shipChargeFakeClass').show();
                    $('#ShipChrgs').html('$' + (_shippingCharges > _shippingCostDefault ? _shippingCharges : _shippingCostDefault).formatMoney(2));
                }
                else {
                    $('.shipChargeFakeClass').show();
                    $('#ShipChrgs').html('TBD');
                }
            }
        }

        if ($('#OrderType').val() == 2)//<--UNIT DOWN
        {
            if (removeShippingCharge == true) {
                $('#GrandTotal').html('$' + (_toatl + _unitCostCharges).formatMoney(2));
            }
            else {
                if (isPayCheck) {
                    if (isTBD) {
                        $('#GrandTotal').html('$' + (_toatl + _unitCostCharges).formatMoney(2));
                    }
                    else {
                        $('#GrandTotal').html('$' + (_toatl + (_shippingCharges > _shippingCostDefault ? _shippingCharges : _shippingCostDefault) + _unitCostCharges).formatMoney(2));
                    }
                }
                else {
                    if (!hasCreditTerms) {
                        $('#GrandTotal').html('$' + (_toatl + (_shippingCharges > _shippingCostDefault ? _shippingCharges : _shippingCostDefault) + _unitCostCharges).formatMoney(2));
                    }
                    else {
                        $('#GrandTotal').html('$' + (_toatl + _unitCostCharges).formatMoney(2));
                    }
                }
            }
        }
        else {
            if (removeShippingCharge == true) {
                $('#GrandTotal').html('$' + (_toatl).formatMoney(2));
            }
            else {
                if (isPayCheck) {
                    if (isTBD) {
                        $('#GrandTotal').html('$' + (_toatl).formatMoney(2));
                    }
                    else {
                        $('#GrandTotal').html('$' + (_toatl + (_shippingCharges > _shippingCostDefault ? _shippingCharges : _shippingCostDefault)).formatMoney(2));
                    }
                }
                else {
                    if (!hasCreditTerms) {
                        $('#GrandTotal').html('$' + (_toatl + (_shippingCharges > _shippingCostDefault ? _shippingCharges : _shippingCostDefault)).formatMoney(2));
                    }
                    else {
                        $('#GrandTotal').html('$' + (_toatl).formatMoney(2));
                    }
                }
            }
        }
    }
    else {
        $('#SubTotal').html('$' + _toatl.formatMoney(2));
        $('#GrandTotal').html('$' + _toatl.formatMoney(2));
    }
}

function cartAction(modalName) {
    $('#AddToCartError').html('');
    $('#DeleteCartError').html('');
    $('#ReplaceCartError').html('');
    $('.operationcartname').html('');
    var _cartID = $('#ddlCart').val();
    if (!(_cartID > 0)) {
        $('#notify-message').modal('show');
        return false;
    }
    else {
        var _cid = modalName.replace('.', '');
        showSuccessMessageDialog("", $('div[data-id="' + _cid + '-message"]'), $('div[data-id="' + _cid + '-box"]'));
        $(modalName).modal('show');
        $('.operationcartname').html($('#ddlCart option:selected').attr('data-cartname'));
    }
}


$(document).ready(function () {
    totalCount();
    $('#OrderType').change();
    $("body").on("click", '.addFakeClass', function (e) {
        $('#AddToCartError').html('');
        $('#DeleteCartError').html('');
        $('#ReplaceCartError').html('');
        $('.operationcartname').html('');
        var _cartID = $('#ddlCart').val();
        if (!(_cartID > 0)) {
            $('#notify-message').modal('show');
            return false;
        }
        else {
            $('.operationcartname').html($('#ddlCart option:selected').attr('data-cartname'));
            $('.saved-cart').modal();
        }
    });

    $("body").on("click", '.replaceFakeClass', function (e) {
        $('#AddToCartError').html('');
        $('#DeleteCartError').html('');
        $('#ReplaceCartError').html('');
        $('.operationcartname').html('');
        var _cartID = $('#ddlCart').val();
        if (!(_cartID > 0)) {
            $('#notify-message').modal('show');
            return false;
        }
        else {
            $('.operationcartname').html($('#ddlCart option:selected').attr('data-cartname'));
            $('.replace-cart').modal();
        }
    });

    $("body").on("click", '.deleteFakeClass', function (e) {
        $('#AddToCartError').html('');
        $('#DeleteCartError').html('');
        $('#ReplaceCartError').html('');
        $('.operationcartname').html('');
        var _cartID = $('#ddlCart').val();
        if (!(_cartID > 0)) {
            $('#notify-message').modal('show');
            return false;
        }
        else {
            $('.operationcartname').html($('#ddlCart option:selected').attr('data-cartname'));
            $('.delete-cart').modal();
        }
    });

    $("body").on("click", '.savecartFakeClass', function (e) {
        $('.save-cart').modal();
    });

    $("body").on("click", '.userCartCancelFakeClass', function (e) {
        $('.cart-validation').hide();
    });

    $("body").on("keyup", '.pcodeWebstoreFakeClass', function (e) {
        this.value = this.value.replace(/[^a-zA-Z0-9]/g, '');
    });

    $('#OrderType').change(function () {
        if ($(this).val() == 2) {
            totalCount();
            $('.unitDownFakeClass').show();
        }
        else {
            totalCount();
            $('#UnitDownChrgs').html('');
            $('.unitDownFakeClass').hide();
        }
    })
})