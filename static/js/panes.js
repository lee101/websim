Ext.require(['*']);

Ext.onReady(function () {

    Ext.state.Manager.setProvider(Ext.create('Ext.state.CookieProvider'));

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
                layout: 'absolute',
                title: 'Starts at width 30%',
                split: true,
                width: '20%',
                minWidth: 100,
                minHeight: 140,
                bodyPadding: 10,
                stateId: 'westRegion',
                stateful: true,
                html: '<div style="position:absolute;bottom:10px;right:10px;">' +
                    'west<br>I am floatable and stateful!</div>',
                items: [
                    {
                        xtype: 'regionsetter'
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
                tools: [{
                    xtype: 'textfield',
//                    fieldLabel: 'URL',
                    allowBlank: false,
                    name: 'first',
                    anchor: '95%',
                    width: '100%',
                    vtype: 'url',
                    emptyText: 'http://www.google.com/*'
                }],
//                title: '<input type="text" placeholder="www.google.com/*" /> ',
                title: 'URL',
                layout: {
                    type: 'vbox',
                    padding: 5,
                    align: 'stretch'
                }
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
