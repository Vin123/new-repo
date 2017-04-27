jQuery.sap.require("sap.m.MessageBox");
sap.ui.controller("lannett_poc.MainView", {

	onInit: function() {
		
		this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		var that = this;
		this.busy = new sap.m.BusyDialog();
		this.oRouter.attachRoutePatternMatched(function(oEvent) {
			if (oEvent.getParameter("name") === "MainView") {
				
				if(sap.ui.Device.system.desktop){
					that.getView().addStyleClass("sapUiSizeCompact");
				}
				else if(sap.ui.Device.system.tablet){
					that.getView().addStyleClass("sapUiSizeCozy");
					that.tabletOrientation();
					sap.ui.Device.orientation.attachHandler(function(oEvt){
						that.tabletOrientation();
					});
				}
				else{
					that.getView().addStyleClass("sapUiSizeCozy");
					that.phoneOrientation();
					sap.ui.Device.orientation.attachHandler(function(oEvt){
						that.phoneOrientation();
					});
				}
				
				var i18nModel = new sap.ui.model.resource.ResourceModel({
		            bundleUrl : './i18n/i18n.properties'
		        });
				that.getView().setModel(i18nModel, "i18n");
				sap.ui.getCore().setModel(i18nModel, "i18n");
				that.oODataModel = that.getView().getModel();
				
//				var oStatusModel = that.getView().getModel("oStatusModel");
				var oStatusModel = new sap.ui.model.json.JSONModel();
				that.getView().setModel(oStatusModel, "oStatusModel");
				
//				var oWarehouseModel = sap.ui.getCore().getModel("oWarehouseModel");
				var oWarehouseModel = new sap.ui.model.json.JSONModel();
				sap.ui.getCore().setModel(oWarehouseModel, "oWarehouseModel");
				
//				var oSourceModel = that.getView().getModel("oSourceModel");
				var oSourceModel = new sap.ui.model.json.JSONModel();
				sap.ui.getCore().setModel(oSourceModel, "oSourceModel");
				
//				var oShipmentModel = that.getView().getModel("oShipmentModel");
				var oShipmentModel = new sap.ui.model.json.JSONModel();
				sap.ui.getCore().setModel(oShipmentModel, "oShipmentModel");
				
				oStatusModel.loadData("Json/Status.json");
				
				that.oODataModel.read("/WareHouseSearchSet", null, null, true, function(oData){
					oWarehouseModel.setData(oData);
					oWarehouseModel.refresh();
					that.busy.close();
				}, function(oError){
					console.log(oError);
					sap.m.MessageBox.alert(jQuery.parseJSON(oError.response.body).error.message.value);
					that.busy.close();
				});
				
				that.oODataModel.read("/shipmentTypeSearchSet", null, null, true, function(oData){
					oShipmentModel.setData(oData);
					that.busy.close();
				}, function(oError){
					console.log(oError);
					sap.m.MessageBox.alert(jQuery.parseJSON(oError.response.body).error.message.value);
					that.busy.close();
				});
				
				that.searchResultModel = new sap.ui.model.json.JSONModel();
				that.getView().setModel(that.searchResultModel,"searchResultModel");
			}
		});
	},
	
	phoneOrientation : function(){
		if(sap.ui.Device.orientation.landscape){
			this.getView().byId("trNumCol").setWidth("16%");
			this.getView().byId("hdrStatusCol").setWidth("10%");
			this.getView().byId("transPrioCol").setWidth("11%");
			this.getView().byId("shipTypeCol").setWidth("12%");
			this.getView().byId("movTypeCol").setWidth("14%");
			this.getView().byId("reqNoCol").setWidth("16%");
		}
		else{
			this.getView().byId("reqNoCol").setWidth("31%");
			this.getView().byId("trNumCol").setWidth("30%");
		}
	},
	
	tabletOrientation : function(){
		this.getView().byId("itemsCol").setWidth("11%");
		this.getView().byId("reqNoCol").setWidth("12%");
		this.getView().byId("movTypeCol").setWidth("14%");
		this.getView().byId("shipTypeCol").setWidth("13%");
		this.getView().byId("hdrStatusCol").setWidth("12%");
		this.getView().byId("transPrioCol").setWidth("12%");
	},
	
	onSearch: function(oEvent){
		var that = this;
		this.busy.open();
		var warehouse = oEvent.getParameter("selectionSet")[0].getValue();
		var sourceType = oEvent.getParameter("selectionSet")[1].getValue();
		var destType = oEvent.getParameter("selectionSet")[2].getValue();
		var shipmentType = oEvent.getParameter("selectionSet")[3].getValue();
		var status = oEvent.getParameter("selectionSet")[4].getSelectedKey();
		
		var resultTable = this.getView().byId("resultTable");
		resultTable.unbindItems();
		if(warehouse){
			if(sourceType && destType){
				sap.m.MessageToast.show("You may specify at most one...Either Source Type or Dest. Type");
				oEvent.getParameter("selectionSet")[1].setValueState("Error");
				oEvent.getParameter("selectionSet")[2].setValueState("Error");
				this.busy.close();
			}else{
					oEvent.getParameter("selectionSet")[0].setValueState("None");
					oEvent.getParameter("selectionSet")[1].setValueState("None");
					oEvent.getParameter("selectionSet")[2].setValueState("None");
					this.oODataModel.read("Odata_strSet?$filter=ILgnum eq '" + warehouse + "' and IVltyp eq '" + sourceType + "' and INltyp eq '" + destType + "' and ITrart eq '" + shipmentType + "' and IStatu eq '" + status + "'", null, null, true, function(oData){
						that.searchResultModel.setData(oData);
						resultTable.bindItems("searchResultModel>/results", that.getView().byId("resultTableItems"));
						that.busy.close();
					}, function(oError){
						console.log(oError);
						sap.m.MessageBox.alert(jQuery.parseJSON(oError.response.body).error.message.value);
						that.busy.close();
					});
			}
		}else{
			sap.m.MessageToast.show("Please enter Warehouse Number");
			oEvent.getParameter("selectionSet")[0].setValueState("Error");
			this.busy.close();
		}
	},
	onClear: function(){
		var resultTable = this.getView().byId("resultTable");
		resultTable.unbindItems();
		this.getView().byId("warehouseId").setValue(null);
		this.getView().byId("srcStrgType").setValue(null);
		this.getView().byId("destStrgType").setValue(null);
		this.getView().byId("shipType").setValue(null);
		this.getView().byId("StatusBox").setSelectedKey("O");
		this.getView().byId("tblSrchFld").setValue(null);
		var oSourceModel = sap.ui.getCore().getModel("oSourceModel");
		oSourceModel.oData={};
		oSourceModel.refresh();
	},
	
	onChangeStatusBox:function(oEvent){
		
	},
	
	onValueHelpRequest : function(oEvent){
		var inputVal = oEvent.getSource().getValue();
		var inputId = oEvent.getSource().getId();

		if(inputId.includes("warehouseId")){
			if(!this._valueHelpDialog){
				this._valueHelpDialog = sap.ui.xmlfragment("sap.ui.demo.fragments.Warehouse", this);
			}
//			this.getView().addDependent(this._valueHelpDialog);
			this._valueHelpDialog.open();
		}else if(inputId.includes("srcStrgType")){
			if(!this._valueHelpDialog1){
				this._valueHelpDialog1 = sap.ui.xmlfragment("sap.ui.demo.fragments.SourceStorageType", this);
			}
//			this.getView().addDependent(this._valueHelpDialog1);
			this._valueHelpDialog1.open();
		}else if(inputId.includes("destStrgType")){
			if(!this._valueHelpDialog2){
				this._valueHelpDialog2 = sap.ui.xmlfragment("sap.ui.demo.fragments.DestStorageType", this);
			}
//			this.getView().addDependent(this._valueHelpDialog2);
			this._valueHelpDialog2.open();
		}else if(inputId.includes("shipType")){
			if(!this._valueHelpDialog3){
				this._valueHelpDialog3 = sap.ui.xmlfragment("sap.ui.demo.fragments.ShipmentType",this);
			}
//			this.getView().addDependent(this._valueHelpDialog3);
			this._valueHelpDialog3.open();
		}
	},
	
	_handleValueHelpClose : function (evt) {
			var oSelectedItem = evt.getParameter('selectedItem').getCells()[0].getText();
			if (oSelectedItem) {
				var inputNo = this.getView().byId("warehouseId");
				inputNo.setValue(oSelectedItem);
				var oSourceModel = sap.ui.getCore().getModel("oSourceModel");
				this.oODataModel.read("/storageTypeSearchSet?$filter=Lgnum eq '"+oSelectedItem+"'", null, null, true, function(oData){
					oSourceModel.setData(oData);
				}, function(oError){
					console.log(oError);
					sap.m.MessageBox.alert(jQuery.parseJSON(oError.response.body).error.message.value);
					that.busy.close();
				});
			}
		evt.getSource().getBinding("items").filter([]);
	},
	
	_handleValueHelpClose1 : function(evt){
		var oSelectedItem = evt.getParameter('selectedItem').getCells()[0].getText();
		if (oSelectedItem) {
			var inputNo = this.getView().byId("srcStrgType");
			inputNo.setValue(oSelectedItem);
		}
	},
	_handleValueHelpClose2 : function(evt){
		var oSelectedItem = evt.getParameter('selectedItem').getCells()[0].getText();
		if (oSelectedItem) {
			var inputNo = this.getView().byId("destStrgType");
			inputNo.setValue(oSelectedItem);
		}
	},
	_handleValueHelpClose3 : function(evt){
		var oSelectedItem = evt.getParameter('selectedItem').getCells()[1].getText();
		if (oSelectedItem) {
			var inputNo = this.getView().byId("shipType");
			inputNo.setValue(oSelectedItem);
		}
	},
	
	_handleValueHelpSearch : function (evt) {
		var sValue = evt.getParameter("value");
		var oFilter = new sap.ui.model.Filter(
				"Lgnum",
				sap.ui.model.FilterOperator.Contains, sValue
		);
		var oBinding = evt.getSource().getBinding("items");
		oBinding.filter([oFilter]);
	},
	_handleValueHelpSearch1 : function (evt) {
		var sValue = evt.getParameter("value");
		var oFilter = new sap.ui.model.Filter(
				"Lgtyp",
				sap.ui.model.FilterOperator.Contains, sValue
		);
		var oBinding = evt.getSource().getBinding("items");
		oBinding.filter([oFilter]);
	},
	_handleValueHelpSearch2 : function (evt) {
		var sValue = evt.getParameter("value");
		
		var oFilter1 = new sap.ui.model.Filter(
				"Trart",
				sap.ui.model.FilterOperator.Contains, sValue
		);
		
		var oBinding = evt.getSource().getBinding("items");
		oBinding.filter([oFilter1]);
	},
	
	applySearchPatternToListItem: function(i, searchValue) {
	    if (searchValue == "") {
	        return true;
	    }
	    var property = this.getView().getModel("searchResultModel").getData().results[i.getBindingContextPath().split("/")[2]];
	    for (var k in property) {
	        var v = property[k];
	    	if (typeof v == "string") {
	            if (v.toLowerCase().indexOf(searchValue) != -1) {
	                return true;
	            }
	        }
	    }
	    return false;
	},

	search : function(oEvt){
		var searchValue = oEvt.getSource().getValue();
		searchValue = searchValue.toLowerCase();
	    var items = this.getView().byId("resultTable").getItems();
	    var v;
	    var count = 0;
	    var g = null;
	    var C = 0;
	    for (var i = 0; i < items.length; i++) {
	        if (items[i] instanceof sap.m.GroupHeaderListItem) {
	            if (g) {
	                if (C == 0) {
	                    g.setVisible(false);
	                } else {
	                    g.setVisible(true);
	                    g.setCount(C);
	                }
	            }
	            g = items[i];
	            C = 0;
	        } else {
	            v = this.applySearchPatternToListItem(items[i], searchValue);
	            items[i].setVisible(v);
	            if (v) {
	                count++;
	                C++;
	            }
	        }
	    }
	    if (g) {
	        if (C == 0) {
	            g.setVisible(false);
	        } else {
	            g.setVisible(true);
	            g.setCount(C);
	        }
	    }
	    return count;
	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf fullscreenapp.View
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf fullscreenapp.View
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf fullscreenapp.View
*/
//	onExit: function() {
//
//	}

});