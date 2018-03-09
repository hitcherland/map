function makeGrid( xSegments, ySegments, blockSize ) {
    var gridObject = new THREE.Object3D();
    function makeGridBlock( blockSize ) {
        var boxGeometry = new THREE.BoxGeometry( blockSize, blockSize, blockSize, 1, 1, 1);

        var shaderMaterial = new THREE.ShaderMaterial( {
            uniforms: {
                mouseOver: { value: 0.0 },
                lineWidth: { value: 0.1 },
            },
            vertexShader: ` 
                uniform float mouseOver;
                varying vec2 vUv;
                void main() { 
                    vUv = uv;
                    vec3 pos = position;
                    if(mouseOver > 0.5) {
                        pos *= 1.2;
                    }
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 ); 
                } 
            `,
            fragmentShader: `
                varying vec2 vUv;
                uniform float lineWidth;
                void main() {
                    float limit = 0.5 - lineWidth;
                    float xEdge = abs(vUv.x - 0.5 );
                    float yEdge = abs(vUv.y - 0.5 );
                    vec3 color = vec3(0.5,0,0);

                    if( xEdge > limit ) {
                        color *= (0.5- xEdge) / lineWidth;
                    } 
                    if( yEdge > limit ) {
                        color *= (0.5- yEdge) / lineWidth;
                    }
                    gl_FragColor = vec4( color, 1 );
                }
            `,
        } );

        var material = new THREE.MeshBasicMaterial();
		material =		new THREE.MeshPhongMaterial( {
					color: 0x156289,
					emissive: 0x072534,
					side: THREE.DoubleSide,
					flatShading: true
				} )

        var lineMaterial = new THREE.LineBasicMaterial( { 
            color: 0xffffff,
            transparent: true,
            opacity: 1.0
        } );
        var mesh = new THREE.Object3D();
        //mesh.add ( new THREE.LineSegments( new THREE.EdgesGeometry( boxGeometry ), lineMaterial ) );
        mesh.add ( new THREE.Mesh( boxGeometry, shaderMaterial ) );

        return mesh;
    }

    var meshes = [];
    for (var x=-xSegments/2; x<=xSegments/2; x++) {
        for (var y=-ySegments/2; y<=ySegments/2; y++) {
            var mesh = makeGridBlock( blockSize );
            mesh.position.set( x * blockSize, 0, y * blockSize);
            meshes.push( mesh );
            gridObject.add( mesh );
        }
    }

    function onMouseMove( event ) {
		function intersectObjects( pointer, objects ) {

			var rect = renderer.domElement.getBoundingClientRect();
			var x = ( pointer.clientX - rect.left ) / rect.width;
			var y = ( pointer.clientY - rect.top ) / rect.height;

            var pointerVector = new THREE.Vector2();
            var ray = new THREE.Raycaster();
			pointerVector.set( ( x * 2 ) - 1, - ( y * 2 ) + 1 );
			ray.setFromCamera( pointerVector, camera );

			var intersections = ray.intersectObjects( objects, true );
			return intersections[ 0 ] ? intersections[ 0 ] : false;
		}

        for(var i=0; i<gridObject.children.length; i++) {
            gridObject.children[i].children[0].material.uniforms.mouseOver.value = 0.0;
        }

        var intersect = intersectObjects( event, gridObject.children );
        if( intersect ) {
            //intersect.object.parent.children[0].material.color.set( '#ff0000' );
            intersect.object.material.uniforms.mouseOver.value = 1.0;
        }
    }

    //var mesh = new THREE.Mesh( boxGeometry, material);
    window.addEventListener( 'mousemove', onMouseMove, false );
    return gridObject;
}
