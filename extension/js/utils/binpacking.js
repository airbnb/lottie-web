/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global console, require*/

var bm_binpacker = (function () {
    'use strict';
    var ob = {}, blocks = [], packer, binpacking, GrowingPacker;
    if (typeof require === 'function') {
        ob.enabled = true;
        binpacking = require('binpacking');
        GrowingPacker = binpacking.GrowingPacker;
    }
    
    function addBlocks(blocks) {
        console.log(blocks);
        var i, len = blocks.length;
        for(i = 0; i < len; i += 1) {
            addBlock(blocks[i]);
        }
    }
    
    function addBlock(block) {
        blocks.push(block);
    }
    
    function getPack() {
        var packer = new GrowingPacker();
        blocks.sort(function(a, b) { return (b.h > a.h); });
        packer.fit(blocks);
        console.log(blocks);
        return blocks;
    }
    
    function reset() {
        blocks.length = 0;
    }
    
    ob.addBlock = addBlock;
    ob.addBlocks = addBlocks;
    ob.reset = reset;
    ob.getPack = getPack;
    
    return ob;
}());