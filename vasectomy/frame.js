'use strict';
if(document.querySelector('#vas-3d-stage'))import('./assets/vas-3d/scene.js').catch(()=>{document.querySelector('#vas-3d-fallback').dataset.reason='module-unavailable'});
