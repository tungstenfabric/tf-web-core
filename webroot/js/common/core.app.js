/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var contentContainer = "#content-container";
var slickGridSearchtimer = null;
// Need to add a check and declare globalObj only if it doesn't exist and if exists need to extend with this map
if(typeof(globalObj) == "undefined")
    globalObj = {};
globalObj['env'] = "";
globalObj['loadedScripts'] = [];
//Maintains a deferredObj for each feature pkg and are resolved when the global modules for that feature pkg are available
globalObj['initFeatureAppDefObjMap'] = {};
globalObj['siteMap'] = {};
globalObj['siteMapSearchStrings'] = [];
/* The below flag signifies while communicating with http introspect, should we go through proxy or
 * not
 */
var loadIntrospectViaProxy = true;
var FEATURE_PCK_WEB_CONTROLLER = "webController",
    FEATURE_PCK_WEB_STORAGE = "webStorage",
    FEATURE_PCK_WEB_SERVER_MANAGER = "serverManager";

function getCoreAppPaths(coreBaseDir, coreBuildDir, env) {
    /**
     * coreBaseDir: Apps Root directory.
     * coreWebDir: Root directory from the contents will be served. Either built or source depending on env.
     *
     * core-srcdir: Require path id pointing to root directory for the source files which are delivered.
     * in a 'prod' env to use the file in source form (i.e not minified version), use path with prefix 'core-srcdir'
     * eg: use 'core-srcdir/js/views/GridView' as path to access GridView source instead of minified.
     */
    var coreWebDir = coreBaseDir + coreBuildDir;
    if (typeof(window) !== "undefined") {
        window.coreWebDir = coreWebDir;
    }
    if(env == null)
        env = globalObj['env'];
    //RequireJS alias mapping
    //Aliases that are needed for both prod & dev environment
    var aliasMap = {
        'core-srcdir'                 : coreBaseDir,
        'core-basedir'                : coreWebDir,
        //Bundles
        'thirdparty-libs'             : coreWebDir + '/js/common/thirdparty.libs',
        'contrail-core-views'         : coreWebDir + '/js/common/contrail.core.views',
        'chart-libs'                  : coreWebDir + '/js/common/chart.libs',
        'core-bundle'                 : coreWebDir + '/js/common/core.bundle',
        'global-libs'                 : coreWebDir + '/js/common/global-libs',
        'jquery-dep-libs'             : coreWebDir + '/js/common/jquery.dep.libs',
        'nonamd-libs'                 : coreWebDir + '/js/common/nonamd.libs',
        //Files not in bundles
        'widget-configmanager'        : coreWebDir + '/js/widget.configmanager',
        'gridstack'                   : coreWebDir + '/assets/gridstack/js/gridstack',
        'toolbar'                     : coreWebDir + '/assets/toolbar/js/jquery.toolbar',
        'underscore'                  : coreWebDir + '/assets/underscore/underscore-min',
        'slickgrid-utils'             : coreWebDir + "/js/slickgrid-utils",
        //'jquery'                      : coreWebDir + '/assets/jquery/js/jquery-1.8.3.min',
        //'jquery'                      : coreWebDir + '/assets/jquery/js/jquery-1.9.1.min',
        'jquery'                      : coreWebDir + '/assets/jquery/js/jquery.min',
        'lodashv4'                    : coreWebDir + '/assets/lodash-v4.17.12/js/lodash.min',
        'd3v4'                        : coreWebDir + '/assets/d3-v4.4.3/js/d3.min',
        'contrail-load'               : coreWebDir + '/js/contrail-load',
        'vis'                         : coreWebDir + '/assets/vis-v4.9.0/js/vis.min',
        'vis-node-model'              : coreWebDir + '/js/models/VisNodeModel',
        'vis-edge-model'              : coreWebDir + '/js/models/VisEdgeModel',
        'vis-tooltip-model'           : coreWebDir + '/js/models/VisTooltipModel',
        'color-scheme'                : coreWebDir + '/js/color_schemes',
        'palette'                     : coreWebDir + '/assets/palette/js/palette',
        'graph-view'                  : coreWebDir + '/js/views/GraphView',
        'contrail-graph-model'        : coreWebDir + '/js/models/ContrailGraphModel',
        'dagre'                       : coreWebDir + '/assets/joint/js/dagre',
        'geometry'                    : coreWebDir + '/assets/joint/js/geometry',
        'vectorizer'                  : coreWebDir + '/assets/joint/js/vectorizer',
        'joint.layout.DirectedGraph'  : coreWebDir + '/assets/joint/js/joint.layout.DirectedGraph',
        'joint'                       : coreWebDir + '/assets/joint/js/joint.clean',
        'joint.contrail'              : coreWebDir + '/js/common/joint.contrail',

        'event-drops'                 : coreWebDir + '/assets/event-drops/js/eventDrops',

        'core-alarm-utils'            :  coreWebDir + '/js/common/core.alarms.utils',
        'core-alarm-parsers'          :  coreWebDir + '/js/common/core.alarms.parsers',

        'query-form-view'             : coreWebDir + '/js/views/QueryFormView',
        'contrail-vis-view'           : coreWebDir + '/js/views/ContrailVisView',
        'contrail-config-model'       : coreWebDir + '/js/models/ContrailConfigModel',

        'query-form-model'            : coreWebDir + '/js/models/QueryFormModel',
        'query-or-model'              : coreWebDir + '/js/models/QueryOrModel',
        'query-and-model'             : coreWebDir + '/js/models/QueryAndModel',
        'contrail-vis-model'          : coreWebDir + '/js/models/ContrailVisModel',

        'loginwindow-model'           : coreWebDir + '/js/models/LoginWindowModel',
        'xml2json'                    : coreWebDir + '/assets/jquery/js/xml2json',

        'json-editor'                 : coreWebDir + '/assets/jsoneditor/js/jsoneditor.min',
        'ajv'                         : coreWebDir + '/assets/ajv/ajv.min',
        'json-model'                  : coreWebDir + "/js/models/JsonModel",
        'json-edit-view'              : coreWebDir + '/js/views/JsonEditView',
        'jquery-ui'                   : coreWebDir + '/assets/jquery-ui/js/jquery-ui.min',
        'schema-model'                : coreWebDir + '/js/models/SchemaModel',
        'json-validator'              : coreWebDir + '/js/common/json.validator',
        'iframe-view'                 : coreWebDir + '/js/views/IframeView',
        'jdorn-jsoneditor'            : coreWebDir + '/assets/jdorn-jsoneditor/js/jdorn-jsoneditor',
        'jquery-linedtextarea'        : coreWebDir + '/assets/jquery-linedtextarea/js/jquery-linedtextarea',
        'qe-module'                   : coreWebDir + '/reports/qe/ui/js/qe.module',
        'udd-module'                  : coreWebDir + '/reports/udd/ui/js/udd.module',
        'chart-config'                : coreWebDir + '/js/chartconfig',
        'legend-view'                 : coreWebDir + '/js/views/LegendView',
        'alarms-viewconfig'           : coreWebDir + '/js/views/alarms/alarms.viewconfig',
        'contrail-charts-view'        : coreWebDir + '/js/views/ContrailChartsView',
        'contrail-charts'             : coreWebDir + '/assets/contrail-charts/js/contrail-charts',
        'node-color-mapping'          : coreWebDir + '/js/NodeColorMapping',
        'toolbar-view'                : coreWebDir + '/js/views/ToolbarView'
    };

    //Separate out aliases that need to be there for both prod & dev environments
    if(env == "dev") {
        var devAliasMap = {
            //Start - Core-bundle aliases
            'toolbar-view'                : coreWebDir + '/js/views/ToolbarView',
            'core-utils'                  : coreWebDir + '/js/common/core.utils',
            'core-hash-utils'             : coreWebDir + '/js/common/core.hash.utils',
            'core-constants'              : coreWebDir + '/js/common/core.constants',
            'core-formatters'             : coreWebDir + '/js/common/core.formatters',
            'core-cache'                  : coreWebDir + '/js/common/core.cache',
            'core-labels'                 : coreWebDir + '/js/common/core.labels',
            'core-messages'               : coreWebDir + '/js/common/core.messages',
            'core-views-default-config'   : coreWebDir + '/js/common/core.views.default.config',
            'chart-utils'                 : coreWebDir + "/js/common/chart.utils",
            'contrail-remote-data-handler': coreWebDir + '/js/handlers/ContrailRemoteDataHandler',
            'cf-datasource'               : coreWebDir + '/js/common/cf.datasource',
            'contrail-view'               : coreWebDir + '/js/views/ContrailView',
            'chart-view'                  : coreWebDir + '/js/views/ChartView',
            'contrail-model'              : coreWebDir + '/js/models/ContrailModel',
            'contrail-view-model'         : coreWebDir + '/js/models/ContrailViewModel',
            'contrail-list-model'         : coreWebDir + '/js/models/ContrailListModel',
            'contrail-element'            : coreWebDir + '/js/models/ContrailElement',
            'lodash'                      : coreWebDir + '/assets/lodash/lodash.min',
            'crossfilter'                 : coreWebDir + '/assets/crossfilter/js/crossfilter',
            'backbone'                    : coreWebDir + '/assets/backbone/backbone-min',
            'text'                        : coreWebDir + '/assets/requirejs/text',
            'knockout'                    : coreWebDir + '/assets/knockout/knockout',
            'moment'                      : coreWebDir + "/assets/moment/moment",
            'layout-handler'              : coreWebDir + '/js/handlers/LayoutHandler',
            'menu-handler'                : coreWebDir + '/js/handlers/MenuHandler',
            'content-handler'             : coreWebDir + '/js/handlers/ContentHandler',
            'validation'                  : coreWebDir + '/assets/backbone/backbone-validation-amd',
            'mon-infra-node-list-model'   : coreWebDir + '/js/models/NodeListModel',
            'mon-infra-log-list-model'    : coreWebDir + '/js/models/LogListModel',
            'mon-infra-alert-list-view'   : coreWebDir + '/js/views/AlertListView',
            'mon-infra-alert-grid-view'   : coreWebDir + '/js/views/AlertGridView',
            'mon-infra-sysinfo-view'      : coreWebDir + '/js/views/SystemInfoView',
            //'mon-infra-dashboard-view'    : coreWebDir + '/js/views/MonitorInfraDashboardView',
            //End - core-bundle aliases
            //Start - jquery.dep.libs aliases
            'jquery.xml2json'            : coreWebDir + '/assets/jquery/js/jquery.xml2json',
            'jquery.json'                : coreWebDir + "/assets/slickgrid/js/jquery.json-2.3.min",
            'bootstrap'                  : coreWebDir + '/assets/bootstrap/js/bootstrap',
            'select2'                    : coreWebDir + "/assets/select2/js/select2.min",
            'slick.core'                 : coreWebDir + "/assets/slickgrid/js/slick.core",
            'slick.dataview'             : coreWebDir + "/assets/slickgrid/js/slick.dataview",
            'core-contrail-form-elements': coreWebDir + "/js/common/core.contrail.form.elements",
            'jquery.timer'              : coreWebDir + '/assets/jquery/js/jquery.timer',
            'jquery.ui.touch-punch'     : coreWebDir + '/assets/jquery/js/jquery.ui.touch-punch.min',
            'jquery.validate'           : coreWebDir + "/assets/jquery/js/jquery.validate.min",
            'jquery.tristate'           : coreWebDir + "/assets/jquery/js/jquery.tristate",
            'jquery.multiselect'        : coreWebDir + "/assets/jquery-ui/js/jquery.multiselect",
            'jquery.multiselect.filter' : coreWebDir + "/assets/jquery-ui/js/jquery.multiselect.filter",
            'jquery.steps.min'          : coreWebDir + "/assets/jquery/js/jquery.steps.min",
            'jquery.panzoom'            : coreWebDir + "/assets/jquery/js/jquery.panzoom.min",
            'jquery.event.drag'         : coreWebDir + "/assets/slickgrid/js/jquery.event.drag-2.2",
            'jquery.datetimepicker'     : coreWebDir + "/assets/datetimepicker/js/jquery.datetimepicker",

            //End - jquery.dep.libs aliases
            //Start - thirdparty-libs aliases
            'handlebars'                : coreWebDir + "/assets/handlebars/handlebars.min",
            'core-handlebars-utils'     : coreWebDir + "/js/common/core.handlebars.utils",

            'slick.grid'                : coreWebDir + "/assets/slickgrid/js/slick.grid",
            'slick.checkboxselectcolumn': coreWebDir + '/assets/slickgrid/js/slick.checkboxselectcolumn',
            'slick.groupmetadata'       : coreWebDir + "/assets/slickgrid/js/slick.groupitemmetadataprovider",
            'slick.rowselectionmodel'   : coreWebDir + '/assets/slickgrid/js/slick.rowselectionmodel',
            'slick.enhancementpager'    : coreWebDir + "/assets/slickgrid/js/slick.enhancementpager",
            'knockback'                 : coreWebDir + '/assets/backbone/knockback.min',
            //End - thirdparty-libs aliases
            //Start - chart-libs aliases
            'd3'                        : coreWebDir + '/assets/d3-v3.5.6/js/d3',
            'nv.d3'                     : coreWebDir + '/assets/nvd3-v1.8.1/js/nv.d3',
            //End - chart-libs aliases
            //Start - nonamd-libs aliases
            'web-utils'                 : coreWebDir + "/js/web-utils",
            'analyzer-utils'            : coreWebDir + "/js/analyzer-utils",
            'config_global'             : coreWebDir + "/js/config_global",
            'contrail-layout'           : coreWebDir + '/js/contrail-layout',
            'contrail-common'           : coreWebDir + "/js/contrail-common",
            'uuid'                      : coreWebDir + "/js/uuid",
            'protocol'                  : coreWebDir + "/js/protocol",
            'jsbn-combined'             : coreWebDir + "/assets/ip/jsbn-combined",
            'xdate'                     : coreWebDir + "/assets/xdate/js/xdate",
            'sprintf'                   : coreWebDir + "/assets/ip/sprintf",
            'ipv6'                      : coreWebDir + "/assets/ip/ipv6",
            'jsonpath'                  : coreWebDir + '/assets/jsonpath/js/jsonpath-0.8.0',
            //End - nonamd-libs aliases

            'infoboxes'                   : coreWebDir + '/js/views/InfoboxesView',
            'barchart-cf'                 : coreWebDir + '/js/views/BarChartView',
            'storage-init'                : 'empty:',
            'legend-view'                 : coreWebDir + '/js/views/LegendView',
            'gs-view'                     : coreWebDir + '/js/views/GridStackView',
            'global-controller-viewconfig': 'empty:',
            'controlnode-widgetcfg'       : 'empty:',
            'vrouter-widgetcfg'           : 'empty:',
            'databasenode-widgetcfg'      : 'empty:',
            'analyticsnode-widgetcfg'     : 'empty:',
            'confignode-widgetcfg'        : 'empty:',
            'security-dashboard-widgetcfg': 'empty:',
            'monitor-infra-widgetcfg'     : 'empty:',
            'confignode-modelcfg'         : 'empty:',
            'controlnode-modelcfg'        : 'empty:',
            'security-dashboard-modelcfg' : 'empty:',
            'vrouter-modelcfg'            : 'empty:',
            'databasenode-modelcfg'       : 'empty:',
            'analyticsnode-modelcfg'      : 'empty:',
            'monitor-infra-modelcfg'      : 'empty:',
            'monitor-infra-viewcfg'       : 'empty:',
            'confignode-viewcfg'          : 'empty:',
            'databasenode-viewcfg'        : 'empty:',
            'vrouter-viewcfg'             : 'empty:',
            'alarms-viewconfig'           : 'empty:',
            'security-dashboard-viewcfg': 'empty:',
            'core-alarm-utils'            :  coreWebDir + '/js/common/core.alarms.utils',
            'alarms-viewconfig'           : coreWebDir + '/js/views/alarms/alarms.viewconfig'
        };
        //Merge common (for both prod & dev) alias
        for(var currAlias in devAliasMap)
            aliasMap[currAlias] = devAliasMap[currAlias]

    } else if(env == "prod") {
        var prodAliasMap = {
            'controller-basedir'          : coreBaseDir,
            'backbone'                    : coreWebDir + '/assets/backbone/backbone-min',
            'knockout'                    : coreWebDir + '/assets/knockout/knockout',
            'knockback'                 : coreWebDir + '/assets/backbone/knockback.min',
            'validation'                  : coreWebDir + '/assets/backbone/backbone-validation-amd'
        }
        //Merge common (for both prod & dev) alias
        for(var currAlias in prodAliasMap)
            aliasMap[currAlias] = prodAliasMap[currAlias]
    }
    return aliasMap;
};

var coreAppMap = {
    '*': {
        'underscore': 'underscore'
    }
};

var coreAppShim =  {
    'core-bundle': {
        deps:['nonamd-libs', 'jquery-ui']
    },
    'd3v4' : {
        exports: 'd3v4'
    },
    'jquery' : {
        exports: 'jQuery'
    },
    'jquery.multiselect' : {
        deps: ['jquery-ui'],
    },
    'jquery.tristate' : {
        deps: ['jquery-ui']
    },
    'jquery.multiselect.filter' : {
        deps: ['jquery-ui']
    },
    'jquery.steps.min' : {
        deps: ['jquery']
    },
    'bootstrap' : {
        deps: ["jquery"]
    },
    'd3' : {
        deps: ["jquery"],
        exports: 'd3'
    },
    'nv.d3' : {
        deps: ['d3'],
        exports: 'nv'
    },
    'crossfilter' : {
        deps: [],
        exports:'crossfilter'
    },
    'jquery.xml2json' : {
        deps: ["jquery"]
    },
    'xml2json' : {
        deps: ["jquery"]
    },
    "jquery.timer" : {
        deps: ['jquery']
    },
    "jquery-ui" : {
        deps: ['jquery']
    },
    'jquery.ui.touch-punch' : {
        deps: ['jquery','jquery-ui']
    },
    'jquery.validate': {
        deps: ['jquery']
    },
    'select2': {
        deps: ['jquery']
        // exports: "$.fn.select2"
    },
    'jquery.event.drag': {
        deps: ['jquery']
    },
    'jquery.json': {
        deps: ['jquery']
    },
    'jquery.datetimepicker': {
        deps: ['jquery']
    },
    'slick.core': {
        deps:['jquery']
    },
    'slick.grid': {
        deps:['jquery.event.drag']
    },
    'contrail-common': {
        deps: ['jquery']
    },
    'slick.rowselectionmodel': {
        deps: ['jquery']
    },
    'slick.checkboxselectcolumn': {
        deps: ['jquery']
    },
    'slick.dataview': {
        deps: ['jquery','slick.groupmetadata']
    },
    'slick.groupmetadata': {
        deps: ['jquery']
    },
    'thirdparty-libs' : {
        deps: ['jquery-ui']
    },
    'slickgrid-utils': {
        deps: ['jquery','slick.grid','slick.dataview']
    },
    'core-contrail-form-elements': {
        deps: ['jquery-ui']
    },
    'chart-utils': {
        deps: ['jquery']
    },
    'web-utils': {
        deps: ['jquery','knockout']
    },
    'core-handlebars-utils': {
        deps: ['jquery','handlebars']
    },
    'nvd3-plugin': {
        deps: ['nv.d3']
    },
    'd3-utils': {
        deps: ['d3']
    },
    'select2-utils': {
        deps: ['jquery']
    },
    'ipv6' : {
        deps: ['sprintf','jsbn-combined']
    },
    'backbone': {
        deps: ['lodash'],
        exports: 'Backbone'
    },
    'joint': {
        deps: ['geometry', 'vectorizer', 'backbone'],
        exports: 'joint',
        init: function (geometry, vectorizer) {
            this.g = geometry;
            this.V = vectorizer;
        }
    },
    'underscore' : {
        init: function() {
            _.noConflict();
        }
    },
    'vis': {
        deps: ['jquery'],
        exports: 'vis'
    },
    'knockout': {
        deps: ['jquery']
    },
    'validation': {
        deps: ['backbone']
    },
    /*'bezier': {
        deps: ['jquery']
    },*/
    'joint.layout.DirectedGraph': {
        deps: ['joint']
    },
    'joint.contrail': {
        deps: ['joint.layout.DirectedGraph']
    },
    'contrail-model': {
        deps: ['knockback']
    },
    'contrail-list-model': {
        deps: ['contrail-remote-data-handler']
    },
    'gridstack' :{
        deps:['jquery-ui']
    }
};

var coreBundles = {
        //chart-libs,thirdparty-libs,contrail-core-views are loaded lazily
        /*'chart-libs'        : [
            'd3',
            'nv.d3'
        ],*/
        'thirdparty-libs'   : [
           'jquery.xml2json',
           'jquery.json',
           'bootstrap',
           'select2',
           'slick.core',
           'slick.dataview',
           //From jquery-libs
           'jquery.timer',
           'jquery.ui.touch-punch',
           'jquery.validate',
           'jquery.tristate',
           'jquery.multiselect',
           'jquery.multiselect.filter',
           'jquery.steps.min',
           'jquery.panzoom',
           'jquery.event.drag',
           'jquery.datetimepicker',
            'slick.grid',
            'slick.checkboxselectcolumn',
            'slick.groupmetadata',
            'slick.rowselectionmodel',
            'slick.enhancementpager',
            'jsbn-combined',
            'sprintf',
            'ipv6',
            'xdate',
            'd3',
            'nv.d3'
        ],
        /*'jquery-dep-libs': [
            'jquery.xml2json',
            'jquery.json',
            'bootstrap',
            'select2',
            'slick.core',
            'slick.dataview',
            'jquery.timer',
            'jquery.ui.touch-punch',
            'jquery.validate',
            'jquery.tristate',
            'jquery.multiselect',
            'jquery.multiselect.filter',
            'jquery.steps.min',
            'jquery.panzoom',
            'jquery.event.drag',
            'jquery.datetimepicker'
        ],*/
        'core-bundle'       : [
            'underscore',
            'moment',
            'handlebars',
            'core-handlebars-utils',
            'core-utils',
            'core-hash-utils',
            'core-constants',
            'core-formatters',
            'core-cache',
            'core-labels',
            'core-messages',
            'core-views-default-config',
            'contrail-common',
            'core-contrail-form-elements',
            'chart-utils',
            'text!core-basedir/common/ui/templates/core.common.tmpl',
            'core-basedir/js/common/graph.utils',
            'contrail-remote-data-handler',
            'cf-datasource',
            'contrail-view',
            'contrail-model',
            'contrail-view-model',
            'contrail-list-model',
            'contrail-element',
            'lodash',
            'crossfilter',
            'text',
            'backbone',
            'knockout',
            'knockback',
            'layout-handler',
            'menu-handler',
            'content-handler',
            'validation',
            'chart-config',
            'core-basedir/js/views/BarChartInfoView',
            'core-basedir/js/views/BreadcrumbDropdownView',
            'core-basedir/js/views/BreadcrumbTextView',
            'chart-view',
            'core-basedir/js/views/ControlPanelView',
            'core-basedir/js/views/InfoboxesView',
            'core-basedir/js/views/SectionView',
            'core-basedir/js/views/WidgetView',
            'core-basedir/js/views/ZoomScatterChartView',
            //Dashboard
            'mon-infra-node-list-model',
            'mon-infra-log-list-model',
            'mon-infra-alert-list-view',
            'mon-infra-alert-grid-view',
            "core-basedir/js/views/LogListView",
            'mon-infra-sysinfo-view',
            //'mon-infra-dashboard-view',
            'core-alarm-utils'
            //'mon-infra-dashboard-view'
        ],
        'contrail-core-views': [
            'core-basedir/js/views/GridView',
            'core-basedir/js/views/AccordianView',
            'core-basedir/js/views/DetailsView',
            'core-basedir/js/views/DonutChartView',
            'core-basedir/js/views/FormAutoCompleteTextBoxView',
            'core-basedir/js/views/FormButtonView',
            'core-basedir/js/views/FormCheckboxView',
            'core-basedir/js/views/FormCollectionView',
            'core-basedir/js/views/FormComboboxView',
            'core-basedir/js/views/FormCompositeView',
            'core-basedir/js/views/FormDateTimePickerView',
            'core-basedir/js/views/FormDropdownView',
            'core-basedir/js/views/configEditor/ConfigEditorModalView',
            'core-basedir/js/views/FormEditableGridView',
            'core-basedir/js/views/FormGridView',
            'core-basedir/js/views/FormHierarchicalDropdownView',
            'core-basedir/js/views/FormInputView',
            'core-basedir/js/views/FormMultiselectView',
            'core-basedir/js/views/FormNumericTextboxView',
            'core-basedir/js/views/FormRadioButtonView',
            'core-basedir/js/views/FormTextAreaView',
            'core-basedir/js/views/FormTextView',
            'core-basedir/js/views/GridFooterView',
            'core-basedir/js/views/HeatChartView',
            'core-basedir/js/views/HorizontalBarChartView',
            'core-basedir/js/views/LineBarWithFocusChartView',
            'core-basedir/js/views/LineWithFocusChartView',
            'core-basedir/js/views/LoginWindowView',
            'core-basedir/js/views/MultiBarChartView',
            'core-basedir/js/views/BarChartView',
            'core-basedir/js/views/MultiDonutChartView',
            'core-basedir/js/views/NodeConsoleLogsView',
            'core-basedir/js/views/QueryFilterView',
            'core-basedir/js/views/QueryResultGridView',
            'core-basedir/js/views/QueryResultLineChartView',
            'core-basedir/js/views/QuerySelectView',
            'core-basedir/js/views/QueryWhereView',
            'core-basedir/js/views/SparklineView',
            'core-basedir/js/views/TabsView',
            'core-basedir/js/views/WizardView',
            'gs-view',
            'legend-view',
            'core-basedir/js/views/CarouselView',
            'core-basedir/js/views/PercentileTextView',
            'core-basedir/js/views/ToolbarView',
            'core-basedir/js/views/StackedBarChartWithFocusView',
            'core-basedir/js/views/StackedAreaChartView'
        ],
        'nonamd-libs': [
            'web-utils',
            'analyzer-utils',
            'config_global',
            'contrail-layout',
            'uuid',
            'protocol',
            'xdate',
            'ipv6',
            'jsonpath'
        ],
        'qe-module': [
            "core-basedir/reports/qe/ui/templates/qe.tmpl",
            'core-basedir/reports/qe/ui/js/common/qe.utils',
            'core-basedir/reports/qe/ui/js/common/qe.parsers',
            'core-basedir/reports/qe/ui/js/common/qe.grid.config',
            'core-basedir/reports/qe/ui/js/common/qe.model.config',
            'core-basedir/reports/qe/ui/js/views/QueryEngineView',
            'core-basedir/reports/qe/ui/js/views/QueryQueueView',
            'core-basedir/reports/qe/ui/js/views/QueryTextView',
            'core-basedir/reports/qe/ui/js/views/ObjectLogsFormView',
            'core-basedir/reports/qe/ui/js/views/SystemLogsFormView',
            'core-basedir/reports/qe/ui/js/views/StatQueryFormView',
            'core-basedir/reports/qe/ui/js/models/ContrailListModelGroup',
            'core-basedir/reports/qe/ui/js/models/ObjectLogsFormModel',
            'core-basedir/reports/qe/ui/js/models/StatQueryFormModel',
            'core-basedir/reports/qe/ui/js/models/SystemLogsFormModel',
        ],
        'udd-module': [
            "core-basedir/reports/udd/ui/templates/udd.tmpl",
            "core-basedir/reports/udd/ui/js/common/udd.form.validation.config",
            "core-basedir/reports/udd/ui/js/common/udd.constants",
            "core-basedir/reports/udd/ui/js/models/contentConfigs/GridConfigModel",
            "core-basedir/reports/udd/ui/js/models/contentConfigs/LineBarChartConfigModel",
            "core-basedir/reports/udd/ui/js/models/contentConfigs/LineChartConfigModel",
            "core-basedir/reports/udd/ui/js/models/contentConfigs/LogsConfigModel",
            "core-basedir/reports/udd/ui/js/models/dataSourceConfigs/QueryConfigModel",
            "core-basedir/reports/udd/ui/js/models/ContentConfigModel",
            "core-basedir/reports/udd/ui/js/models/WidgetModel",
            "core-basedir/reports/udd/ui/js/models/WidgetsCollection",
            "core-basedir/reports/udd/ui/js/views/contentConfigs/GridConfigView",
            "core-basedir/reports/udd/ui/js/views/contentConfigs/LineBarChartConfigView",
            "core-basedir/reports/udd/ui/js/views/contentConfigs/LineChartConfigView",
            "core-basedir/reports/udd/ui/js/views/contentConfigs/LogsConfigView",
            "core-basedir/reports/udd/ui/js/views/dataSourceConfigs/QueryConfigView",
            "core-basedir/reports/udd/ui/js/views/BaseContentConfigView",
            "core-basedir/reports/udd/ui/js/views/GridStackView",
            "core-basedir/reports/udd/ui/js/views/UDDashboardView",
            "core-basedir/reports/udd/ui/js/views/WidgetView",
        ]
    };


function initBackboneValidation() {
    require(['validation'],function(kbValidation) {
        _.extend(kbValidation.callbacks, {
            invalid: function (view, attr, error, selector, validation) {
                var model = view.model;
                model.validateAttr(attr, validation);
            }
        });
    });
};

function initCustomKOBindings(Knockout) {
    require(['knockout'],function(Knockout) {
        Knockout.bindingHandlers.contrailDropdown = {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var elementConfig = {}, dropdown;

                if(contrail.checkIfExist(bindingContext) && contrail.checkIfExist(bindingContext.$root)){
                    var elementConfigMap = bindingContext.$root.elementConfigMap(),
                        elementName = $(element).attr("name");

                    elementConfig = elementConfigMap[elementName];
                }

                dropdown = $(element).contrailDropdown(elementConfig).data('contrailDropdown');
                Knockout.utils.domNodeDisposal.addDisposeCallback(element, function () {
                    dropdown.destroy();
                });
            },
            update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var elementConfig = {},
                    dropdown = $(element).data('contrailDropdown');

                if(contrail.checkIfExist(bindingContext) && contrail.checkIfExist(bindingContext.$root)){
                    var elementConfigMap = bindingContext.$root.elementConfigMap(),
                        elementName = $(element).attr("name");

                    elementConfig = elementConfigMap[elementName];
                }

                if (!contrail.checkIfExist(elementConfig.data) && !contrail.checkIfExist(elementConfig.dataSource) && allBindingsAccessor.get('optionList')) {
                    var valueBindingAccessor = allBindingsAccessor.get('value'),
                        value = Knockout.utils.unwrapObservable(valueBindingAccessor),
                        optionListBindingAccessor = allBindingsAccessor.get('optionList'),
                        optionList = Knockout.utils.unwrapObservable(optionListBindingAccessor);

                    value = contrail.checkIfFunction(value) ? value() : value;

                    if (contrail.checkIfFunction(optionList) && $.isArray(optionList(viewModel))) {
                        dropdown.setData(optionList(viewModel), value, true);
                    } else if ($.isArray(optionList)) {
                        dropdown.setData(optionList, value, true);
                    }
                }

                if (allBindingsAccessor.get('value')) {
                    var valueBindingAccessor = allBindingsAccessor.get('value'),
                        value = Knockout.utils.unwrapObservable(valueBindingAccessor);

                    value = contrail.checkIfFunction(value) ? value() : value;
                    //required for hierarchical dropdown
                    if(elementConfig.queryMap) {
                        var data = dropdown.getAllData();
                        if(!contrail.isItemExists(value, data)) {
                            contrail.appendNewItemMainDataSource(value, data);
                        }
                    }
                    if (contrail.checkIfExist(value) && value !== '') {
                        dropdown.value(value, true);
                    }
                }
            }
        };

        Knockout.bindingHandlers.contrailMultiselect = {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var elementConfig = {}, multiselect;

                if (contrail.checkIfExist(bindingContext) && contrail.checkIfExist(bindingContext.$root)) {
                    var elementConfigMap = bindingContext.$root.elementConfigMap(),
                        elementName = $(element).attr("name");

                    elementConfig = elementConfigMap[elementName];
                }

                multiselect = $(element).contrailMultiselect(elementConfig).data('contrailMultiselect');

                Knockout.utils.domNodeDisposal.addDisposeCallback(element, function () {
                    multiselect.destroy();
                });
            },
            update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var elementConfig = {}, multiselect = $(element).data('contrailMultiselect');

                if(contrail.checkIfExist(bindingContext) && contrail.checkIfExist(bindingContext.$root)){
                    var elementConfigMap = bindingContext.$root.elementConfigMap(),
                        elementName = $(element).attr("name");

                    elementConfig = elementConfigMap[elementName];
                }

                if (!contrail.checkIfExist(elementConfig.data) && !contrail.checkIfExist(elementConfig.dataSource) && allBindingsAccessor.get('optionList')) {
                    var valueBindingAccessor = allBindingsAccessor.get('value'),
                        value = Knockout.utils.unwrapObservable(valueBindingAccessor),
                        optionListBindingAccessor = allBindingsAccessor.get('optionList'),
                        optionList = Knockout.utils.unwrapObservable(optionListBindingAccessor);

                if (contrail.checkIfFunction(optionList)) {
                    optionList = optionList(viewModel);
                }

                var formattedOptionList = cowu.formatFormData(optionList, elementConfig),
                    currentOptionList = multiselect.getAllData();

                if (JSON.stringify(formattedOptionList) !== JSON.stringify(currentOptionList)) {
                        value = contrail.checkIfFunction(value) ? value() : value;
                        if (value !== '') {
                            value = $.isArray(value) ? value : [value];
                        } else if (value === '') {
                            value = [];
                        }

                    multiselect.setData(optionList, value, true);
                    }
                }

                if (allBindingsAccessor.get('value')) {
                    var valueBindingAccessor = allBindingsAccessor.get('value'),
                        value = Knockout.utils.unwrapObservable(valueBindingAccessor);

                    value = contrail.checkIfFunction(value) ? value() : value;

                    if (contrail.checkIfExist(value)) {
                        if (value !== '') {
                            value = $.isArray(value) ? value : [value];
                            multiselect.value(value, true);
                        } else if (value === '') {
                            multiselect.value([], true);
                        }
                    }
                }
            }
        };

        Knockout.bindingHandlers.contrailCombobox = {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var elementConfig = {}, combobox;

                if(contrail.checkIfExist(bindingContext) && contrail.checkIfExist(bindingContext.$root)){
                    var elementConfigMap = bindingContext.$root.elementConfigMap(),
                        elementName = $(element).attr("name");

                    elementConfig = elementConfigMap[elementName];
                }

                combobox = $(element).contrailCombobox(elementConfig).data('contrailCombobox');

                Knockout.utils.domNodeDisposal.addDisposeCallback(element, function () {
                    combobox.destroy();
                });
            },
            update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var elementConfig = {}, combobox = $(element).data('contrailCombobox');

                if(contrail.checkIfExist(bindingContext) && contrail.checkIfExist(bindingContext.$root)){
                    var elementConfigMap = bindingContext.$root.elementConfigMap(),
                        elementName = $(element).attr("name");

                    elementConfig = elementConfigMap[elementName];
                }

                if (!contrail.checkIfExist(elementConfig.data) && !contrail.checkIfExist(elementConfig.dataSource) && allBindingsAccessor.get('optionList')) {
                    var optionListBindingAccessor = allBindingsAccessor.get('optionList'),
                        optionList = Knockout.utils.unwrapObservable(optionListBindingAccessor);
                    if (contrail.checkIfFunction(optionList) && $.isArray(optionList(viewModel))) {
                        combobox.setData(optionList(viewModel));
                    } else if ($.isArray(optionList)) {
                        combobox.setData(optionList);
                    }
                }

                if (allBindingsAccessor.get('value')) {
                    var valueBindingAccessor = allBindingsAccessor.get('value'),
                        value = Knockout.utils.unwrapObservable(valueBindingAccessor);

                    value = contrail.checkIfFunction(value) ? value() : value;

                    if (contrail.checkIfExist(value) && value !== '') {
                        combobox.value(value);
                    }
                }

                if (allBindingsAccessor.get('disable')) {
                    var valueBindingAccessor = allBindingsAccessor.get('disable'),
                        disable = Knockout.utils.unwrapObservable(valueBindingAccessor);

                    disable = contrail.checkIfFunction(disable) ? disable() : disable;

                    if (contrail.checkIfExist(disable) && disable !== '') {
                        combobox.enable(!disable)
                    }

                }
            }
        };

        Knockout.bindingHandlers.select2 = {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                Knockout.utils.domNodeDisposal.addDisposeCallback(element, function () {
                    $(element).select2('destroy');
                });

                var valueObj = Knockout.toJS(valueAccessor()) || {},
                    allBindings = allBindingsAccessor(),
                    lookupKey = allBindings.lookupKey;

                $(element).select2(valueObj);

                if (allBindings.value) {
                    var value = Knockout.utils.unwrapObservable(allBindings.value);
                    if (typeof value === 'function') {
                        $(element).select2('val', value());
                    } else if (value && value != '') {
                        $(element).select2('val', value);
                    }
                }
            },
            update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                $(element).trigger('change');
            }
        };

        Knockout.bindingHandlers.contrailDateTimePicker = {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var valueObj = Knockout.toJS(valueAccessor()) || {},
                    allBindings = allBindingsAccessor(),
                    elementConfig = {};

                if(contrail.checkIfExist(bindingContext) && contrail.checkIfExist(bindingContext.$root)){
                    var elementConfigMap = bindingContext.$root.elementConfigMap(),
                        elementName = $(element).attr("name");

                    elementConfig = elementConfigMap[elementName];
                }

                var dateTimePicker = $(element).contrailDateTimePicker(elementConfig).data('contrailDateTimePicker');

                Knockout.utils.domNodeDisposal.addDisposeCallback(element, function () {
                    dateTimePicker.destroy();
                });
            },
            update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var dateTimePicker = $(element).data('contrailDateTimePicker');

                if (allBindingsAccessor.get('value')) {
                    var valueBindingAccessor = allBindingsAccessor.get('value'),
                        value = Knockout.utils.unwrapObservable(valueBindingAccessor);

                    value = contrail.checkIfFunction(value) ? value() : value;
                    dateTimePicker.value(value);
                }
                else {
                    dateTimePicker.value('');
                }
            }
        };

    Knockout.bindingHandlers.contrailNumericTextbox = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var elementConfig = {}, numericTextbox;

            if(contrail.checkIfExist(bindingContext) && contrail.checkIfExist(bindingContext.$root)){
                var elementConfigMap = bindingContext.$root.elementConfigMap(),
                    elementName = $(element).attr("name");

                elementConfig = elementConfigMap[elementName];
            }

            numericTextbox = $(element).contrailNumericTextbox(elementConfig).data('contrailNumericTextbox');

            Knockout.utils.domNodeDisposal.addDisposeCallback(element, function () {
                numericTextbox.destroy();
            });
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var numericTextbox = $(element).data('contrailNumericTextbox');

            if (allBindingsAccessor.get('value')) {
                var valueBindingAccessor = allBindingsAccessor.get('value'),
                    value = Knockout.utils.unwrapObservable(valueBindingAccessor);

                if (contrail.checkIfFunction(value)) {
                    numericTextbox.value(value());
                } else {
                    numericTextbox.value(value);
                }
            }
            else {
                numericTextbox.value('');
            }
        }
    };

        Knockout.bindingHandlers.contrailAutoComplete = {
                init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                    var elementConfig = {}, autocompleteTextBox;

                    if(contrail.checkIfExist(bindingContext) && contrail.checkIfExist(bindingContext.$root)){
                        var elementConfigMap = bindingContext.$root.elementConfigMap(),
                            elementName = $(element).attr("name");

                        elementConfig = elementConfigMap[elementName];
                    }

                    autocompleteTextBox = $(element).contrailAutoComplete(elementConfig).data('contrailAutoComplete');

                    Knockout.utils.domNodeDisposal.addDisposeCallback(element, function () {
                        autocompleteTextBox.destroy();
                    });
                },
                update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                    var autocompleteTextBox = $(element).data('contrailAutoComplete');

                    if (allBindingsAccessor.get('value')) {
                        var valueBindingAccessor = allBindingsAccessor.get('value'),
                            value = Knockout.utils.unwrapObservable(valueBindingAccessor);

                        if (contrail.checkIfFunction(value)) {
                            autocompleteTextBox.value(value());
                        } else {
                            autocompleteTextBox.value(value);
                        }
                    }
                    else {
                        autocompleteTextBox.value('');
                    }
                }
            };

        var updateSelect2 = function (element) {
            var el = $(element);
            if (el.data('select2')) {
                el.trigger('change');
            }
        }
        var updateSelect2Options = Knockout.bindingHandlers['options']['update'];

        Knockout.bindingHandlers['options']['update'] = function (element) {
            var r = updateSelect2Options.apply(null, arguments);
            updateSelect2(element);
            return r;
        };

        var updateSelect2SelectedOptions = Knockout.bindingHandlers['selectedOptions']['update'];

        Knockout.bindingHandlers['selectedOptions']['update'] = function (element) {
            var r = updateSelect2SelectedOptions.apply(null, arguments);
            updateSelect2(element);
            return r;
        };
    });
};

function loadGohanUI() {
    sessionStorage.setItem('gohan_contrail',true);
    sessionStorage.setItem('tenant',JSON.stringify(loadUtils.getCookie('project')));
    $('#alarms-popup-link').hide();
    $('#nav-search').hide();
    require(['iframe-view'],function(IframeView) {
        var iframeView = new IframeView({
            el:$("#main-container"),
            url:"./gohan.html"
        });
        iframeView.render();
    });
};

function changeRegion (regionName){
    var currHashState;
    cowch.reset();
    globalAlerts = [];
    globalObj.hashUpdated = 0;
    var region;
    var checkRegionObject = getValueByJsonPath(regionName, 'added', null);
    if(checkRegionObject != null){
        region = regionName.added.text;
    }
    else{
        region = regionName;
    }
    contrail.setCookie('region', region);
    require(['core-alarm-utils'],function(alarmUtil) {
        alarmUtil.fetchAndUpdateAlarmBell();
    });
    if(region != cowc.GLOBAL_CONTROLLER_ALL_REGIONS) {
        if($('.iframe-view').length != 0){
                $('.iframe-view').remove();
         }
        $("#regionDD").select2("val", loadUtils.getCookie('region'));
        globalObj['menuClicked'] = true;
        cowu.setGlobalControllerPageId(region);
    } else {
        cowu.setGlobalControllerPageId(region);
    }
    $("#gohanGrid").hide();
    $("#page-content").show();
    $("#nav-search").show();
    $("#alarms-popup-link").show();
    $("#main-content").show();
}
function clickNodesDetails (nodesHash,region){
    contrail.setCookie('region', region);
    $("#regionDD").select2("val", loadUtils.getCookie('region'));
    layoutHandler.setURLHashObj({'p' : nodesHash, 'region' : region});
}
/**
 * This file is also require-d during build script.
 * Run following only when its loaded in client side.
 */
if (typeof document !== 'undefined' && document) {
    var defaultBaseDir = (document.location.pathname.indexOf('/vcenter') == 0) ? "./../" : "./";

    /**
     * Set the global env with the data-env attr from the core.app script tag.
     * This env will determine the path requirejs will fetch and build the cache.
     * for 'prod' env, files under built dir will be used; else, original source as is(for eg. dev env).
     */
    globalObj['env'] =  document.querySelector('script[data-env]') && document.querySelector('script[data-env]').getAttribute('data-env');

    var bundles = {};
    if (globalObj['env'] == 'prod') {
        globalObj['buildBaseDir'] = 'dist';
        bundles = coreBundles;
    } else {
        // defaultBaseDir = defaultBaseDir.slice(0, -1);
        globalObj['buildBaseDir'] = '';
    }

    var coreBaseDir = defaultBaseDir, ctBaseDir = defaultBaseDir,
        smBaseDir = defaultBaseDir, strgBaseDir = defaultBaseDir,
        pkgBaseDir = defaultBaseDir;

    var webServerInfoDefObj;
    requirejs.config({
        bundles:bundles,
        baseUrl: coreBaseDir,
        urlArgs: 'built_at=' + built_at,
        paths: getCoreAppPaths(coreBaseDir, globalObj['buildBaseDir']),
        map: coreAppMap,
        shim: coreAppShim,
        waitSeconds: 0
    });

    // if (document.location.pathname.indexOf('/vcenter') == 0) {
    //     $('head').append('<base href="/vcenter/" />');
    // }

    //featurePkgs is required to pre-load feature bundles
    var loadFeatureApps = function (featurePackages) {
        var featureAppDefObjList= [],
            initAppDefObj, url;

        for (var key in featurePackages) {
            if(globalObj['initFeatureAppDefObjMap'][key] == null) {
                if(featurePackages[key] &&
                        [FEATURE_PCK_WEB_CONTROLLER,FEATURE_PCK_WEB_SERVER_MANAGER,FEATURE_PCK_WEB_STORAGE].indexOf(key) > -1) {
                    globalObj['initFeatureAppDefObjMap'][key] = $.Deferred();
                    featureAppDefObjList.push(globalObj['initFeatureAppDefObjMap'][key]);
                }
            }
            if(featurePackages[key] && key == FEATURE_PCK_WEB_CONTROLLER) {
                var ctrlUrl = ctBaseDir + '/common/ui/js/controller.app.js';
                if(globalObj['loadedScripts'].indexOf(ctrlUrl) == -1) {
                    loadUtils.getScript(ctrlUrl);
                }
            } else if (featurePackages[key] && key == FEATURE_PCK_WEB_SERVER_MANAGER) {
                var smUrl = smBaseDir + '/common/ui/js/sm.app.js';
                if(globalObj['loadedScripts'].indexOf(smUrl) == -1) {
                    //Post-Authentication
                    webServerInfoDefObj.done(function() {
                        //Need to remove "slickgrid-utils" once all grids are moved to GridView
                        require(['core-bundle','thirdparty-libs','nonamd-libs'],function() {
                            require(['slickgrid-utils'],function() {
                                loadUtils.getScript(smUrl);
                            });
                        });
                    });
                }
            }  else if (featurePackages[key] && key == FEATURE_PCK_WEB_STORAGE) {
                var strgUrl = strgBaseDir + '/common/ui/js/storage.app.js';
                if(globalObj['loadedScripts'].indexOf(strgUrl) == -1) {
                    loadUtils.getScript(strgUrl);
                }
            }
        }

        $.when.apply(window, featureAppDefObjList).done(function () {
            //Ensure d3 and nv.d3 are available before loading any particular feature
            //d3 and nv.d3 are not necessary for loading menu and layout
            require(['chart-utils'],function() {
                globalObj['featureAppDefObj'].resolve();
            });
        });
    };

    function loadAjaxRequest(ajaxCfg,callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET',ajaxCfg['url']);
        xhr.send(null);
        xhr.onload(function(response) {
            callback(response);
        });

    }
    var orchPrefix = window.location.pathname;
    //Even with URL as <https://localhost:8143>,pathname is returning as "/"
    //Strip-off the trailing /
    orchPrefix = orchPrefix.replace(/\/$/,'');
    //Strip off "/proxy" at the end
    orchPrefix = orchPrefix.replace(/\/proxy$/,'');

    (function() {
        var menuXMLLoadDefObj,layoutHandlerLoadDefObj,featurePkgs;
        loadUtils = {
            getScript: function(url, callback) {
                var scriptPath = url + '?built_at=' + built_at;
                globalObj['loadedScripts'].push(url);
                return $.ajax({
                    type: "GET",
                    url: scriptPath,
                    success: callback,
                    dataType: "script",
                    cache: true
                });
            },
            getCookie: function(name) {
                if(name != null) {
                    var cookies = document.cookie.split(";");
                    for (var i = 0; i < cookies.length; i++) {
                        var x = cookies[i].substr(0, cookies[i].indexOf("="));
                        var y = cookies[i].substr(cookies[i].indexOf("=") + 1);
                        x = x.replace(/^s+|s+$/g, "").trim();
                        if (x == name)
                            return unescape(y);
                    }
                }
                return false;
            },
            setCookie: function(name,value){
                document.cookie = name + "=" + escape(value) + "; path=/";
            },
            appendMotdText: function (text) {
                if (text != null && text != "") {
                    if (!$('footer').find('.proprietary-info').length) {
                        $('footer').append('<div class="proprietary-info"></div>');
                    }
                    $('.proprietary-info').html(text);
                }
            },
            postAuthenticate: function(response) {
                require(['jquery', 'thirdparty-libs', 'nonamd-libs'],function() {
                    //To fetch alarmtypes
                    require(['core-alarm-utils'],function(alarmUtil) {
                      //Call the update alarm bell after user authentication
                        alarmUtil.fetchAndUpdateAlarmBell();
                    });
                    $('#signin-container').empty();
                    //If #content-container already exists,just show it
                    if($('#content-container').length == 0) {
                        $('#app-container').html($('#app-container-tmpl').text());
                        $('#app-container').removeClass('hide');
                    } else
                        $('#app-container').removeClass('hide');
                        //Reset content-container
                        $('#content-container').html('');
                        if (null != response && typeof response == 'object') {
                            loadUtils.appendMotdText(response['motdText']);
                        }
                    $.ajaxSetup({
                        beforeSend: function (xhr, settings) {
                            if (globalObj['webServerInfo'] != null && globalObj['webServerInfo']['loggedInOrchestrationMode'] != null)
                                xhr.setRequestHeader("x-orchestrationmode", globalObj['webServerInfo']['loggedInOrchestrationMode']);
                            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
                            var token = globalObj['webServerInfo']['_csrf'];
                            if (token) {
                                xhr.setRequestHeader("X-CSRF-Token", globalObj['webServerInfo']['_csrf']);
                            }
                        }
                    });
                    globalObj['webServerInfo'] = loadUtils.parseWebServerInfo(response);
                    //Append links to connectedApps(like appformix, storage ui etc;) to footer
                    var connectedAppInfo = globalObj['webServerInfo']['connectedAppsInfo'];
                    var orchModel =  globalObj['webServerInfo']['loggedInOrchestrationMode'];
                    var footerLinkHtml = '';
                    if (orchModel == 'openstack' && connectedAppInfo != null && connectedAppInfo['enable']) {
                        footerLinkHtml = '<ul class="connectedapplink">';
                        Object.keys(connectedAppInfo).forEach(function (key, index) {
                            if (connectedAppInfo[key] != null && connectedAppInfo[key]['enable'] != false
                                && connectedAppInfo[key]['url'] != null) {
                                   footerLinkHtml +=  '<li><a href="/connectedApps?app='+key+'" target="_blank">'+key+'</a></li>';
                            }
                        });
                        footerLinkHtml += '</ul>';
                        $('footer').prepend(footerLinkHtml);
                    }
                    //For Region drop-down
                        var regionList =
                            globalObj.webServerInfo.regionList;
                        var cnt = 0;
                        if (null != regionList) {
                            cnt = regionList.length;
                        }
                        var ddRegionList = [];
                        for (var i = 0; i < cnt; i++) {
                            ddRegionList.push({id: regionList[i], text: regionList[i]});
                        }
                        var isServiceEndPointFromConfig =
                            globalObj.webServerInfo.serviceEndPointFromConfig;
                        if ((cnt > 0) && (false == isServiceEndPointFromConfig)) {
                            $('#regionDD').select2({dataTextField:"text",
                                                            dataValueField:"id",
                                                            width: '100px',
                                                            data: ddRegionList,
                                                            }).on("change", changeRegion);
                            $("#regionDD").select2("val", loadUtils.getCookie('region'));
                        }
                    webServerInfoDefObj.resolve();

                    if (loadUtils.getCookie('username') != null) {
                        $('#user_info').text(loadUtils.getCookie('username'));
                    }
                    $('#user-profile').removeClass('hidden');
                    loadUtils.bindAppListeners();

                    $.when.apply(window,[menuXMLLoadDefObj,layoutHandlerLoadDefObj]).done(function(menuXML) {
                        if(globalObj['featureAppDefObj'] == null)
                            globalObj['featureAppDefObj'] = $.Deferred();
                        require(['core-bundle','thirdparty-libs'],function() {
                                require(['d3v4'],function(d3) { d3v4 = d3;});
                                require(['contrail-charts'],function(contrailCharts) { coCharts = contrailCharts;});
                                require(['lodashv4'],function(lodashv4) { lodashv4 = lodashv4;});
                                layoutHandler.load(menuXML);
                                //Initialize toolbar
                                require(['toolbar-view', 'core-views-default-config'],function(ToolbarView, CoreViewsDefaultConfig) {
                                    covdc = new CoreViewsDefaultConfig();
                                    new ToolbarView({
                                        el: $('#toolbar'),
                                        viewCfg: covdc.getToolbarViewConfig()
                                    });
                                });
                        });
                    });
                });
            },
            onAuthenticationReq: function(loadCfg) {
                document.getElementById('signin-container').innerHTML = document.getElementById('signin-container-tmpl').innerHTML;
                require(['jquery'], function () {
                    if (null != loadCfg) {
                        loadUtils.appendMotdText(loadCfg['motdText']);
                    };
                });
                require(['jquery','jquery-dep-libs'], function() {
                    var isRegionsFromConfig = false;
                    if (null != loadCfg) {
                        isRegionsFromConfig = loadCfg.isRegionListFromConfig;
                        configRegionList = loadCfg.configRegionList;
                    }
                    var regionList = [];
                    if (true == isRegionsFromConfig) {
                        for (var key in configRegionList) {
                            regionList.push({id: key, text: key});
                        }
                        $('#region_id_cont').show();
                        $("#region_id").select2({placeholder: "Select the Region",
                                                data: regionList,
                                                width: "283px"})
                        var cookieRegion = loadUtils.getCookie('region');
                        if (regionList.length > 0) {
                            if (null == cookieRegion) {
                                cookieRegion = regionList[0]['key'];
                            }
                            $("#region_id").select2("val", cookieRegion);
                        }
                    }
                });
                var appContEl = document.getElementById('app-container');
                if(appContEl.classList) {
                    appContEl.classList.add('hide');
                } else {
                    appContEl.className += ' hide';
                }
                //Remove modal dialogs
                require(['jquery'],function() {
                    $('.modal').remove();
                    $('.modal-backdrop').remove();
                    $(".focus-config-backdrop").remove();
                    $(".popover").remove();
                });
                loadUtils.bindSignInListeners();
            },
            fetchMenu: function(menuXMLLoadDefObj) {
                $.ajax({
                    url: orchPrefix + '/menu',
                    type: "GET",
                    dataType: "xml"
                }).done(function (response,textStatus,xhr) {
                    menuXML = response;
                    menuXMLLoadDefObj.resolve(menuXML);
                }).fail(function(response) {
                    console.info(response);
                    loadUtils.onAuthenticationReq(null);
                });
            },
            isAuthenticated: function() {
                Ajax.request(orchPrefix + '/isauthenticated',"GET",null,function(response) {
                    if(response != null && response.isAuthenticated == true) {
                        loadUtils.postAuthenticate(response);
                    } else {
                        loadUtils.onAuthenticationReq(response);
                    }
                    featurePkgs = response['featurePkg'];
                    require(['jquery'],function() {
                        if(globalObj['featureAppDefObj'] == null)
                            globalObj['featureAppDefObj'] = $.Deferred();
                        if(webServerInfoDefObj == null)
                            webServerInfoDefObj = $.Deferred();
                        //Ensure the global aliases (like contrail,functions in web-utils) are available before loading
                        //feature packages as they are used in the callback of feature init modules without requring them
                        require(['nonamd-libs'],function() {
                            loadFeatureApps(featurePkgs);
                        });
                    });
                });
            },
            bindSignInListeners: function() {
                document.getElementById('signin').onclick = loadUtils.authenticate;
                // $('#signin').click(authenticate);
                require(['jquery'],function() {
                    $('body').off('keypress.signInEnter').on('keypress.signInEnter', '.login-container', function(args) {
                        if (args.keyCode == 13) {
                            $('#signin').click();
                            return false;
                        }
                    });
                });
            },
            bindAppListeners: function() {
                document.getElementById('logout').onclick = loadUtils.logout;
                // $('#logout').click(logout);
            },
            authenticate: function() {
                require(['jquery'],function() {
                    //Compares client UTC time with the server UTC time and display alert if mismatch exceeds the threshold
                    var postData = {
                        username: $("[name='username']").val(),
                        password: $("[name='password']").val()
                    };
                    var regionName = $("[name='regionname']").val();
                    if ((null != regionName) && (regionName.length > 0)) {
                        postData['regionname'] = regionName;
                    }
                    var domain = $("[name='domain']").val();
                    if ((null != domain) && (domain.length > 0)) {
                        postData['domain'] = domain;
                    }
                    $.ajax({
                        url: orchPrefix + '/authenticate',
                        type: "POST",
                        data: JSON.stringify(postData),
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        dataFilter: function (data, type) {
                            if (type == 'json') {
                                var rawData = data;
                                var dataSanitized = data.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
                                dataSanitized = JSON.parse(dataSanitized);
                                dataSanitized['motdText'] = JSON.parse(rawData)['motdText'];
                                return JSON.stringify(dataSanitized);
                            } else {
                                return data;
                            }
                        }
                    }).done(function (response) {
                        if(response != null && response.isAuthenticated == true) {
                            if (response.reload) {
                                window.location.reload();
                                return;
                            }
                            loadUtils.postAuthenticate(response);
                        } else {
                            //Display login-error message
                            $('#login-error strong').text(response['msg']);
                            $('#login-error').removeClass('hide');
                        }
                    });
                });
            },
            logout: function() {
                //Clear iframes
                $('.iframe-view').remove();
                //Clear alarms popup
                $('.popover').remove();
                //Clear All Pending Ajax calls
                $.allajax.abort();
                $.ajax({
                    url: '/logout',
                    type: "GET",
                    dataType: "json",
                    dataFilter: function (data, type) {
                        if (type == 'json') {
                            var rawData = data;
                            var dataSanitized = data.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
                            dataSanitized = JSON.parse(dataSanitized);
                            dataSanitized['motdText'] = JSON.parse(rawData)['motdText'];
                            return JSON.stringify(dataSanitized);
                        } else {
                            return data;
                        }
                    }
                }).done(function (response) {
                    //Stop the periodic alarm bell update calls on logout
                    clearTimeout(globalObj['alarmTimerCnst']);
                    globalObj['webServerInfo'] = {};
                    $('.connectedapplink').remove();
                    loadUtils.onAuthenticationReq(response);
                });
            },
            parseWebServerInfo: function(webServerInfo) {
                if (webServerInfo['serverUTCTime'] != null) {
                    webServerInfo['timeDiffInMillisecs'] = webServerInfo['serverUTCTime'] - new Date().getTime();
                    if (Math.abs(webServerInfo['timeDiffInMillisecs']) > globalObj['timeStampTolerance']) {
                        if (webServerInfo['timeDiffInMillisecs'] > 0) {
                            globalAlerts.push({
                                msg: infraAlertMsgs['TIMESTAMP_MISMATCH_BEHIND'].format(diffDates(new XDate(), new XDate(webServerInfo['serverUTCTime']), 'rounded')),
                                sevLevel: sevLevels['INFO']
                            });
                        } else {
                            globalAlerts.push({
                                msg: infraAlertMsgs['TIMESTAMP_MISMATCH_AHEAD'].format(diffDates(new XDate(webServerInfo['serverUTCTime']), new XDate(), 'rounded')),
                                sevLevel: sevLevels['INFO']
                            });
                        }
                    }
                }
                return webServerInfo;
            }
        }
        //Check whether page hash is globalcontroller then set the cookie as All regions to load the global controller page
          var hashString = window.location.hash;
          var region = loadUtils.getCookie('region');
          if ((hashString.indexOf('mon_gc_globalcontroller') > -1)) {
              loadUtils.setCookie('region', "All Regions");
          }

      //Check if the session is authenticated
        loadUtils.isAuthenticated();
        require(['jquery'],function() {
            require(['core-bundle','nonamd-libs'],function() {
            });
            menuXMLLoadDefObj = $.Deferred();
            layoutHandlerLoadDefObj = $.Deferred();
            if(webServerInfoDefObj == null)
                webServerInfoDefObj = $.Deferred();
            $.ajaxSetup({
                cache: false,
                crossDomain: true,
                //set the default timeout as 30 seconds
                timeout: 30000,
                beforeSend: function (xhr, settings) {
                    if (globalObj['webServerInfo'] != null && globalObj['webServerInfo']['loggedInOrchestrationMode'] != null)
                        xhr.setRequestHeader("x-orchestrationmode", globalObj['webServerInfo']['loggedInOrchestrationMode']);
                    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
                    var token = loadUtils.getCookie('_csrf');
                    if (token) {
                        xhr.setRequestHeader("X-CSRF-Token", loadUtils.getCookie('_csrf'));
                    }
                },
                error: function (xhr, e) {
                    //ajaxDefErrorHandler(xhr);
                },
                dataFilter : function (data, type) {
                    return (type == 'json') ? (data + "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"): data;
                }
             });
            loadUtils.fetchMenu(menuXMLLoadDefObj);

            //require(['jquery-dep-libs'],function() {});
            require(['thirdparty-libs'],function() {});
            globalObj['layoutDefObj'] = $.Deferred();

            SVGElement.prototype.getTransformToElement = SVGElement.prototype.getTransformToElement || function(toElement) {
                return toElement.getScreenCTM().inverse().multiply(this.getScreenCTM());
            };

            //nonamd-libs   #no dependency on jquery
            require(['backbone','validation','knockout','knockback'],function() {
                require(['core-bundle','nonamd-libs'],function() {
                    require(['validation','knockout','backbone'],function(validation,ko) {
                        window.kbValidation = validation;
                        // window.ko = ko;
                    });
                    require(['core-utils', 'core-hash-utils'],function(CoreUtils, CoreHashUtils) {
                        cowu = new CoreUtils();
                        cowhu = new CoreHashUtils();
                        require(['underscore'],function(_) {
                            _.noConflict();
                        });
                        require(['layout-handler', 'content-handler', 'contrail-load','lodash'], function(LayoutHandler, ContentHandler, ChartUtils,_) {
                            window._ = _;
                            contentHandler = new ContentHandler();
                            initBackboneValidation();
                            initCustomKOBindings(window.ko);
                            layoutHandler = new LayoutHandler();
                            layoutHandlerLoadDefObj.resolve();
                        });
                    });
                });
            });
        });
    })();
    /* End: Loading */
}

if (typeof exports !== 'undefined' && module.exports) {
    exports = module.exports;
    exports.getCoreAppPaths = getCoreAppPaths;
    exports.coreAppMap = coreAppMap;
    exports.coreAppShim = coreAppShim;
}

