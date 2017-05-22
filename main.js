var options = {
	mode: "MODE_ACTIVE",
	tickDuration: 50
}

var resources = {
	stars: 0,
	hyperdust: {
		stored: 0,
		baseValuePerSecond: 0.005
	},
	iron: {
		stored: 0,
		baseValuePerSecond: 0
	},
	techparts: {
		stored: 0,
		baseValuePerSecond: 0
	},
	energy: {
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
		spawnProbabilityPerTick: 0.1,
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

var stars=[];
var asteroids=[];
var rubbles=[];
var rescuecapsules=[];
var crew=[];

function toggleMode(){
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
		if(resources.stars<100){
			addStar();
			resources.stars++;
		}

		moveStar(i);

	}

	for(var i=0;i<asteroids.length;i++){

		moveAsteroid(asteroids[i]);

	}

	for(var i=0;i<rubbles.length;i++){

		moveRubble(rubbles[i]);

	}

	for(var i=0;i<rescuecapsules.length;i++){

		moveResuceCapsule(rescuecapsules[i]);

	}		
	

}

function addStar(){

	var x = Math.floor((Math.random() * 500) + 1);
	var y= Math.floor((Math.random() * 500) + 1);

	id="star"+resources.stars;

	$('#space').append("<div id='"+id+"'' class='star' style='position: absolute; top:"+y+"px; left:"+x+"px;'></div>");

	return id;
}

function moveStar(star){

	var currentPos = $('#star'+star).css("left");

	if(options.mode=="MODE_ACTIVE"){
		$('#star'+star).css('left', '-=' + 1 );

		if($('#star'+star).css("width").split("px")[0]>1){
			$('#star'+star).css('width', '-=' + 1 );
		} 

		if(currentPos=="0px"){
			$('#star'+star).css('left', '500px' ); 
			$('#star'+star).css('top', Math.floor((Math.random() * 500) + 1) + 'px' ); 
		}

	}

	if(options.mode=="MODE_IDLE"){

		if(currentPos=="0px"){

			if($('#star'+star).css("width").split("px")[0]>1){
				$('#star'+star).css('width', '-=' + 1 );
			}else{
				$('#star'+star).css('left', '500px' ); 
				$('#star'+star).css('top', Math.floor((Math.random() * 500) + 1) + 'px' ); 
			}

		}else{

			$('#star'+star).css('left', '-=' + 1 );

			if( $('#star'+star).css("width").split("px")[0]<=20){

				$('#star'+star).css('width', '+=' + 1 );

			}

		}

	}

};

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
		spawnAsteroid();
	}
	if(encounters['rubble'].spawnProbabilityPerTick>rand){
		spawnRubble();
	}
	if(encounters['rescuecapsule'].spawnProbabilityPerTick>rand){
		spawnResuceCapsule();
	}

}

function spawnAsteroid(){

	var y= Math.floor((Math.random() * 436) + 1);

	var id="asteroid"+asteroids.length;
	asteroids.push(id);

	$('#space').append("<div id='"+id+"' class='asteroid' style='position: absolute; top:"+y+"px; left: 436px;' onclick='harvestAsteroid("+id+")'></div>");


}

function moveAsteroid(asteroid){

	$('#'+asteroid).css('left', '-=' + 1 );
	if($('#'+asteroid).css('left').split("px")[0]<=0){
		$('#'+asteroid).remove();
		var pos = asteroids.indexOf(asteroid);
		if (pos > -1) {
			asteroids.splice(pos, 1);
		}
	}

}

function harvestAsteroid(asteroid){

	if(researchedTechs.indexOf("mining")<0)return;

	$('#'+asteroid.id).remove();
	var pos = asteroids.indexOf(asteroid.id);
	if (pos > -1) {
		asteroids.splice(pos, 1);
	}

	var earned = Math.floor((Math.random() * encounters['asteroid'].max) + encounters['asteroid'].min);	

	addResource("iron",earned);

}

function spawnRubble(){

	var y= Math.floor((Math.random() * 468) + 1);

	var id="rubble"+rubbles.length;
	rubbles.push(id);

	$('#space').append("<div id='"+id+"' class='rubble' style='position: absolute; top:"+y+"px; left: 468px;' onclick='harvestRubble("+id+")'></div>");


}

function moveRubble(rubble){

	$('#'+rubble).css('left', '-=' + 1 );
	if($('#'+rubble).css('left').split("px")[0]<=0){
		$('#'+rubble).remove();
		var pos = rubbles.indexOf(rubble);
		if (pos > -1) {
			rubbles.splice(pos, 1);
		}
	}

}

function harvestRubble(rubble){

	$('#'+rubble.id).remove();
	var pos = rubbles.indexOf(rubble.id);
	if (pos > -1) {
		rubbles.splice(pos, 1);
	}

	var earned = Math.floor((Math.random() * encounters['rubble'].max) + encounters['rubble'].min);	

	addResource("techparts",earned);

}

function spawnResuceCapsule(){

	var y= Math.floor((Math.random() * 463) + 1);

	var id="rescuecapsule"+rubbles.length;
	rubbles.push(id);

	$('#space').append("<div id='"+id+"' class='rescuecapsule' style='position: absolute; top:"+y+"px; left: 463px;' onclick='harvestResuceCapsule("+id+")'></div>");


}

function moveResuceCapsule(capsule){

	$('#'+capsule).css('left', '-=' + 1 );
	if($('#'+capsule).css('left').split("px")[0]<=0){
		$('#'+capsule).remove();
		var pos = rubbles.indexOf(capsule);
		if (pos > -1) {
			capsule.splice(pos, 1);
		}
	}

}

function harvestResuceCapsule(capsule){

	$('#'+capsule.id).remove();
	var pos = rubbles.indexOf(capsule.id);
	if (pos > -1) {
		rubbles.splice(pos, 1);
	}

	var earned = Math.floor((Math.random() * encounters['rescuecapsule'].max) + encounters['rescuecapsule'].min);	

	var member = newCrewMember();
	console.log("adding crewMember",member);
}


function destroyAllIdleObjects(){

	for(var i=0;i<asteroids.length;i++){
		$('#'+asteroids[i]).remove();
		var pos = asteroids.indexOf(asteroids[i]);
		if (pos > -1) {
			asteroids.splice(pos, 1);
		}
	}

	for(var i=0;i<rubbles.length;i++){
		$('#'+rubbles[i]).remove();
		var pos = rubbles.indexOf(rubbles[i]);
		if (pos > -1) {
			rubbles.splice(pos, 1);
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