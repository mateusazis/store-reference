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
		log("on create");
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

	Cnds.prototype.GetReference = function (varName, objType)
	{
		if(typeof(this.references[varName]) === "undefined"){
			log("returning false!");
			return false;
		}


		var sol = objType.getCurrentSol();
		sol.instances = this.references[varName].slice(0);
		sol.select_all = false;
		log("ending sol with " + sol.instances.length + " instances");
		return true;
		/*for(var instance in this.references[varName]){
			var sol = objType.getCurrentSol();
			log("instance is");
			sol.instances = 
		}*/
	};
	
	// ... other conditions here ...
	
	behaviorProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts() {};

	// the example action
	Acts.prototype.SetReference = function (varName, objType)
	{
		

		var sol = objType.getCurrentSol();
		
		if(sol.select_all)
			var instances = sol.type.instances;
		else
			instances = sol.instances;
		this.references[varName] = instances;
		log(this.references[varName].length);

		//log(varName);
		//log(objType);
		// ... see other behaviors for example implementations ...
	};

	Acts.prototype.ClearReference = function(varName){
		delete this.references[varName];
	}

	Acts.prototype.RemoveReference = function(varName, objType){
		var sol = objType.getCurrentSol();
		
		if(sol.select_all)
			var instances = sol.type.instances;
		else
			instances = sol.instances;

		var myRefs = this.references[varName];
		if(myRefs){
			log("My refs are storing " + myRefs.length + " instances");
			for(var j in instances){
				var instanceToRemove = instances[j];
				// log("uid: ");
				// log(instanceToRemove.uid);
				var str = "";
				for(var k in myRefs)
					str += (typeof(myRefs[k]) !== "undefined" ? 1 : 0) + ",";
				log(str);
			 	for(var i in myRefs){
			 		log("i: " + i);
			 		var curr = myRefs[i];
			 		log("curr " + typeof(curr));
			 		//log(curr);
			 		log("to remove: " + typeof(instanceToRemove));
			 		// log(instanceToRemove);
			 		if(curr){
		 				var uid1 = curr["uid"];
				 		var uid2 = instanceToRemove["uid"];
				 		if(uid1 == uid2)
				 			myRefs = myRefs.splice(i, 1);

			 		}
			 		
			 	}
				// if(instanceToRemove in myRefs){
				// 	log("In!");

				// 	log("equals test: " + (instanceToRemove == instanceToRemove));
				// 	log("uid: ");
				// 	log(instanceToRemove.uid);
				// 	var index;
				// 	for(var i in myRefs){
				// 		log("for " + i);
				// 		if(myRefs[i] === instanceToRemove){
				// 			log("equal");
				// 			index = i;
				// 			break;
				// 		} else 
				// 			log("not equal");
				// 	}
					
					//var index = myRefs.indexOf(instanceToRemove);
				// 	log("index: " + index);
				// 	myRefs.splice(index, 1);
				// 	//log("deleting? " + delete myRefs[index]);
				// }
			}

		}
		log("remaining refs");
		log(myRefs.length);
	}
	
	// ... other actions here ...
	
	behaviorProto.acts = new Acts();

	//////////////////////////////////////
	// Expressions
	function Exps() {};

	// the example expression
	Exps.prototype.MyExpression = function (ret)	// 'ret' must always be the first parameter - always return the expression's result through it!
	{
		ret.set_int(1337);				// return our value
		// ret.set_float(0.5);			// for returning floats
		// ret.set_string("Hello");		// for ef_return_string
		// ret.set_any("woo");			// for ef_return_any, accepts either a number or string
	};
	
	// ... other expressions here ...
	
	behaviorProto.exps = new Exps();
	
}());