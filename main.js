var options = {
	mode: "MODE_ACTIVE",
	tickDuration: 50
}

var resources = {
	// stars: 0,
	'hyperdust': {
		stored: 0,
		baseValuePerSecond: 0.005
	},
	'iron': {
		stored: 0,
		baseValuePerSecond: 0
	},
	'techparts': {
		stored: 0,
		baseValuePerSecond: 0
	},
	'energy': {
		stored: 0,
		baseValuePerSecond: 0
	}
}

var bonus = {
	hyperdust: 1,
	iron: 1,
	techparts: 1,
	energy: 1	
}

var crew = [];

var encounters = {
	asteroid : {
		spawnProbabilityPerTick: 0.005,
		min: 1,
		max: 5
	},
	rubble : {
		spawnProbabilityPerTick: 0.0025,
		min: 1,
		max: 1
	},
	rescuecapsule : {
		spawnProbabilityPerTick: 0.001,
		min: 1,
		max: 1
	}
}

var techs = {
	mining: {
		price: {
			hyperdust: 0,
			iron: 0,
			techparts: 5
		},
		tooltip: "Allows mining iron by clicking on asteroids"
	},
	hyperdrive: {
		price: {
			hyperdust: 0,
			iron: 500,
			techparts: 20
		},
		tooltip: "Unlocks the Hyperdrive. Earn hyperdust while flying in the hyperspace"
	}
}

var researchedTechs=[];

var objects = {
	'star': {
		'identifier': 'star',
		'current': [],
		'height': 1,
		'width': 1
	},
	'asteroid': {
		'identifier':'asteroid',
		'current': [],
		'height': 64,
		'width' : 64
	},
	'rubble':{
		'identifier': 'rubble',
		'current': [],
		'height': 32,
		'width': 32
	},
	'rescuecapsule':{
		'identifier': 'rescuecapsule',
		'current': [],
		'height': 37,
		'width': 37
	}
}

var crew=[];

function toggleMode(){

	console.log(objects);

	options.mode = options.mode == "MODE_IDLE" ? "MODE_ACTIVE" : "MODE_IDLE";
	$('#modeButton').text(options.mode);

	if(options.mode=="MODE_IDLE"){
		destroyAllIdleObjects();
	}
}

function gameLoop(){

	$('#resources .hyperdust').text("hyperdust: "+roundForDisplay(resources.hyperdust.stored)+" ("+getValuePerSecond('hyperdust')+")/s)");
	$('#resources .iron').text("iron: "+resources.iron.stored);
	$('#resources .techparts').text("techparts: "+resources.techparts.stored);
	$('#resources .energy').text("energy: "+resources.energy.stored);


	if(options.mode=="MODE_IDLE"){
		addResource("hyperdust",getValuePerTick("hyperdust"));
	}

	if(options.mode=="MODE_ACTIVE"){
		activeEncounters();
	}

}

function addResource(resource,value){

	resources[resource].stored+=value;

}

function graphicsLoop(){

	for(var i=0;i<100;i++){ 	
		if(objects['star']['current'].length<100){
			spawn(objects['star']);
		}
	}

	for(var i=0;i<Object.keys(objects).length;i++){
		for(var j=0;j<objects[Object.keys(objects)[i]]['current'].length;j++){
			if(objects[Object.keys(objects)[i]].identifier=='star'){
				moveStar(objects['star'].current[j]);
			}else{
				move(objects[Object.keys(objects)[i]].current[j]);
			}
		}
	}	

}

$( document ).ready(function() {
	setInterval(function(){
		graphicsLoop();
		gameLoop();
	},options.tickDuration);

	document.getElementById("defaultOpen").click();
});



function roundForDisplay(value){

	return Math.round(value*1000)/1000;

}

function getValuePerTick(resource){
	
	return (resources[resource].baseValuePerSecond/(options.tickDuration))*bonus[resource];

}

function getValuePerSecond(resource) {

	if(options.mode=="MODE_ACTIVE")return 0;
	
	return resources[resource].baseValuePerSecond;

}

function calculateBonusPerSecond(bonus){

	return 1000/options.tickSpeed;

}

function activeEncounters() {
	
	var rand = Math.floor((Math.random() * 1000) + 1)/1000;
	if(encounters['asteroid'].spawnProbabilityPerTick>rand){
		spawn(objects['asteroid']);
	}
	if(encounters['rubble'].spawnProbabilityPerTick>rand){
		spawn(objects['rubble']);
	}
	if(encounters['rescuecapsule'].spawnProbabilityPerTick>rand){
		spawn(objects['rescuecapsule']);
	}

}

function spawn(object){

	var y = Math.floor((Math.random()* (500 - object.height))+1);
	var id=object.identifier+objects[object.identifier].current.length;
	objects[object.identifier]['current'].push(id);
	$('#space').append(getHTML(object,y,id));

}

function move(object){

	var identifier = getIdentifier(object);

	$('#'+object).css('left', '-=' + 1 );
	if($('#'+object).css('left').split("px")[0]<=0){
		$('#'+object).remove();
		var pos = objects[identifier].current.indexOf(object);
		if (pos > -1) {
			objects[identifier].current.splice(pos, 1);
		}
	}

}

function getIdentifier(object){
	
	var filter = /([a-z]+)\d*/;
	
	try{
		return object.match(filter)[1];
	}catch(error){
		console.error("unable to filter object '"+object+"'");
	}	

}

function harvest(object){

	var identifier = getIdentifier(object.id);

	switch(identifier){
		case 'asteroid':
			if(researchedTechs.indexOf("mining")<0)return;
			var resource=iron;
		break;
		case 'rubble':
		var resource = "techparts";
		break;
		case 'rescuecapsule':

		break;
	}

	$('#'+object.id).remove();
	var pos = objects[identifier].current.indexOf(object.id);
	if (pos > -1) {
		objects[identifier].current.splice(pos, 1);
	}

	var earned = Math.floor((Math.random() * encounters[identifier].max) + encounters[identifier].min);	
	addResource(resource,earned);

}

function moveStar(star){

	var currentPos = $('#'+star).css("left");

	if(options.mode=="MODE_ACTIVE"){
		$('#'+star).css('left', '-=' + 1 );

		if($('#'+star).css("width").split("px")[0]>1){
			$('#'+star).css('width', '-=' + 1 );
		} 

		if(currentPos=="0px"){
			$('#'+star).css('left', '500px' ); 
			$('#'+star).css('top', Math.floor((Math.random() * 500) + 1) + 'px' ); 
		}

	}

	if(options.mode=="MODE_IDLE"){

		if(currentPos=="0px"){

			if($('#'+star).css("width").split("px")[0]>1){
				$('#'+star).css('width', '-=' + 1 );
			}else{
				$('#'+star).css('left', '500px' ); 
				$('#'+star).css('top', Math.floor((Math.random() * 500) + 1) + 'px' ); 
			}

		}else{

			$('#'+star).css('left', '-=' + 1 );

			if( $('#'+star).css("width").split("px")[0]<=20){

				$('#'+star).css('width', '+=' + 1 );

			}

		}

	}

};

function getHTML(object,y,id){
	switch(object.identifier){
		case 'star':
			var x = Math.floor((Math.random() * 500) + 1);
			return "<div id='"+id+"' class='star' style='position: absolute; top:"+y+"px; left: "+x+"px;'></div>";
		break;
		case 'asteroid':
			return "<div id='"+id+"' class='asteroid' style='position: absolute; top:"+y+"px; left: 436px;' onclick='harvest("+id+")'></div>";
		break;
		case 'rubble':
			return "<div id='"+id+"' class='rubble' style='position: absolute; top:"+y+"px; left: 468px;' onclick='harvest("+id+")'></div>";
		break;
		case 'rescuecapsule':
			return "<div id='"+id+"' class='rescuecapsule' style='position: absolute; top:"+y+"px; left: 463px;' onclick='harvest("+id+")'></div>";
		break;
	}
}

function destroyAllIdleObjects(){

	for(var i=0;i<Object.keys(objects).length;i++){
		var currentObject = objects[Object.keys(objects)[i]];
		for(var j=0;j<currentObject.current.length;j++){
			$('#'+currentObject.current[j]).remove();
			var pos = currentObject.current.indexOf(currentObject.current[j]);
			if (pos > -1) {
				currentObject.current.splice(pos, 1);
			}			
		}
	}
}

function openTab(evt, tab) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tab).style.display = "block";
    evt.currentTarget.className += " active";
}

function showTooltip(item){

	var toolTipText ="";
	var hyperdust = 0;
	var iron = 0;
	var techparts = 0;

	switch(item){
		case 'mining':
			toolTipText = techs[item].tooltip;
			hyperdust = techs[item].price.hyperdust || 0;
	 		iron = techs[item].price.iron || 0;
	 		techparts = techs[item].price.techparts || 0;	
		break;
		case 'hyperdrive':
			toolTipText = techs[item].tooltip;
			hyperdrive = techs[item].price.hyperdrive || 0;
	 		iron = techs[item].price.iron || 0;
	 		techparts = techs[item].price.techparts || 0;	
		break;
	}

	$('.tooltiptext').text(toolTipText);
	$('.prices .hyperdust').text(hyperdust>0?hyperdust + " hyperdust":"");
	$('.prices .iron').text(iron>0?iron + " iron":"");
	$('.prices .techparts').text(techparts>0?techparts + " tech parts":"");

}

function purchaseTech(tech){

	if(!canAfford(tech))return;

	researchedTechs.push(tech);
	$('#tech-'+tech).css("display","none");

}

function canAfford(tech){

	if(resources.hyperdust.stored<techs[tech].price.hyperdust)return false;
	if(resources.iron.stored<techs[tech].price.iron)return false;
	if(resources.techparts.stored<techs[tech].price.techparts)return false;

	return true;

}

function newCrewMember(){

	return {
		name: 'Kitty Kat',
		hp: 10,
		intelligence: 5,
		strength: 5,
		job: 'pilot'
	}

}