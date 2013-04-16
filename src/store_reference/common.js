// Scripts in this file are included in both the IDE and runtime, so you only
// need to write scripts common to both once.
function binaryUIDSearch(instance, array){
	if(array.length == 0)
		return {found:false, pos:0};

	var start = 0, end = array.length - 1;
	var center = Math.floor((start + end) / 2);
	var searchedUID = instance.uid;
	while(start <= end){
		center = Math.floor((start + end) / 2);
		var current = array[center];
		if(current.uid == searchedUID)
			return {found:true, pos:center};
		if(current.uid > searchedUID)
			end = center - 1;
		else
			start = center + 1;
	}
	return {found:false, pos:center};
}