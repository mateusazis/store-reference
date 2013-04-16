// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
// *** CHANGE THE BEHAVIOR ID HERE *** - must match the "id" property in edittime.js
//           vvvvvvvvvv
cr.behaviors.StoreReference = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	// *** CHANGE THE BEHAVIOR ID HERE *** - must match the "id" property in edittime.js
	//                               vvvvvvvvvv
	var behaviorProto = cr.behaviors.StoreReference.prototype;
		
	/////////////////////////////////////
	// Behavior type class
	behaviorProto.Type = function(behavior, objtype)
	{
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	
	var behtypeProto = behaviorProto.Type.prototype;

	behtypeProto.onCreate = function()
	{
	};

	/////////////////////////////////////
	// Behavior instance class
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
	};
	
	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{
		// Load properties
		//this.myProperty = this.properties[0];
		this.references = {};
		this.orderArrays = {};
		// object is sealed after this call, so make sure any properties you'll ever need are created, e.g.
		// this.myValue = 0;
	};
	
	behinstProto.onDestroy = function ()
	{
		// called when associated object is being destroyed
		// note runtime may keep the object and behavior alive after this call for recycling;
		// release, recycle or reset any references here as necessary
	};
	
	// called when saving the full state of the game
	behinstProto.saveToJSON = function ()
	{
		// return a Javascript object containing information about your behavior's state
		// note you MUST use double-quote syntax (e.g. "property": value) to prevent
		// Closure Compiler renaming and breaking the save format
		return {
			// e.g.
			//"myValue": this.myValue
		};
	};
	
	// called when loading the full state of the game
	//instanceProto.loadFromJSON = function (o)
	//{
		// load from the state previously saved by saveToJSON
		// 'o' provides the same object that you saved, e.g.
		// this.myValue = o["myValue"];
		// note you MUST use double-quote syntax (e.g. o["property"]) to prevent
		// Closure Compiler renaming and breaking the save format
	//};

	behinstProto.tick = function ()
	{
		var dt = this.runtime.getDt(this.inst);
		
		// called every tick for you to update this.inst as necessary
		// dt is the amount of time passed since the last tick, in case it's a movement
	};

	behinstProto.getRefs = function(varName){
		var resp = this.references[varName];
		if(typeof(resp) === "undefined")
			resp = this.references[varName] = [];
		return resp;
	};

	behinstProto.getOrderArray = function(varName){
		var resp = this.orderArrays[varName];
		if(typeof(resp) === "undefined")
			resp = this.orderArrays[varName] = [];
		return resp;
	};

	behinstProto.ClearReference = function(varName) {
	 	log("clear reference called for " + varName);
		delete this.references[varName];
		delete this.orderArrays[varName];
	};

	behinstProto.RemoveSingleReference = function(refArray, instance, varName){
		var searchResult = binaryUIDSearch(instance, refArray);
		if(searchResult.found){
			refArray.splice(searchResult.pos, 1);
			if(this)
				this.onInstanceRemoved(searchResult.pos, varName);
		}
		log("remove single");
		printRefs(refArray);
	};

	//////////////////////////////////////
	// Conditions
	function Cnds() {};

	// the example condition
	Cnds.prototype.HasReference = function (varName)
	{
		// ... see other behaviors for example implementations ...
		//return typeof(this.references[varName]) !== "undefined";
		return typeof(this.references[varName]) !== "undefined";
	};

	function printRefs(array){
		var resp = "[";
		var first = true;
		for(var i in array){
			resp += (first ? "" : ", ") + array[i].uid + " ";
			first = false;
		}
		resp += "]"
		log(resp);
	}

	function checkTypeForArray(array, objType){
		if(array.length == 0)
			return true;
		
		return array[0].type == objType;
	}

	function sameType(refArray, instance){
		if(refArray.length == 0)
			return true;

		return refArray[0].type == instance.type;
	}

	Cnds.prototype.GetReference = function (varName, objType)
	{
		var myRefs = this.getRefs(varName);
		if(typeof(myRefs) === "undefined" || myRefs.length == 0 || !checkTypeForArray(myRefs, objType)){
			//log("returning false!");
			return false;
		}


		var sol = objType.getCurrentSol();
		sol.instances = this.references[varName].slice(0);
		sol.select_all = false;
		//log("returning ");
		//printRefs(sol.instances);
		return true;
	};

	behinstProto.GetReferenceAt = function(index, varName, objType){
		var myOrders = this.getOrderArray(varName);
		if(index >= 0 && index < myOrders.length){
			var sol = objType.getCurrentSol();
			var myRefs = this.getRefs(varName);
			if(checkTypeForArray(myRefs, objType)){
				var storedIndex = myOrders[index];
				sol.instances = myRefs.slice(storedIndex, storedIndex+1);
				sol.select_all = false;

				return true;
			}
		}
		return false;
	};

	Cnds.prototype.GetReferenceAt = function(index, varName, objType){
		return this.GetReferenceAt(index, varName, objType);
	}

	Cnds.prototype.GetFirstReference = function(varName, objType){
		return this.GetReferenceAt(0, varName, objType);
	};

	Cnds.prototype.GetLastReference = function(varName, objType){
		var myRefs = this.getRefs(varName);
		return this.GetReferenceAt(myRefs.length - 1, varName, objType);
	};

	Cnds.prototype.IsReferenceSet = function (varName)
	{
		var myRefs = this.getRefs(varName);
		return myRefs.length > 0;
	};
	
	// ... other conditions here ...
	
	behaviorProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	var Acts = function() {
	};


	behinstProto.onInstanceAdded = function(refArrayIndex, varName){
		var orderArray = this.getOrderArray(varName);
		for(var i in orderArray)
			if(orderArray[i] >= refArrayIndex)
				orderArray[i]++;
		orderArray.push(refArrayIndex);
		log("On ADDED: Order array: " + orderArray)
	};

	behinstProto.onInstanceRemoved = function(refArrayIndex, varName){
		var orderArray = this.getOrderArray(varName);
		var orderStoreIndex;
		for(var i in orderArray){
			log("order array is " + orderArray);
			var current = orderArray[i];
			if(current == refArrayIndex)
				orderStoreIndex = i;

			else if(current > refArrayIndex)
				orderArray[i]--;
		}
		orderArray.splice(orderStoreIndex, 1);
		log("On removed: Order array: " + orderArray)
	};

	behinstProto.AddReference = function (varName, objType){
		var sol = objType.getCurrentSol();
		if(sol.select_all)
			var instances = sol.type.instances;
		else
			instances = sol.instances;

		var myRefs = this.getRefs(varName);

		for(var i in instances){
			var currentInstance = instances[i];
			if(sameType(myRefs, currentInstance)){
				log(1);
				var searchResult = binaryUIDSearch(currentInstance, myRefs);
				if(!searchResult.found){
					var pos = searchResult.pos;
					if(myRefs[pos] && myRefs[pos]["uid"] < currentInstance["uid"])
						pos++;
					myRefs.splice(pos, 0, currentInstance);

					//when the entity is destroyed, it should be removed from the list
					var oldOnDestroy = currentInstance.onDestroy;
					var removeFunc = this.RemoveSingleReference;
					currentInstance.onDestroy = function(){
						//removeFunc(myRefs, this, varName);
						removeFunc(myRefs, currentInstance, varName);
						if(oldOnDestroy)
							oldOnDestroy();
					};

					this.onInstanceAdded(pos, varName);
				}
			}
		}
		printRefs(myRefs);
	}

	Acts.prototype.AddReference = function (varName, objType){
		this.AddReference(varName, objType);
	}

	Acts.prototype.ClearReference = function(varName){
		this.ClearReference(varName);
	}

	Acts.prototype.SetReference = function (varName, objType)
	{
		this.ClearReference(varName);
		this.AddReference(varName, objType);
	};

	Acts.prototype.RemoveReference = function(varName, objType){
		var sol = objType.getCurrentSol();
		
		if(sol.select_all)
			var instances = sol.type.instances;
		else
			instances = sol.instances;

		var myRefs = this.getRefs(varName);
		for(var j in instances)
			this.RemoveSingleReference(myRefs, instances[j], varName);
	}
	
	// ... other actions here ...
	
	behaviorProto.acts = new Acts();

	//////////////////////////////////////
	// Expressions
	function Exps() {};

	Exps.prototype.RefCount = function (ret, varName)	// 'ret' must always be the first parameter - always return the expression's result through it!
	{
		var myRefs = this.getRefs(varName);
	 	ret.set_int(myRefs.length);	
	}

	// the example expression
	// Exps.prototype.MyExpression = function (ret)	// 'ret' must always be the first parameter - always return the expression's result through it!
	// {
	// 	ret.set_int(1337);				// return our value
	// 	// ret.set_float(0.5);			// for returning floats
	// 	// ret.set_string("Hello");		// for ef_return_string
	// 	// ret.set_any("woo");			// for ef_return_any, accepts either a number or string
	// };
	
	// ... other expressions here ...
	
	behaviorProto.exps = new Exps();
	
}());