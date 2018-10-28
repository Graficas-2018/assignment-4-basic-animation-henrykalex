render = scene = camera = objLoader = null;

function run() {
    requestAnimationFrame(function() { run(); });

        // Render the scene
        renderer.render( scene, camera );

        KF.update();

        // Update the camera controller
        orbitControls.update();
}

function createScene(canvas){
  renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );
  renderer.setSize(canvas.width, canvas.height);
  // Turn on shadows
  renderer.shadowMap.enabled = true;
  // Options are THREE.BasicShadowMap, THREE.PCFShadowMap, PCFSoftShadowMap
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
  camera.position.set(0,20, 120);
  scene.add(camera);

  loadLights();
  loadMap();

  loadObj();
}
function loadLights(){
  let light = new THREE.PointLight(0xffffff, 1.2);
  light.position.set(0, 25, 50);
  light.shadowCameraVisible = true;
  light.shadowDarkness = 1;
  light.castShadow = true;
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;
  light.shadowCameraVisible = true;
  scene.add(light);

  let ambientLight = new THREE.AmbientLight ( 0x888888 );
  scene.add(ambientLight);
}
function loadMap(){
  let mapUrl = "./imgs/LostMeadow_dirt.jpg";
  let map = new THREE.TextureLoader().load(mapUrl);
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(8, 8);

  let color = 0xffffff;
  geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
  let mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:color, map:map, side:THREE.DoubleSide}));
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.1;
  mesh.castShadow = false;
  mesh.receiveShadow = true;
  scene.add(mesh);
}
function loadObj(){
  if(!objLoader)
  objLoader = new THREE.OBJLoader();
  objLoader.load('../models/cerberus/Cerberus.obj',objectLoaded,objectLoadProgress,objectLoadError);
  // objLoader.load('./obj/cat/12222_Cat_v1_l3.obj',objectLoaded,objectLoadProgress,objectLoadError);
}

objectLoaded = (object)=>{
  let texture = new THREE.TextureLoader().load('../models/cerberus/Cerberus_A.jpg');
  // let texture = new THREE.TextureLoader().load('./obj/cat/Cat_diffuse.jpg');
  // let normalMap = new THREE.TextureLoader().load('./obj/cat/Cerberus_N.jpg');
  let specularMap = new THREE.TextureLoader().load('../models/cerberus/Cerberus_M.jpg');
  // let specularMap = new THREE.TextureLoader().load('./obj/cat/Cat_bump.jpg');
  object.traverse(( child )=>{
      if ( child instanceof THREE.Mesh ){
          child.castShadow = true;
          child.receiveShadow = true;
          child.material.map = texture;
          // child.material.normalMap = normalMap;
          child.material.specularMap = specularMap;
      }
  });

  object.position.set(0,-50,0);
  object.scale.set(15, 15, 15);
  object.rotation.z = -Math.PI/2;
  object.rotation.x =  -Math.PI/2;

  loadAnimation(object);
  scene.add(object);
}
objectLoadProgress = (progress)=>{
  console.log( ( progress.loaded / progress.total * 100 ) + '% loaded' );
}
objectLoadError = (error)=>{
  console.log( 'An error happened',error);
}


function loadAnimation(object){
  let walkAnimator = new KF.KeyFrameAnimator;

  let rotPosValues = [];
  let rotPosKeys = [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1.0];
  let radius = 20;
  for(let key of rotPosKeys){
    rotPosValues.push({
      x: -radius * Math.cos(key * Math.PI * 2),
      y: 0.0,
      z: radius*Math.sin(key * Math.PI * 2),
    });
  }
  walkAnimator.init({
    interps: [
      {
        keys: rotPosKeys,
        values: rotPosValues,
        target: object.position
      },
      {
        keys: [0, 1.0],
        values: [
          {z:0.0},
          {z:Math.PI*2}
        ],
        target: object.rotation
      }
    ],
    loop: true,
    duration:15000,
    easing:TWEEN.Easing.None,
  });
  walkAnimator.start();
}
