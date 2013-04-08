// Scripts in this file are included in both the IDE and runtime, so you only
// need to write scripts common to both once.
function binaryUIDSearch(instance, array){
	var start = 0, end = array.length - 1;
	var center = Math.floor((start + end) / 2);
	var searchedUID = instance["uid"];
	while(start <= end){
		center = Math.floor((start + end) / 2);
		var current = array[center];
		if(current["uid"] == searchedUID)
			return {found:true, pos:center};
		if(current["uid"] > searchedUID)
			end = center - 1;
		else
			start = center + 1;
	}
	return {found:false, pos:center};
}

// var arr = [];
// for(var i = 0; i < 10; i++)
//     arr[i] = {uid:i*3};
    
// var log = console.log;
// log("initial array: ", arr);
// searched = {uid: 25};
// var result = binaryUIDSearch(searched,arr);
// log(result);
// if(!result.found){
//     log("previous length", arr.length);
//     arr.splice(result.pos, 0, searched);
//     log("adding");
//     log("post length", arr.length);
// }
// log(arr);