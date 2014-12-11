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
                minHeight: 140,
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
                floatable: true,
                split: true,
                width: '40%',
                minWidth: 120,
                minHeight: 140,
                html: '<div id="web-frame" class="web-frame"></div>',
                tools: [
                    {
                        xtype: 'textfield',
//                    fieldLabel: 'URL',
                        allowBlank: false,
                        name: 'current_url',
                        anchor: '95%',
                        width: '100%',
//                        vtype: 'url',
                        emptyText: 'http://www.google.com'
                    }
                ],
//                title: '<input type="text" placeholder="www.google.com/*" /> ',
                title: 'URL'
            }
        ]
    });
    main.setup();
//    var viewportContainer = Ext.create('Ext.panel.Panel', {
//        layout: 'fit',
//        renderTo: Ext.Element.get('main-content'),
//        defaults: {
//            split: true
//        },
//        items: [viewport]
//    });
});
