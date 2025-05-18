Ext.require(['*']);

Ext.onReady(function () {

    Ext.state.Manager.setProvider(Ext.create('Ext.state.CookieProvider'));

    Ext.apply(Ext.form.field.VTypes, {
        omnibar: function (url) {
            // validate url
            // HEAD request ?
            return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(url);
        },
        omnibarText: 'Network error',
        omnibarMask: /[\d\.]/i
    });

    window.viewport = Ext.create('Ext.panel.Panel', {
        renderTo: Ext.Element.get('main-content'),
        height: '100%',
        minHeight: 700,
        width: '100%',
        layout: {
            type: 'border',
            padding: 5
        },
        defaults: {
            split: true
        },
        items: [
            {
                region: 'west',
                collapsible: true,
//                layout: 'absolute',
                title: 'Options',
                split: true,
                width: '20%',
                minWidth: 100,
                minHeight: 700,
                height: '100%',
                bodyPadding: 10,
                stateId: 'westRegion',
                stateful: true,
                html: '',
                items: [
                    {
                        xtype: 'textfield',
                        allowBlank: true,
                        name: 'fiddle_title',
                        id: 'title',
                        vtype: 'text',
                        width: '100%',
                        emptyText: 'name your fiddle'
                    },
                    {
                        xtype: 'textarea',
                        allowBlank: true,
                        name: 'fiddle_description',
                        id: 'description',
                        title: 'description',
                        vtype: 'text',
                        width: '100%',
                        emptyText: 'description'
                    },
                    {
                        xtype: 'textfield',
                        allowBlank: true,
                        name: 'start_url',
                        id: 'start_url',
//                        vtype: 'url',
                        width: '100%',
                        emptyText: 'starting url'
                    },
                    {
                        xtype: 'panel',
                        html: '<div id="fullscreen-content" style="width: 100%; height: 100%; min-height: 700px;"></div>',
                        width: '100%',
                        height: '100%',
                        minHeight: 700,
                        layout: 'fit'
                    }
                ],
                tools: [
                ]
            },
            {
                region: 'center',
                html: '<div id="js-editor" class="code-editor"></div>',
                title: 'JavaScript',
                minHeight: 80
            },
            {
                region: 'south',
                height: '50%',
                split: true,
                collapsible: false,
                title: 'CSS',
                minHeight: 60,
                html: '<div id="css-editor" class="code-editor"></div>',
                weight: -100
            },
            {
                region: 'east',
                xtype: 'tabpanel',
                floatable: true,
                split: true,
                width: '40%',
                minWidth: 120,
                minHeight: 140,
                items: [
                    {
                        title: 'Browser',
                        itemId: 'browser-tab',
                        html: '<div id="web-frame" class="web-frame"></div>'
                    },
                    {
                        title: 'HTML',
                        itemId: 'html-tab',
                        html: '<div id="html-editor" class="code-editor"></div>'
                    }
                ],
                tbar: [
                    {
                        iconCls: 'fa fa-arrow-left',
                        handler: function () {
                            if (window.webFrame && window.webFrame.back) {
                                window.webFrame.back();
                            }
                        }
                    },
                    {
                        iconCls: 'fa fa-arrow-right',
                        handler: function () {
                            if (window.webFrame && window.webFrame.forward) {
                                window.webFrame.forward();
                            }
                        }
                    },
                    {
                        xtype: 'textfield',
                        allowBlank: false,
                        name: 'current_url',
                        flex: 1,
                        emptyText: 'http://cats.com'
                    }
                ],
                listeners: {
                    tabchange: function (panel, newCard) {
                        if (newCard.itemId === 'html-tab' && window.webFrame && window.webFrame.syncHTML) {
                            window.webFrame.syncHTML();
                        }
                    }
                },
                title: 'Browser'
            }
        ]
    });
    main.setup();

    window.setTimeout(function () {
        var adcode = '<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-8598649123553748" ' +
                              'data-ad-slot="7003733604" data-ad-format="auto" data-full-width-responsive="true"></ins>' +
                              '<script>' +
                              '(adsbygoogle = window.adsbygoogle || []).push({});' +
                              '</script>'

        // fullscreen-content
        var fullscreenContent = document.getElementById('fullscreen-content');
        if (fullscreenContent) {
            fullscreenContent.innerHTML = adcode;
            (adsbygoogle = window.adsbygoogle || []).push({});
        } else {
            console.warn('Element with id "fullscreen-content" not found');
        }
    }, 3000);
//    var viewportContainer = Ext.create('Ext.panel.Panel', {
//        layout: 'fit',
//        renderTo: Ext.Element.get('main-content'),
//        defaults: {
//            split: true
//        },
//        items: [viewport]
//    });
});
