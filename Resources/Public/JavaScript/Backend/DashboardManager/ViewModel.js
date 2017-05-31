/*
 * This file is part of the TYPO3 CMS project.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 *
 * The TYPO3 project - inspiring people to share!
 */

/**
 * Module: TYPO3/CMS/Form/Backend/DashboardManager/ViewModel
 */
define(['jquery',
        'TYPO3/CMS/Backend/Modal',
        'TYPO3/CMS/Backend/Severity',
        'TYPO3/CMS/Backend/Wizard',
        'TYPO3/CMS/Backend/Icons',
        'TYPO3/CMS/Backend/Notification',
        'gridstack',
        'gridstackjqueryui'
        ], function($, Modal, Severity, Wizard, Icons, Notification, gridstack, gridstackjqueryui ) {
        'use strict';

    return (function($, Modal, Severity, Wizard, Icons, Notification, gridstack, gridstackjqueryui ) {

        /**
         * @private
         *
         * @var object
         */
        var _dashboardManagerApp = null;

        /**
         * @private
         *
         * @var object
         */
        var _domElementIdentifierCache = {};

        /**
         * @private
         *
         * @return void
         */
        function _domElementIdentifierCacheSetup() {
            _domElementIdentifierCache = {
                gridStack: { identifier: '[data-identifier="grid-stack"]'},
                newDashboardModalTrigger: {identifier: '[data-identifier="newDashboard"]' },
                newDashboardName: { identifier: '[data-identifier="newDashboardName"]' },

                // prev
                /*
                newFormModalTrigger: { identifier: '[data-identifier="newForm"]' },
                duplicateFormModalTrigger: { identifier: '[data-identifier="duplicateForm"]' },
                removeFormModalTrigger: { identifier: '[data-identifier="removeForm"]' },

                
                newFormSavePath: { identifier: '[data-identifier="newFormSavePath"]' },
                advancedWizard: { identifier: '[data-identifier="advancedWizard"]' },
                newFormPrototypeName: { identifier: '[data-identifier="newFormPrototypeName"]' },
                newFormTemplate: { identifier: '[data-identifier="newFormTemplate"]' },

                duplicateFormName: { identifier: '[data-identifier="duplicateFormName"]' },
                duplicateFormSavePath: { identifier: '[data-identifier="duplicateFormSavePath"]' },

                showReferences: { identifier: '[data-identifier="showReferences"]' },
                referenceLink: { identifier: '[data-identifier="referenceLink"]' },
                */

                tooltip: { identifier: '[data-toggle="tooltip"]' }
            }
        };


        /**
         * @private
         *
         * @return void
         * @throws 1477506500
         * @throws 1477506501
         * @throws 1477506502
         */
        function _newDashboardSetup() {
            $(getDomElementIdentifier('newDashboardModalTrigger')).on('click', function(e) {
                e.preventDefault();

                /**
                 * Wizard step 1
                 */
                Wizard.addSlide('new-dashboard-step-1', TYPO3.lang['dashboardManager.newDashboardWizard.step1.title'], '', Severity.info, function(slide) {

                    var html, modal, nextButton;
                    modal = Wizard.setup.$carousel.closest('.modal');
                    nextButton = modal.find('.modal-footer').find('button[name="next"]');

                    html = '<div class="new-form-modal">'
                             + '<div class="form-horizontal">'
                                 + '<div>'
                                     + '<label class="control-label">' + TYPO3.lang['dashboardManager.dashboard_name'] + '</label>'
                                     + '<input class="new-dashboard-name form-control has-error" data-identifier="newDashboardName" />';

                    html +=        '</div>'
                             + '</div>'
                         + '</div>';

                    slide.html(html);
                    $(getDomElementIdentifier('newDashboardName'), modal).focus();

                    $(getDomElementIdentifier('newDashboardName'), modal).on('keyup paste', function(e) {
                        if ($(this).val().length > 0) {
                            $(this).removeClass('has-error');
                            Wizard.unlockNextStep();
                            Wizard.set('dashboardName', $(this).val());
                        } else {
                            $(this).addClass('has-error');
                            Wizard.lockNextStep();
                        }
                    });

                    nextButton.on('click', function() {
                        Wizard.setup.forceSelection = false;
                        Icons.getIcon('spinner-circle-dark', Icons.sizes.large, null, null).done(function(markup) {
                            slide.html($('<div />', {class: 'text-center'}).append(markup));
                        });
                    });
                });

                /**
                 * Wizard step 2
                 */
                Wizard.addSlide('new-dashboard-step-2', TYPO3.lang['dashboardManager.newDashboardWizard.step2.title'], TYPO3.lang['dashboardManager.newDashboardWizard.step2.message'], Severity.info);

                /**
                 * Wizard step 3
                 */
                Wizard.addFinalProcessingSlide(function() {
                    $.post(_dashboardManagerApp.getAjaxEndpoint('create'), {
                        tx_dashboard_system_dashboarddashboardmod1: {
                            dashboardName: Wizard.setup.settings['dashboardName']
                        }
                    }, function(data, textStatus, jqXHR) {
                        document.location = data;
                        Wizard.dismiss();
                    }).fail(function(jqXHR, textStatus, errorThrown) {
                        Notification.error(textStatus, errorThrown, 2);
                        Wizard.dismiss();
                    });
                }).done(function() {
                    Wizard.show();
                });
            });
        };

        /**
         * @public
         *
         * @param string elementIdentifier
         * @param string type
         * @return mixed|undefined
         * @throws 1477506413
         * @throws 1477506414
         */
        function getDomElementIdentifier(elementIdentifier, type) {
            _dashboardManagerApp.assert(elementIdentifier.length > 0, 'Invalid parameter "elementIdentifier"', 1477506413);
            _dashboardManagerApp.assert(typeof _domElementIdentifierCache[elementIdentifier] !== "undefined", 'elementIdentifier "' + elementIdentifier + '" does not exist', 1477506414);
            if (typeof type === "undefined") {
                type = 'identifier';
            }

            return _domElementIdentifierCache[elementIdentifier][type] || undefined;
        };

        function _gridStackSetup() {
            $(getDomElementIdentifier('gridStack')).gridstack({
                width: 12,
                alwaysShowResizeHandle: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
                resizable: {
                    handles: 'se, sw'
                }
            });
            $(getDomElementIdentifier('gridStack')).on('change', function(event, items) {
                // Notification.error('egege', 'errorThrown', 2);
                // console.log(event);
                // console.log(items);
                // console.log(_dashboardManagerApp.getAjaxEndpoint('change'));
                
                $.post(_dashboardManagerApp.getAjaxEndpoint('change'), {
                    tx_dashboard_system_dashboarddashboardmod1: {
                        items: 'testing change'
                        /*items: JSON.stringify(items)*/
                    }
                }, function(data, textStatus, jqXHR) {
                    Notification.success(data, 'ok', 2);
                }).fail(function(jqXHR, textStatus, errorThrown) {
                    console.log('change failed');
                    Notification.error(textStatus, errorThrown, 2);
                });
                
            });
        }

        /**
         * @public
         *
         * @param object dashboardManagerApp
         * @return void
         */
        function bootstrap(dashboardManagerApp) {
            _dashboardManagerApp = dashboardManagerApp;
            _domElementIdentifierCacheSetup();
            _newDashboardSetup();
            /*_removeFormSetup();
            _newFormSetup();
            _duplicateFormSetup();
            _showReferencesSetup();*/
            _gridStackSetup();
            $(getDomElementIdentifier('tooltip')).tooltip();
        };

        /**
         * Publish the public methods.
         * Implements the "Revealing Module Pattern".
         */
        return {
            bootstrap: bootstrap,
        };
    })($, Modal, Severity, Wizard, Icons, Notification, gridstack, gridstackjqueryui);
});