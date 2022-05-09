import './style.css'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'

var deltaTime = 0;

//colors used in the project
var Colors = {
	red: 0xf25346,
	white: 0xffffff,
	pink: 0xF5986E,
	brown: 0x59332e,
	brownDark: 0x23190f,
	blue: 0x3A9B3B,	
	yellow:0xedeb27,	
	green:0x458248,
	purple:0x551A8B,
	lightgreen:0x629265,
};

var scene, camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH, renderer, container;

//******Basic Scene Setup with one mesh, camera and renderer******


/*const scene = new THREE.Scene()

const geometry= new THREE.BoxGeometry(1,1,1)
const material= new THREE.MeshBasicMaterial({color:'red'})
const mesh= new THREE.Mesh(geometry,material)
scene.add(mesh)


const sizes={
    width: 800,
    height: 600
}


const camera= new THREE.PerspectiveCamera(75,sizes.width/sizes.height)
camera.position.z=3
scene.add(camera)



const renderer= new THREE.WebGLRenderer({
    canvas:document.querySelector('canvas.webgl')
})
renderer.setSize(sizes.width,sizes.height)
renderer.render(scene,camera)*///


//creating the scene
function createScene() {
	/* Get the width and height of the screen and use them to setup the aspect ratio of the camera and 
	the size of the renderer.*/
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;

	// Create the scene.
	scene = new THREE.Scene();

	// Add FOV Fog effect to the scene. Same colour as the BG in the stylesheet.
	scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);

	// Create the camera
	aspectRatio = WIDTH / HEIGHT;
	fieldOfView = 60;
	nearPlane = 1;
	farPlane = 10000;
	camera = new THREE.PerspectiveCamera(
		fieldOfView,
		aspectRatio,
		nearPlane,
		farPlane
	);
	// Position the camera
	camera.position.x = 0;
  camera.position.z = 200;
  camera.position.y = 100;

	// Create the renderer
	
	renderer = new THREE.WebGLRenderer ({
	// Alpha makes the background transparent, antialias is performant heavy
     canvas:document.querySelector('canvas.webgl'),
		alpha: true,
		antialias:true 
	}); 

	//set the size of the renderer to fullscreen
	renderer.setSize (WIDTH, HEIGHT);
	//enable shadow rendering
	renderer.shadowMap.enabled = true;

	//RESPONSIVE LISTENER
	window.addEventListener('resize', handleWindowResize, false);
}

function handleWindowResize() {
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	renderer.setSize(WIDTH, HEIGHT);
	camera.aspect = WIDTH / HEIGHT;
	camera.updateProjectionMatrix();
}




//LIGHTS
var hemisphereLight, shadowLight;

function createLights(){
	// Gradient coloured light - Sky, Ground, Intensity
	hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9)
	
	// Parallel rays
	shadowLight = new THREE.DirectionalLight(0xffffff, .9);
	shadowLight.position.set(0,350,350);
	shadowLight.castShadow = true;

	// define the visible area of the projected shadow
	shadowLight.shadow.camera.left = -650;
	shadowLight.shadow.camera.right = 650;
	shadowLight.shadow.camera.top = 650;
	shadowLight.shadow.camera.bottom = -650;
	shadowLight.shadow.camera.near = 1;
	shadowLight.shadow.camera.far = 1000;

	// Shadow map size
	shadowLight.shadow.mapSize.width = 2048;
	shadowLight.shadow.mapSize.height = 2048;

	// Add the lights to the scene
	scene.add(hemisphereLight);  
	scene.add(shadowLight);
}	





//PILOT
var Pilot = function() {
	this.mesh = new THREE.Object3D();
	this.mesh.name = "pilot";
	this.angleHairs = 0;
  
	var bodyGeom = new THREE.BoxGeometry(15, 15, 15);
	var bodyMat = new THREE.MeshPhongMaterial({
	  color: Colors.brown,
	  shading: THREE.FlatShading
	});
	var body = new THREE.Mesh(bodyGeom, bodyMat);
	body.position.set(2, -12, 0);
  
	this.mesh.add(body);
  
	var faceGeom = new THREE.BoxGeometry(10, 10, 10);
	var faceMat = new THREE.MeshLambertMaterial({
	  color: Colors.pink
	});
	var face = new THREE.Mesh(faceGeom, faceMat);
	this.mesh.add(face);
  
	var hairGeom = new THREE.BoxGeometry(4, 4, 4);
	var hairMat = new THREE.MeshLambertMaterial({
	  color: Colors.brown
	});
	var hair = new THREE.Mesh(hairGeom, hairMat);
	hair.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 2, 0));
	var hairs = new THREE.Object3D();
  
	this.hairsTop = new THREE.Object3D();
  
	for (var i = 0; i < 12; i++) {
	  var h = hair.clone();
	  var col = i % 3;
	  var row = Math.floor(i / 3);
	  var startPosZ = -4;
	  var startPosX = -4;
	  h.position.set(startPosX + row * 4, 0, startPosZ + col * 4);
	  this.hairsTop.add(h);
	}
	hairs.add(this.hairsTop);
  
	var hairSideGeom = new THREE.BoxGeometry(12, 4, 2);
	hairSideGeom.applyMatrix(new THREE.Matrix4().makeTranslation(-6, 0, 0));
	var hairSideR = new THREE.Mesh(hairSideGeom, hairMat);
	var hairSideL = hairSideR.clone();
	hairSideR.position.set(8, -2, 6);
	hairSideL.position.set(8, -2, -6);
	hairs.add(hairSideR);
	hairs.add(hairSideL);
  
	var hairBackGeom = new THREE.BoxGeometry(2, 8, 10);
	var hairBack = new THREE.Mesh(hairBackGeom, hairMat);
	hairBack.position.set(-1, -4, 0)
	hairs.add(hairBack);
	hairs.position.set(-5, 5, 0);
  
	this.mesh.add(hairs);
  
	var glassGeom = new THREE.BoxGeometry(5, 5, 5);
	var glassMat = new THREE.MeshLambertMaterial({
	  color: Colors.brown
	});
	var glassR = new THREE.Mesh(glassGeom, glassMat);
	glassR.position.set(6, 0, 3);
	var glassL = glassR.clone();
	glassL.position.z = -glassR.position.z
  
	var glassAGeom = new THREE.BoxGeometry(11, 1, 11);
	var glassA = new THREE.Mesh(glassAGeom, glassMat);
	this.mesh.add(glassR);
	this.mesh.add(glassL);
	this.mesh.add(glassA);
  
	var earGeom = new THREE.BoxGeometry(2, 3, 2);
	var earL = new THREE.Mesh(earGeom, faceMat);
	earL.position.set(0, 0, -6);
	var earR = earL.clone();
	earR.position.set(0, 0, 6);
	this.mesh.add(earL);
	this.mesh.add(earR);
  }
  
  Pilot.prototype.updateHairs = function() {
	var hairs = this.hairsTop.children;
  
	var l = hairs.length;
	for (var i = 0; i < l; i++) {
	  var h = hairs[i];
	  h.scale.y = .75 + Math.cos(this.angleHairs + i / 3) * .25;
	}
	this.angleHairs += 0.16;
  }
  


//AIRPLANE GENERATION
  var AirPlane = function() {
	this.mesh = new THREE.Object3D();
	this.mesh.name = "airPlane";
  
	// Cockpit
	var geomCockpit = new THREE.BoxGeometry(80, 50, 50, 1, 1, 1);
	var matCockpit = new THREE.MeshPhongMaterial({
	  color: Colors.red,
	  shading: THREE.FlatShading
	});
  
	geomCockpit.vertices[4].y -= 10;
	geomCockpit.vertices[4].z += 20;
	geomCockpit.vertices[5].y -= 10;
	geomCockpit.vertices[5].z -= 20;
	geomCockpit.vertices[6].y += 30;
	geomCockpit.vertices[6].z += 20;
	geomCockpit.vertices[7].y += 30;
	geomCockpit.vertices[7].z -= 20;
  
	var cockpit = new THREE.Mesh(geomCockpit, matCockpit);
	cockpit.castShadow = true;
	cockpit.receiveShadow = true;
	this.mesh.add(cockpit);
  
	// Engine 
	var geomEngine = new THREE.BoxGeometry(20, 50, 50, 1, 1, 1);
	var matEngine = new THREE.MeshPhongMaterial({
	  color: Colors.white,
	  shading: THREE.FlatShading
	});
	var engine = new THREE.Mesh(geomEngine, matEngine);
	engine.position.x = 50;
	engine.castShadow = true;
	engine.receiveShadow = true;
	this.mesh.add(engine);
  
	// Tail Plane 
	var geomTailPlane = new THREE.BoxGeometry(15, 20, 5, 1, 1, 1);
	var matTailPlane = new THREE.MeshPhongMaterial({
	  color: Colors.red,
	  shading: THREE.FlatShading
	});
	var tailPlane = new THREE.Mesh(geomTailPlane, matTailPlane);
	tailPlane.position.set(-40, 20, 0);
	tailPlane.castShadow = true;
	tailPlane.receiveShadow = true;
	this.mesh.add(tailPlane);
  
	// Wings
	var geomSideWing = new THREE.BoxGeometry(30, 5, 120, 1, 1, 1);
	var matSideWing = new THREE.MeshPhongMaterial({
	  color: Colors.red,
	  shading: THREE.FlatShading
	});
	var sideWing = new THREE.Mesh(geomSideWing, matSideWing);
	sideWing.position.set(0, 15, 0);
	sideWing.castShadow = true;
	sideWing.receiveShadow = true;
	this.mesh.add(sideWing);
  
	var geomWindshield = new THREE.BoxGeometry(3, 15, 20, 1, 1, 1);
	var matWindshield = new THREE.MeshPhongMaterial({
	  color: Colors.white,
	  transparent: true,
	  opacity: .3,
	  shading: THREE.FlatShading
	});;
	var windshield = new THREE.Mesh(geomWindshield, matWindshield);
	windshield.position.set(5, 27, 0);
  
	windshield.castShadow = true;
	windshield.receiveShadow = true;
  
	this.mesh.add(windshield);
  
	var geomPropeller = new THREE.BoxGeometry(20, 10, 10, 1, 1, 1);
	geomPropeller.vertices[4].y -= 5;
	geomPropeller.vertices[4].z += 5;
	geomPropeller.vertices[5].y -= 5;
	geomPropeller.vertices[5].z -= 5;
	geomPropeller.vertices[6].y += 5;
	geomPropeller.vertices[6].z += 5;
	geomPropeller.vertices[7].y += 5;
	geomPropeller.vertices[7].z -= 5;
	var matPropeller = new THREE.MeshPhongMaterial({
	  color: Colors.brown,
	  shading: THREE.FlatShading
	});
	this.propeller = new THREE.Mesh(geomPropeller, matPropeller);
  
	this.propeller.castShadow = true;
	this.propeller.receiveShadow = true;
  
	var geomBlade = new THREE.BoxGeometry(1, 80, 10, 1, 1, 1);
	var matBlade = new THREE.MeshPhongMaterial({
	  color: Colors.brownDark,
	  shading: THREE.FlatShading
	});
	var blade1 = new THREE.Mesh(geomBlade, matBlade);
	blade1.position.set(8, 0, 0);
  
	blade1.castShadow = true;
	blade1.receiveShadow = true;
  
	var blade2 = blade1.clone();
	blade2.rotation.x = Math.PI / 2;
  
	blade2.castShadow = true;
	blade2.receiveShadow = true;
  
	this.propeller.add(blade1);
	this.propeller.add(blade2);
	this.propeller.position.set(60, 0, 0);
	this.mesh.add(this.propeller);
  
	var wheelProtecGeom = new THREE.BoxGeometry(30, 15, 10, 1, 1, 1);
	var wheelProtecMat = new THREE.MeshPhongMaterial({
	  color: Colors.red,
	  shading: THREE.FlatShading
	});
	var wheelProtecR = new THREE.Mesh(wheelProtecGeom, wheelProtecMat);
	wheelProtecR.position.set(25, -20, 25);
	this.mesh.add(wheelProtecR);
  
	var wheelTireGeom = new THREE.BoxGeometry(24, 24, 4);
	var wheelTireMat = new THREE.MeshPhongMaterial({
	  color: Colors.brownDark,
	  shading: THREE.FlatShading
	});
	var wheelTireR = new THREE.Mesh(wheelTireGeom, wheelTireMat);
	wheelTireR.position.set(25, -28, 25);
  
	var wheelAxisGeom = new THREE.BoxGeometry(10, 10, 6);
	var wheelAxisMat = new THREE.MeshPhongMaterial({
	  color: Colors.brown,
	  shading: THREE.FlatShading
	});
	var wheelAxis = new THREE.Mesh(wheelAxisGeom, wheelAxisMat);
	wheelTireR.add(wheelAxis);
  
	this.mesh.add(wheelTireR);
  
	var wheelProtecL = wheelProtecR.clone();
	wheelProtecL.position.z = -wheelProtecR.position.z;
	this.mesh.add(wheelProtecL);
  
	var wheelTireL = wheelTireR.clone();
	wheelTireL.position.z = -wheelTireR.position.z;
	this.mesh.add(wheelTireL);
  
	var wheelTireB = wheelTireR.clone();
	wheelTireB.scale.set(.5, .5, .5);
	wheelTireB.position.set(-35, -5, 0);
	this.mesh.add(wheelTireB);
  
	var suspensionGeom = new THREE.BoxGeometry(4, 20, 4);
	suspensionGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, 10, 0))
	var suspensionMat = new THREE.MeshPhongMaterial({
	  color: Colors.red,
	  shading: THREE.FlatShading
	});
	var suspension = new THREE.Mesh(suspensionGeom, suspensionMat);
	suspension.position.set(-35, -5, 0);
	suspension.rotation.z = -.3;
	this.mesh.add(suspension);
  
	this.pilot = new Pilot();
	this.pilot.mesh.position.set(-10, 27, 0);
	this.mesh.add(this.pilot.mesh);
  
	this.mesh.castShadow = true;
	this.mesh.receiveShadow = true;
  
  };



//TREE GENERATION
var Tree = function () {

	this.mesh = new THREE.Object3D();

	var matTreeLeaves = new THREE.MeshPhongMaterial( { color:Colors.green, shading:THREE.FlatShading});

	var geonTreeBase = new THREE.BoxGeometry( 10,20,10 );
	var matTreeBase = new THREE.MeshBasicMaterial( { color:Colors.brown});
	var treeBase = new THREE.Mesh(geonTreeBase,matTreeBase);
	treeBase.castShadow = true;
	treeBase.receiveShadow = true;
	this.mesh.add(treeBase);

	var geomTreeLeaves1 = new THREE.CylinderGeometry(1, 12*3, 12*3, 4 );
	var treeLeaves1 = new THREE.Mesh(geomTreeLeaves1,matTreeLeaves);
	treeLeaves1.castShadow = true;
	treeLeaves1.receiveShadow = true;
	treeLeaves1.position.y = 20
	this.mesh.add(treeLeaves1);

	var geomTreeLeaves2 = new THREE.CylinderGeometry( 1, 9*3, 9*3, 4 );
	var treeLeaves2 = new THREE.Mesh(geomTreeLeaves2,matTreeLeaves);
	treeLeaves2.castShadow = true;
	treeLeaves2.position.y = 40;
	treeLeaves2.receiveShadow = true;
	this.mesh.add(treeLeaves2);

	var geomTreeLeaves3 = new THREE.CylinderGeometry( 1, 6*3, 6*3, 4);
	var treeLeaves3 = new THREE.Mesh(geomTreeLeaves3,matTreeLeaves);
	treeLeaves3.castShadow = true;
	treeLeaves3.position.y = 55;
	treeLeaves3.receiveShadow = true;
	this.mesh.add(treeLeaves3);

}



//FLOWER GENERATION
var Flower = function () {

	this.mesh = new THREE.Object3D();

	var geomStem = new THREE.BoxGeometry( 5,50,5,1,1,1 );
	var matStem = new THREE.MeshPhongMaterial( { color:Colors.green, shading:THREE.FlatShading});
	var stem = new THREE.Mesh(geomStem,matStem);
	stem.castShadow = false;
	stem.receiveShadow = true;
	this.mesh.add(stem);


	var geomPetalCore = new THREE.BoxGeometry(10,10,10,1,1,1);
	var matPetalCore = new THREE.MeshPhongMaterial({color:Colors.yellow, shading:THREE.FlatShading});
	var petalCore = new THREE.Mesh(geomPetalCore, matPetalCore);
	petalCore.castShadow = false;
	petalCore.receiveShadow = true;

	var petalColor = petalColors [Math.floor(Math.random()*3)];

	var geomPetal = new THREE.BoxGeometry( 15,20,5,1,1,1 );
	var matPetal = new THREE.MeshBasicMaterial( { color:petalColor});
	geomPetal.vertices[5].y-=4;
	geomPetal.vertices[4].y-=4;
	geomPetal.vertices[7].y+=4;
	geomPetal.vertices[6].y+=4;
	geomPetal.translate(12.5,0,3);

		var petals = [];
		for(var i=0; i<4; i++){	

			petals[i]=new THREE.Mesh(geomPetal,matPetal);
			petals[i].rotation.z = i*Math.PI/2;
			petals[i].castShadow = true;
			petals[i].receiveShadow = true;
		}

	petalCore.add(petals[0],petals[1],petals[2],petals[3]);
	petalCore.position.y = 25;
	petalCore.position.z = 3;
	this.mesh.add(petalCore);

}

var petalColors = [Colors.red, Colors.yellow, Colors.blue];




//FOREST GENERATION USING TREES AND FLOWERS
var Forest = function(){

	this.mesh = new THREE.Object3D();

	// Number of Trees
	this.nTrees = 300;

	// Space the consistenly
	var stepAngle = Math.PI*2 / this.nTrees;

	// Create the Trees

	for(var i=0; i<this.nTrees; i++){
	
		var t = new Tree();

		//set rotation and position using trigonometry
		var a = stepAngle*i;
		// this is the distance between the center of the axis and the tree itself
		var h = 605;
		t.mesh.position.y = Math.sin(a)*h;
		t.mesh.position.x = Math.cos(a)*h;		

		// rotate the tree according to its position
		t.mesh.rotation.z = a + (Math.PI/2)*3;

		// random depth for the tree on the z-axis
		t.mesh.position.z = 0-Math.random()*600;

		// random scale for each tree
		var s = .3+Math.random()*.75;
		t.mesh.scale.set(s,s,s);

		this.mesh.add(t.mesh);
	}

	// Number of Trees
	this.nFlowers = 350;

	var stepAngle = Math.PI*2 / this.nFlowers;


	for(var i=0; i<this.nFlowers; i++){	

		var f = new Flower();
		var a = stepAngle*i;

		var h = 605;
		f.mesh.position.y = Math.sin(a)*h;
		f.mesh.position.x = Math.cos(a)*h;		

		f.mesh.rotation.z = a + (Math.PI/2)*3;

		f.mesh.position.z = 0-Math.random()*600;

		var s = .1+Math.random()*.3;
		f.mesh.scale.set(s,s,s);

		this.mesh.add(f.mesh);
	}

}

//SUN GENERATION
var Sun = function(){

	this.mesh = new THREE.Object3D();

	var sunGeom = new THREE.SphereGeometry( 400, 20, 10 );
	var sunMat = new THREE.MeshPhongMaterial({
		//color: Colors.red,
		shading:THREE.FlatShading,
	});
	var sun = new THREE.Mesh(sunGeom, sunMat);
    //sun.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
	sun.castShadow = false;
	sun.receiveShadow = false;
	this.mesh.add(sun);
}


//SEA OR PLANET GENERATION
var Sea = function() {
	var geom = new THREE.CylinderGeometry(600, 600, 800, 40, 10);
	geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
	geom.mergeVertices();
	var l = geom.vertices.length;
  
	this.waves = [];
  
	for (var i = 0; i < l; i++) {
	  var v = geom.vertices[i];
	  this.waves.push({
		y: v.y,
		x: v.x,
		z: v.z,
		ang: Math.random() * Math.PI * 2,
		amp: 5 + Math.random() * 15,
		speed: 0.016 + Math.random() * 0.032
	  });
	};
	var mat = new THREE.MeshPhongMaterial({
	  color: Colors.blue,
	  transparent: true,
	  opacity: .8,
	  shading: THREE.FlatShading,
  
	});
  
	this.mesh = new THREE.Mesh(geom, mat);
	this.mesh.receiveShadow = true;
  
  }
  
  Sea.prototype.moveWaves = function() {
	var verts = this.mesh.geometry.vertices;
	var l = verts.length;
	for (var i = 0; i < l; i++) {
	  var v = verts[i];
	  var vprops = this.waves[i];
	  v.x = vprops.x + Math.cos(vprops.ang) * vprops.amp;
	  v.y = vprops.y + Math.sin(vprops.ang) * vprops.amp;
	  vprops.ang += vprops.speed;
	}
	this.mesh.geometry.verticesNeedUpdate = true;
	sea.mesh.rotation.z += .005;
  }



//CLOUD GENERATION
var Cloud = function(){
	// Create an empty container for the cloud
	this.mesh = new THREE.Object3D();
	// Cube geometry and material
	var geom = new THREE.DodecahedronGeometry(30,0);
	var mat = new THREE.MeshPhongMaterial({
		color:Colors.white,  
	});

	var nBlocs = 3+Math.floor(Math.random()*3);

	for (var i=0; i<nBlocs; i++ ){
		//Clone mesh geometry
		var m = new THREE.Mesh(geom, mat);
			//Randomly position each cube
			m.position.x = i*15;
			m.position.y = Math.random()*10;
			m.position.z = Math.random()*10;
			m.rotation.z = Math.random()*Math.PI*2;
			m.rotation.y = Math.random()*Math.PI*2;

			//Randomly scale the cubes
			var s = .1 + Math.random()*.9;
			m.scale.set(s,s,s);
			this.mesh.add(m);
	}
}



//SKY GENERATION USING CLOUDS
var Sky = function(){

	this.mesh = new THREE.Object3D();

	// Number of cloud groups
	this.nClouds = 30;

	// Space the consistenly
	var stepAngle = Math.PI*2 / this.nClouds;

	// Create the Clouds

	for(var i=0; i<this.nClouds; i++){
	
		var c = new Cloud();

		//set rotation and position using trigonometry
		var a = stepAngle*i;
		// this is the distance between the center of the axis and the cloud itself
		var h = 900 + Math.random()*200;
		c.mesh.position.y = Math.sin(a)*h;
		c.mesh.position.x = Math.cos(a)*h;		

		// rotate the cloud according to its position
		c.mesh.rotation.z = a + Math.PI/2;

		// random depth for the clouds on the z-axis
		c.mesh.position.z = -400-Math.random()*400;

		// random scale for each cloud
		var s = 1+Math.random()*2;
		c.mesh.scale.set(s,s,s);

		this.mesh.add(c.mesh);
	}
}









var sky;
var forest;
var airplane;
var sun;
var sea;





//CREATING FUNCTIONS FOR ALL OBJECTS
var mousePos={x:0, y:0};
var offSet = -600;




function createPlane() {
	airplane = new AirPlane();
	airplane.mesh.scale.set(.30, .30, .30);
	airplane.mesh.position.y = 400;
	airplane.mesh.position.z = -100;
	scene.add(airplane.mesh);
  }

function createSky(){
	sky = new Sky();
	sky.mesh.position.y = offSet;
	scene.add(sky.mesh);
  }


  function createSea() {
	sea = new Sea();
	sea.mesh.position.y = -600;
	scene.add(sea.mesh);
  }

  function createForest(){
	forest = new Forest();
	forest.mesh.position.y = offSet;
	scene.add(forest.mesh);
  }

  

function createSun(){ 
	sun = new Sun();
	sun.mesh.scale.set(1,1,.3);
	sun.mesh.position.set(0,-30,-850);
	scene.add(sun.mesh);
}
 



function loop(){
	//land.mesh.rotation.z += .005;
	
	updatePlane();
    airplane.pilot.updateHairs();
	sea.moveWaves(); 
    sky.mesh.rotation.z += .003;
	forest.mesh.rotation.z += .005;
    updateCameraFov();
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  


  //UPDATING PLANE POSITION
  function updatePlane() {
	var targetY = normalize(mousePos.y, -.75, .75, 25, 175);
	var targetX = normalize(mousePos.x, -.75, .75, -100, 100);
	airplane.mesh.position.y += (targetY - airplane.mesh.position.y) * 0.1;
	airplane.mesh.rotation.z = (targetY - airplane.mesh.position.y) * 0.0128;
	airplane.mesh.rotation.x = (airplane.mesh.position.y - targetY) * 0.0064;
	airplane.propeller.rotation.x += 0.3;
  }


  function normalize(v, vmin, vmax, tmin, tmax) {
	var nv = Math.max(Math.min(v, vmax), vmin);
	var dv = vmax - vmin;
	var pc = (nv - vmin) / dv;
	var dt = tmax - tmin;
	var tv = tmin + (pc * dt);
	return tv;
  }

  function updateCameraFov() {
	camera.fov = normalize(mousePos.x, -1, 1, 50, 70);
	camera.updateProjectionMatrix();
  }



function handleMouseMove (event) {
	var tx = -1 + (event.clientX / WIDTH)*2;
	var ty = 1 - (event.clientY / HEIGHT)*2;
	mousePos = {x:tx, y:ty};	
}


function init(event) {
	createScene();
	createLights();
	createPlane();
	createSea();
	createSky();
	createForest();
	createSun();
	
	document.addEventListener('mousemove', handleMouseMove, false);

	loop();
}

window.addEventListener('load', init, false); 