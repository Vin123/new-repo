jQuery.sap.declare("sap.ui.demo.Component");
sap.ui.core.UIComponent.extend("sap.ui.demo.Component", {
	metadata : {
		routing : {
			config: {
				viewType: "XML",
				viewPath: "lannett_poc",
				targetAggregation: "pages",
				clearTarget: false
			},
			routes: [
				{
					pattern: "",
					name: "MainView",
					view: "MainView",
					targetControl: "idAppControl",
					subroutes : [{
						pattern: "SecondView/{contextPath}",
						name: "View2",
						view: "View2"
					}]
			    }]
		}
	},
	init : function() {
		// 1. some very generic requires  
		jQuery.sap.require("sap.m.routing.RouteMatchedHandler");
		jQuery.sap.require("sap.ui.demo.MyRouter");
		// 2. call overridden init (calls createContent)  
		sap.ui.core.UIComponent.prototype.init.apply(this, arguments);
		// 3a. monkey patch the router  
		var router = this.getRouter();
		router.myNavBack = sap.ui.demo.MyRouter.myNavBack;
		// 4. initialize the router  
		this.routeHandler = new sap.m.routing.RouteMatchedHandler(router);
		router.initialize();
	},
	destroy : function() {
		if (this.routeHandler) {
			this.routeHandler.destroy();
		}
		// call overridden destroy  
		sap.ui.core.UIComponent.prototype.destroy.apply(this, arguments);
	},
	createContent : function() {
		// create root view  
		var oView = sap.ui.view({
			id : "app",
			viewName : "lannett_poc.App",
			type : "XML"
		});

		
		/*var i18nModel = new sap.ui.model.resource.ResourceModel({
            bundleUrl : './i18n/i18n.properties'
        });
		oView.setModel(i18nModel, "i18n");*/
		
//		var oODataModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZGET_TRANS_REQ_DATA_1_SRV/");
		var oODataModel = new sap.ui.model.odata.ODataModel("http://lvsapdev01.lannett.local:8000/sap/opu/odata/sap/ZGET_TRANS_REQ_DATA_1_SRV/");
		oView.setModel(oODataModel);
		
//		var oStatusModel = new sap.ui.model.json.JSONModel();
//		oView.setModel(oStatusModel, "oStatusModel");
		
//		var oWarehouseModel = new sap.ui.model.json.JSONModel();
//		oView.setModel(oWarehouseModel, "oWarehouseModel");
		
//		var oSourceModel = new sap.ui.model.json.JSONModel();
//		oView.setModel(oSourceModel, "oSourceModel");
		
//		var oShipmentModel = new sap.ui.model.json.JSONModel();
//		oView.setModel(oShipmentModel, "oShipmentModel");
		
		return oView;
	}
});