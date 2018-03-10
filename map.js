var selected = undefined;
function makeGrid( xSegments, ySegments, blockSize ) {
    var gridObject = new THREE.Object3D();
    function makeGridBlock( blockSize ) {
        var boxGeometry = new THREE.BoxGeometry( blockSize, blockSize, blockSize, 1, 1, 1);

        var shaderMaterial = new THREE.ShaderMaterial( {
            uniforms: {
                mouseOver: { value: 0.0 },
                lineWidth: { value: 0.05 },
                isSelected: { value: 0 },
            },
            vertexShader: ` 
                uniform float mouseOver;
                varying vec2 vUv;
                void main() { 
                    vUv = uv;
                    vec3 pos = position;
                    if(mouseOver > 0.5) {
                        pos += vec3(0,3,0);
                    }
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 ); 
                } 
            `,
            fragmentShader: `
                varying vec2 vUv;
                uniform float lineWidth;
                uniform float mouseOver;
                uniform float isSelected;
                void main() {
                    float limit = 0.5 - lineWidth;
                    float xEdge = abs(vUv.x - 0.5 );
                    float yEdge = abs(vUv.y - 0.5 );
                    vec3 color = vec3(0.5, mouseOver, 0);
                    if( isSelected > 0.5 ) {
                        color = vec3( 1, 0, 0 );
                    }

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

        var mesh =  new THREE.Mesh( boxGeometry, shaderMaterial );

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

    function onMouseMove( event ) {
        for(var i=0; i<gridObject.children.length; i++) {
            gridObject.children[i].material.uniforms.mouseOver.value = 0.0;
        }

        var intersect = intersectObjects( event, gridObject.children );
        if( intersect && typeof selected === "undefined" ) {
            intersect.object.material.uniforms.mouseOver.value = 1.0;
        }
    }

    function onMouseClick( event ) {
        var intersect = intersectObjects( event, gridObject.children );
        if( intersect && selected != intersect.object ) {
            selected = intersect.object;
            camera.zoom = 10;
            var p = intersect.object.position;
            camera.position.set( 100 + p.x, 50 + p.y, 100 + p.z );
            camera.lookAt( intersect.object.position );
        } else { 
            selected = undefined;
            camera.zoom = 1;
            camera.position.set( 100, 100, 100 );
            camera.lookAt( 0, 0, 0 );
        }

        for(var i=0; i<gridObject.children.length; i++) {
            gridObject.children[i].material.uniforms.mouseOver.value = 0.0;
            gridObject.children[i].material.uniforms.isSelected.value = gridObject.children[i] == selected ? 1.0 : 0.0;
            gridObject.children[i].material.uniforms.lineWidth.value = 0.05 / camera.zoom;
        }

        camera.updateProjectionMatrix();
    }

    window.addEventListener( 'mousemove', onMouseMove, false );
    window.addEventListener( 'click', onMouseClick, false );
    return gridObject;
}
