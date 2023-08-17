(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// go-json2html/index.js

module.exports = (function () {

// PRIVATE Properties/Methods
var _ = {

    id: 0,
    primitiveTypesNotNull: {'string':1, 'undefined':1, 'number':1, 'boolean':1, 'symbol': 1},
        // since typeof null yields 'object', it's handled separately

}; // end PRIVATE properties


//---------------------
_.displayPageH = (parent, dispOb) => {
    
    if (dispOb === 0) {
        // case where no content is desired
        // to display an actual zero, make it a string:  "0"

        return;

    } // end if (dispOb === 0)
    
    var dispObType = typeof dispOb;
    var isPrimitive = _.primitiveTypesNotNull.hasOwnProperty (dispObType) || dispOb === null;

    if (isPrimitive) {

        Id = _.textMake (parent, dispOb, 'append');

    } else {
        
            // NE => Not Empty
        var isNEArray = Array.isArray (dispOb) && dispOb.length > 0;
        var isNEObject = !Array.isArray(dispOb) && dispObType == 'object' && Object.keys(dispOb).length > 0;
        
        var Id = null;
            // capital Id to indicate id with '#' prefixing it
    
        if (isNEObject) {
    
            if (dispOb.hasOwnProperty ('rm')) {

                var selector = dispOb.rm;
                $(selector)
                .remove ();

            } else if (dispOb.hasOwnProperty ('empty')) {

                var selector = dispOb.empty;
                $(selector)
                .empty ()
                .off ('keydown');
                    // empty contents and turn off all event handlers

            } else if (dispOb.hasOwnProperty ('content')) {

                _.displayPageH (parent, dispOb.content);

            } else if (dispOb.hasOwnProperty ('attr')) {

                $(parent)
                .attr (dispOb.attr);

                /*
            } else if (dispOb.hasOwnProperty ('script') && dispOb.script !== 0) {

                var scriptFn = eval (dispOb.script);

                var goKey = require ('go-key');
                scriptFn (P.displayPage, P.genId, goKey, dispOb.parent);
                */

            } else if (dispOb.hasOwnProperty ('script') && dispOb.script !== 0) {

                // https://stackoverflow.com/questions/9413737/how-to-append-script-script-in-javascript
                // inspired by SO question, but setting innerHTML isn't supposed to work
                // therefore, set src attribute with path to file, instead of 
                // setting innerHTML to content of file
                var script = document.createElement("script");

                // Add script content

                //script.innerHTML = dispOb.script;
                script.src = dispOb.script;
                if (dispOb.hasOwnProperty ('id')) {

                    script.id = dispOb.id;

                } // end if (dispOb.hasOwnProperty ('id'))
                

                // Append

                document.head.appendChild(script);     

            } else {
                
                parent = dispOb.hasOwnProperty ('parent') ? dispOb.parent : parent;

                var attrs = {};
                var elementName = null;
                var content;
            
                var keys = Object.keys (dispOb);
                var insertLocation = 'append';
                for (var i = 0; i < keys.length; i++) {
        
                    var ky = keys [i];
        
                    var tagType = _.getTagType (ky);
        
                    var styleInHead = parent === 'head' && ky === 'style';
                        // style in head => html element
                        // style not in head => attribute of dispOb
                        
                    var tagNotStyle = tagType !== 0 && ky !== 'style';
        
                    if (tagNotStyle || styleInHead) {
        
                        elementName = ky;
                        content = dispOb [elementName];
        
                    } else {
                        
                        switch (ky) {
            
                            case 'parent':
                                    // do nothing -- Prevents 'parent' from becoming an attribute
                                break;
                            case 'prepend':
                            case 'append':
                            case 'before':
                            case 'after':
                                insertLocation = ky;
                                parent = dispOb [ky] === 1 ? parent : dispOb [ky];
                                    // if any of prepend, ... are specified, and the value is other
                                    // than a '1', override the parent value with that value
                                break;
            
                            default:
                                
                                attrs [ky] = dispOb [ky];
                                break;
            
                        } // end switch (ky)
        
                    } // end if (tagType !== 0)
        
                } // end for (var i = 0; i < keys; i++)
                
        
                if (!elementName) {
                    // error case -- set as text and display entire dispOb

                    elementName = 'text';
                    content = JSON.stringify (dispOb);

                } // end if (!elementName)
                
                if (elementName === 'text') {

                    Id = _.textMake (parent, content, insertLocation);

                } else {

                    Id = _.elementMake (elementName, parent, insertLocation, attrs);

                } // end if (elementName === 'text')
                
                
                if (Id !== null) {
                    // case for element not 'text'
                    
                    _.displayPageH (Id, content);

                    if (elementName === 'form') {

                        $(parent)
                        .focus();

                    } // end if (elementName === 'form')
                
                } // end if (Id !== null)
                

            } // end if (dispOb.hasOwnProperty ('rm'))
            
    
        } else if (isNEArray) {
    
            for (var i = 0; i < dispOb.length; i++) {
    
                    // returned Id will be for last item in array
                    // useful to later add siblings with 'after' key
                Id = _.displayPageH (parent, dispOb [i]);
    
            } // end for (var i = 0; i < dispOb.length; i++)
    
        } else {
    
            Id = null;
                // case for dispOb as an empty object or empty array
    
        } // end if (isNEObject)

    } // end if (_.primitiveTypesNotNull.hasOwnProperty (dispObType))
    
        
    return Id;

}; // end _.displayPageH 

//---------------------
_.elementMake = (tag, parentOrSibl, insertLocation, attrs) => {
    
    var id;
    var attrKeys = Object.keys (attrs);
    var hasAttrs = attrKeys.length > 0;

    if (hasAttrs && attrs.hasOwnProperty ('id')) {

        id = attrs.id;

    } else {

        id = P.genId ();

    } // end if (hasAttrs)
    
    var Id = '#' + id;
    
    var divel = '<' + tag + ' id="' + id + '"';

    var tagtype = _.getTagType (tag);

    if (tagtype == 1) {

        divel += '>';

    } else {

        divel += '></' + tag + '>';

    } // end if (tagtype == 1)

    $(parentOrSibl)[insertLocation] (divel);
    
    if (hasAttrs) {
        
        $(Id)
        .attr (attrs);

    } // end if (hasAttrs)
    
    return Id;

}; // end _.elementMake

//---------------------
_.getTagType = (tag) => {

        // 1 => void elements, 2 => has content
    var tags = { area: 1, base: 1, br: 1, col: 1, embed: 1, hr: 1, img: 1, input: 1, keygen: 1, link: 1, meta: 1, param: 1, source: 1, track: 1, wbr: 1, a: 2, abbr: 2, address: 2, article: 2, aside: 2, audio: 2, b: 2, bdi: 2, bdo: 2, blockquote: 2, body: 2, button: 2, canvas: 2, caption: 2, cite: 2, code: 2, colgroup: 2, datalist: 2, dd: 2, del: 2, details: 2, dfn: 2, dialog: 2, div: 2, dl: 2, dt: 2, em: 2, fieldset: 2, figcaption: 2, figure: 2, footer: 2, form: 2, h1: 2, h2: 2, h3: 2, h4: 2, h5: 2, h6: 2, head: 2, header: 2, hgroup: 2, html: 2, i: 2, iframe: 2, ins: 2, kbd: 2, label: 2, legend: 2, li: 2, map: 2, mark: 2, menu: 2, meter: 2, nav: 2, noscript: 2, object: 2, ol: 2, optgroup: 2, option: 2, output: 2, p: 2, pre: 2, progress: 2, q: 2, rp: 2, rt: 2, ruby: 2, s: 2, samp: 2, script: 2, section: 2, select: 2, small: 2, span: 2, strong: 2, style: 2, sub: 2, summary: 2, sup: 2, svg: 2, table: 2, tbody: 2, td: 2, textarea: 2, tfoot: 2, th: 2, thead: 2, time: 2, title: 2, tr: 2, u: 2, ul: 2, 'var': 2, video: 2};

    tags.text = 1;  // special tag:  uses _.makeText ()
    
    return tags.hasOwnProperty(tag) ? tags [tag] : 0;

}; // end _.getTagType 


//---------------------
_.textMake = (parent, primitive, location) => {
    
    if (typeof primitive === 'string') {
        
        var singlequote = '&#x0027;';
        var backslash = '&#x005c;';
        var doublequote = '&#x0022;';
        var lt = '&lt;';
        
        primitive = primitive.replace (/'/g, singlequote);
        primitive = primitive.replace (/"/g, doublequote);
        primitive = primitive.replace (/\\/g, backslash);
        primitive = primitive.replace (/</g, lt);

    } else if (typeof primitive === 'symbol') {

        primitive = 'symbol';
            // otherwise stringify would produce '{}' which is less useful

    } else {

        primitive = JSON.stringify (primitive);

    } // end if (typeof primitive === 'string')
    

    $(parent) [location] (primitive);

    return null;
        // text obs have no id's: only text is appended with no way to address it
        // if addressing is necessary, use span instead of text

}; // end _.textMake 



// PUBLIC Properties/Methods
var P = {};

//---------------------
P.displayPage = (dispOb) => {
    
    var parent = dispOb.hasOwnProperty ('parent') ? dispOb.parent : 'body';
        // if parent not found, append to body

    var Id = _.displayPageH (parent, dispOb);

    return Id;

}; // end P.displayPage 

//---------------------
P.genId = () => {

    var id = 'i' + _.id++;
    return id;

}; // end P.genId


// end PUBLIC section

return P;

}());




},{}],2:[function(require,module,exports){
// go-popinfo/index.js

module.exports = function (dp) {

// PRIVATE Properties/Methods
var _ = {
    dpp: dp.displayPage,
    genId: dp.genId,
    arrowSize: 10,

}; // end PRIVATE properties

_.init = () => {

    _.setPopupStyle ();
};

//---------------------
_.getPosDim = (jq) => {
    
    var res = {};

    var offset = $(jq).offset ();
    res.left = offset.left;
    res.top = offset.top;

    res.width = $(jq).width ();
    res.height = $(jq).height ();

    return res;

}; // end _.getPosDim 

//---------------------
_.setPopupStyle = () => {
    
    var as = _.arrowSize;

    var popupStyle = [
        {rm: '#stylepopinfo'},
        {style: '.popup {' +
        'position: relative;' +
        'display: inline-block;' +
        'border: 1px solid blue;' +
        'border-radius: 4px;' +
        'background-color: #ebf2f2;' +
        'font-size: 12px;' +
    '}' +
    '.popupwrap {' +
        'position: absolute;' +
    '}' +
    '.popupnovis {' +
        'display: none;' +
    '}' +
    '.arrow {' +
        'position: absolute;' +
        'display: inline-block;' +
        'width: 0;' +
        'height: 0;' +
        'border-style: solid;' +
        'box-sizing: border-box;' +
    '}' +
    '.arrowborder {' +
        'border-width: ' + (as - 1) + 'px;' +
        'border-color: blue transparent transparent transparent;' +
        'bottom: -' + (2*as - 2) + 'px;' +
    '}' +
    '.arrowfiller {' +
        'border-width: '+ (as - 2) + 'px;' +
        'border-color: #ebf2f2 transparent transparent transparent;' +
        'bottom: -' + (2*as - 4) + 'px;' +
        'z-index: 1;' +
    '}', 
    id: 'stylepopinfo', parent: 'head'}
    ];

    _.dpp (popupStyle);

}; // end _.setPopupStyle





// PUBLIC Properties/Methods
var P = {};

//---------------------
P.createPopupDisplay = (jqObIn, dispstr, options) => {
    
    jqOb = typeof jqObIn === 'string' ? $(jqObIn) : jqObIn;
    IdjqOb = '#' + jqOb [0].id;

    dispStrs = dispstr.split ('\n');

    var dispA = [];
    for (var i = 0; i < dispStrs.length; i++) {

        var dispStr = dispStrs [i];
        if (i > 0) {

            dispA.push ({br:0});

        } // end if (i > 0)
        
        dispA.push ({span: dispStr, style: 'display: inline-block;'});


    } // end for (var i = 0; i < dispStrs; i++)
    
    var dispOb = {div: dispA, style: 'margin: 2px;'};
    var posEl = _.getPosDim (jqOb);

        // forces div width to width of content
        // http://stackoverflow.com/questions/450903/how-to-make-div-not-larger-than-its-contents

    var idAb = _.genId ();
    var idAf = _.genId ();

    var divArrowBorder = {div: 0, id: idAb, class: 'arrow arrowborder'};
    var divArrowFiller = {div: 0, id: idAf, class: 'arrow arrowfiller'};

    idAb = '#' + idAb;
    idAf = '#' + idAf;

    //var popOb = {div: [dispOb, divArrowBorder, divArrowFiller], class: 'popup', after: IdjqOb};
    var popObRel = {div: [dispOb, divArrowBorder, divArrowFiller], class: 'popup'};
    var popOb = {div: popObRel, class: 'popupwrap'};
    var IdPopOb = _.dpp (popOb);
    var posPopup = _.getPosDim (IdPopOb);

    var topDO = posEl.top - posPopup.height - _.arrowSize;
    var leftDO = posEl.left + posEl.width/2 - posPopup.width/2;

    $(IdPopOb)
    .offset ({top: topDO, left: leftDO});

    var posAb = _.getPosDim (idAb);
    var posAf = _.getPosDim (idAf);

    var as = _.arrowSize;
    $(idAb)
    .offset ({top: posAb.top, left: leftDO + posPopup.width/2 - as/2 - 2});

    $(idAf)
    .offset ({top: posAf.top, left: leftDO + posPopup.width/2 + 1 - as/2 - 2});

    $(IdPopOb)
    .addClass ('popupnovis');

    return IdPopOb;
}; // end P.createPopupDisplay 

//---------------------
P.hidePopups = (Id) => {
    
    var sel = Id ? Id : '.popupwrap';

    $(sel)
    .addClass ('popupnovis');


}; // end P.hidePopups


//---------------------
P.showPopups = (Id) => {
    
    var sel = Id ? Id : '.popupwrap';

    $(sel)
    .removeClass ('popupnovis');


}; // end P.showPopups





// end PUBLIC section

_.init ();

return P;

};





},{}],3:[function(require,module,exports){
// go-popinfo/index0.js

module.exports = (function () {

// PRIVATE Properties/Methods
var _ = {
}; // end PRIVATE properties

_.init = () => {
    
    var c = require ('./test.js');
    new c ();
};

// PUBLIC Properties/Methods
var P = {};

// end PUBLIC section

(function () {

    $(document).ready (_.init);

}) ();



return P;

}) ();






},{"./test.js":4}],4:[function(require,module,exports){
// go-popinfo/test.js

module.exports = function () {

// PRIVATE Properties/Methods
var _ = {
    j2h: require ('go-json2html'),
    pi: require ('go-popinfo')

}; // end PRIVATE properties

_.init = () => {

    _.dpp = _.j2h.displayPage;

    _.pi = new _.pi (_.j2h);

    _.dpp ({div:[
        {p: 'The description inside a paragraph'}, 
        {br:0}, 
        {p: 'new para', 
            id: 'pa', style: 
            'display:inline-block'
        }, 
        {br:0}, 
        {p: 'carlton programmed'}
    ], style: 'font-size: 40px'});

    var p = _.dpp ({div: 0, 
        style: 'left: 300px; top: 300px; margin-top: 80px'
    });

    var Id = _.dpp ({div: 'stuff inside', 
        style: 'width: 300px; height: 200px;border: 1px solid black;', parent: p});

    var IdPara = _.pi.createPopupDisplay ('#pa', "this is a paragraph\nwith more words\nthan ever before");
    //_.pi.showPopups (IdPara);

    var IdBox = _.pi.createPopupDisplay (Id, "this is a popup\nwith more explanation\nthan ever before");

    _.pi.showPopups ();

    /*
    setTimeout (
        function () {_.pi.hidePopups (IdPara)}
    , 3000);
    
    setTimeout (
        function () {_.pi.hidePopups ()}
    , 5000);
    */

    

};

_.init ();

};

},{"go-json2html":1,"go-popinfo":2}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL25vZGVfbW9kdWxlc19nbG9iYWwvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi9nby1qc29uMmh0bWwvaW5kZXguanMiLCJpbmRleC5qcyIsImluZGV4MC5qcyIsInRlc3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIGdvLWpzb24yaHRtbC9pbmRleC5qc1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG5cbi8vIFBSSVZBVEUgUHJvcGVydGllcy9NZXRob2RzXG52YXIgXyA9IHtcblxuICAgIGlkOiAwLFxuICAgIHByaW1pdGl2ZVR5cGVzTm90TnVsbDogeydzdHJpbmcnOjEsICd1bmRlZmluZWQnOjEsICdudW1iZXInOjEsICdib29sZWFuJzoxLCAnc3ltYm9sJzogMX0sXG4gICAgICAgIC8vIHNpbmNlIHR5cGVvZiBudWxsIHlpZWxkcyAnb2JqZWN0JywgaXQncyBoYW5kbGVkIHNlcGFyYXRlbHlcblxufTsgLy8gZW5kIFBSSVZBVEUgcHJvcGVydGllc1xuXG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5fLmRpc3BsYXlQYWdlSCA9IChwYXJlbnQsIGRpc3BPYikgPT4ge1xuICAgIFxuICAgIGlmIChkaXNwT2IgPT09IDApIHtcbiAgICAgICAgLy8gY2FzZSB3aGVyZSBubyBjb250ZW50IGlzIGRlc2lyZWRcbiAgICAgICAgLy8gdG8gZGlzcGxheSBhbiBhY3R1YWwgemVybywgbWFrZSBpdCBhIHN0cmluZzogIFwiMFwiXG5cbiAgICAgICAgcmV0dXJuO1xuXG4gICAgfSAvLyBlbmQgaWYgKGRpc3BPYiA9PT0gMClcbiAgICBcbiAgICB2YXIgZGlzcE9iVHlwZSA9IHR5cGVvZiBkaXNwT2I7XG4gICAgdmFyIGlzUHJpbWl0aXZlID0gXy5wcmltaXRpdmVUeXBlc05vdE51bGwuaGFzT3duUHJvcGVydHkgKGRpc3BPYlR5cGUpIHx8IGRpc3BPYiA9PT0gbnVsbDtcblxuICAgIGlmIChpc1ByaW1pdGl2ZSkge1xuXG4gICAgICAgIElkID0gXy50ZXh0TWFrZSAocGFyZW50LCBkaXNwT2IsICdhcHBlbmQnKTtcblxuICAgIH0gZWxzZSB7XG4gICAgICAgIFxuICAgICAgICAgICAgLy8gTkUgPT4gTm90IEVtcHR5XG4gICAgICAgIHZhciBpc05FQXJyYXkgPSBBcnJheS5pc0FycmF5IChkaXNwT2IpICYmIGRpc3BPYi5sZW5ndGggPiAwO1xuICAgICAgICB2YXIgaXNORU9iamVjdCA9ICFBcnJheS5pc0FycmF5KGRpc3BPYikgJiYgZGlzcE9iVHlwZSA9PSAnb2JqZWN0JyAmJiBPYmplY3Qua2V5cyhkaXNwT2IpLmxlbmd0aCA+IDA7XG4gICAgICAgIFxuICAgICAgICB2YXIgSWQgPSBudWxsO1xuICAgICAgICAgICAgLy8gY2FwaXRhbCBJZCB0byBpbmRpY2F0ZSBpZCB3aXRoICcjJyBwcmVmaXhpbmcgaXRcbiAgICBcbiAgICAgICAgaWYgKGlzTkVPYmplY3QpIHtcbiAgICBcbiAgICAgICAgICAgIGlmIChkaXNwT2IuaGFzT3duUHJvcGVydHkgKCdybScpKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgc2VsZWN0b3IgPSBkaXNwT2Iucm07XG4gICAgICAgICAgICAgICAgJChzZWxlY3RvcilcbiAgICAgICAgICAgICAgICAucmVtb3ZlICgpO1xuXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGRpc3BPYi5oYXNPd25Qcm9wZXJ0eSAoJ2VtcHR5JykpIHtcblxuICAgICAgICAgICAgICAgIHZhciBzZWxlY3RvciA9IGRpc3BPYi5lbXB0eTtcbiAgICAgICAgICAgICAgICAkKHNlbGVjdG9yKVxuICAgICAgICAgICAgICAgIC5lbXB0eSAoKVxuICAgICAgICAgICAgICAgIC5vZmYgKCdrZXlkb3duJyk7XG4gICAgICAgICAgICAgICAgICAgIC8vIGVtcHR5IGNvbnRlbnRzIGFuZCB0dXJuIG9mZiBhbGwgZXZlbnQgaGFuZGxlcnNcblxuICAgICAgICAgICAgfSBlbHNlIGlmIChkaXNwT2IuaGFzT3duUHJvcGVydHkgKCdjb250ZW50JykpIHtcblxuICAgICAgICAgICAgICAgIF8uZGlzcGxheVBhZ2VIIChwYXJlbnQsIGRpc3BPYi5jb250ZW50KTtcblxuICAgICAgICAgICAgfSBlbHNlIGlmIChkaXNwT2IuaGFzT3duUHJvcGVydHkgKCdhdHRyJykpIHtcblxuICAgICAgICAgICAgICAgICQocGFyZW50KVxuICAgICAgICAgICAgICAgIC5hdHRyIChkaXNwT2IuYXR0cik7XG5cbiAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgfSBlbHNlIGlmIChkaXNwT2IuaGFzT3duUHJvcGVydHkgKCdzY3JpcHQnKSAmJiBkaXNwT2Iuc2NyaXB0ICE9PSAwKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgc2NyaXB0Rm4gPSBldmFsIChkaXNwT2Iuc2NyaXB0KTtcblxuICAgICAgICAgICAgICAgIHZhciBnb0tleSA9IHJlcXVpcmUgKCdnby1rZXknKTtcbiAgICAgICAgICAgICAgICBzY3JpcHRGbiAoUC5kaXNwbGF5UGFnZSwgUC5nZW5JZCwgZ29LZXksIGRpc3BPYi5wYXJlbnQpO1xuICAgICAgICAgICAgICAgICovXG5cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZGlzcE9iLmhhc093blByb3BlcnR5ICgnc2NyaXB0JykgJiYgZGlzcE9iLnNjcmlwdCAhPT0gMCkge1xuXG4gICAgICAgICAgICAgICAgLy8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvOTQxMzczNy9ob3ctdG8tYXBwZW5kLXNjcmlwdC1zY3JpcHQtaW4tamF2YXNjcmlwdFxuICAgICAgICAgICAgICAgIC8vIGluc3BpcmVkIGJ5IFNPIHF1ZXN0aW9uLCBidXQgc2V0dGluZyBpbm5lckhUTUwgaXNuJ3Qgc3VwcG9zZWQgdG8gd29ya1xuICAgICAgICAgICAgICAgIC8vIHRoZXJlZm9yZSwgc2V0IHNyYyBhdHRyaWJ1dGUgd2l0aCBwYXRoIHRvIGZpbGUsIGluc3RlYWQgb2YgXG4gICAgICAgICAgICAgICAgLy8gc2V0dGluZyBpbm5lckhUTUwgdG8gY29udGVudCBvZiBmaWxlXG4gICAgICAgICAgICAgICAgdmFyIHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzY3JpcHRcIik7XG5cbiAgICAgICAgICAgICAgICAvLyBBZGQgc2NyaXB0IGNvbnRlbnRcblxuICAgICAgICAgICAgICAgIC8vc2NyaXB0LmlubmVySFRNTCA9IGRpc3BPYi5zY3JpcHQ7XG4gICAgICAgICAgICAgICAgc2NyaXB0LnNyYyA9IGRpc3BPYi5zY3JpcHQ7XG4gICAgICAgICAgICAgICAgaWYgKGRpc3BPYi5oYXNPd25Qcm9wZXJ0eSAoJ2lkJykpIHtcblxuICAgICAgICAgICAgICAgICAgICBzY3JpcHQuaWQgPSBkaXNwT2IuaWQ7XG5cbiAgICAgICAgICAgICAgICB9IC8vIGVuZCBpZiAoZGlzcE9iLmhhc093blByb3BlcnR5ICgnaWQnKSlcbiAgICAgICAgICAgICAgICBcblxuICAgICAgICAgICAgICAgIC8vIEFwcGVuZFxuXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzY3JpcHQpOyAgICAgXG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcGFyZW50ID0gZGlzcE9iLmhhc093blByb3BlcnR5ICgncGFyZW50JykgPyBkaXNwT2IucGFyZW50IDogcGFyZW50O1xuXG4gICAgICAgICAgICAgICAgdmFyIGF0dHJzID0ge307XG4gICAgICAgICAgICAgICAgdmFyIGVsZW1lbnROYW1lID0gbnVsbDtcbiAgICAgICAgICAgICAgICB2YXIgY29udGVudDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMgKGRpc3BPYik7XG4gICAgICAgICAgICAgICAgdmFyIGluc2VydExvY2F0aW9uID0gJ2FwcGVuZCc7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB2YXIga3kgPSBrZXlzIFtpXTtcbiAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHZhciB0YWdUeXBlID0gXy5nZXRUYWdUeXBlIChreSk7XG4gICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB2YXIgc3R5bGVJbkhlYWQgPSBwYXJlbnQgPT09ICdoZWFkJyAmJiBreSA9PT0gJ3N0eWxlJztcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHN0eWxlIGluIGhlYWQgPT4gaHRtbCBlbGVtZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzdHlsZSBub3QgaW4gaGVhZCA9PiBhdHRyaWJ1dGUgb2YgZGlzcE9iXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRhZ05vdFN0eWxlID0gdGFnVHlwZSAhPT0gMCAmJiBreSAhPT0gJ3N0eWxlJztcbiAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmICh0YWdOb3RTdHlsZSB8fCBzdHlsZUluSGVhZCkge1xuICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnROYW1lID0ga3k7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50ID0gZGlzcE9iIFtlbGVtZW50TmFtZV07XG4gICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKGt5KSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdwYXJlbnQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZG8gbm90aGluZyAtLSBQcmV2ZW50cyAncGFyZW50JyBmcm9tIGJlY29taW5nIGFuIGF0dHJpYnV0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdwcmVwZW5kJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdhcHBlbmQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2JlZm9yZSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnYWZ0ZXInOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnNlcnRMb2NhdGlvbiA9IGt5O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQgPSBkaXNwT2IgW2t5XSA9PT0gMSA/IHBhcmVudCA6IGRpc3BPYiBba3ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgYW55IG9mIHByZXBlbmQsIC4uLiBhcmUgc3BlY2lmaWVkLCBhbmQgdGhlIHZhbHVlIGlzIG90aGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGFuIGEgJzEnLCBvdmVycmlkZSB0aGUgcGFyZW50IHZhbHVlIHdpdGggdGhhdCB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdHRycyBba3ldID0gZGlzcE9iIFtreV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB9IC8vIGVuZCBzd2l0Y2ggKGt5KVxuICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgfSAvLyBlbmQgaWYgKHRhZ1R5cGUgIT09IDApXG4gICAgICAgIFxuICAgICAgICAgICAgICAgIH0gLy8gZW5kIGZvciAodmFyIGkgPSAwOyBpIDwga2V5czsgaSsrKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiAoIWVsZW1lbnROYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGVycm9yIGNhc2UgLS0gc2V0IGFzIHRleHQgYW5kIGRpc3BsYXkgZW50aXJlIGRpc3BPYlxuXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnROYW1lID0gJ3RleHQnO1xuICAgICAgICAgICAgICAgICAgICBjb250ZW50ID0gSlNPTi5zdHJpbmdpZnkgKGRpc3BPYik7XG5cbiAgICAgICAgICAgICAgICB9IC8vIGVuZCBpZiAoIWVsZW1lbnROYW1lKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50TmFtZSA9PT0gJ3RleHQnKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgSWQgPSBfLnRleHRNYWtlIChwYXJlbnQsIGNvbnRlbnQsIGluc2VydExvY2F0aW9uKTtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgSWQgPSBfLmVsZW1lbnRNYWtlIChlbGVtZW50TmFtZSwgcGFyZW50LCBpbnNlcnRMb2NhdGlvbiwgYXR0cnMpO1xuXG4gICAgICAgICAgICAgICAgfSAvLyBlbmQgaWYgKGVsZW1lbnROYW1lID09PSAndGV4dCcpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKElkICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNhc2UgZm9yIGVsZW1lbnQgbm90ICd0ZXh0J1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgXy5kaXNwbGF5UGFnZUggKElkLCBjb250ZW50KTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoZWxlbWVudE5hbWUgPT09ICdmb3JtJykge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHBhcmVudClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5mb2N1cygpO1xuXG4gICAgICAgICAgICAgICAgICAgIH0gLy8gZW5kIGlmIChlbGVtZW50TmFtZSA9PT0gJ2Zvcm0nKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH0gLy8gZW5kIGlmIChJZCAhPT0gbnVsbClcbiAgICAgICAgICAgICAgICBcblxuICAgICAgICAgICAgfSAvLyBlbmQgaWYgKGRpc3BPYi5oYXNPd25Qcm9wZXJ0eSAoJ3JtJykpXG4gICAgICAgICAgICBcbiAgICBcbiAgICAgICAgfSBlbHNlIGlmIChpc05FQXJyYXkpIHtcbiAgICBcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGlzcE9iLmxlbmd0aDsgaSsrKSB7XG4gICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIHJldHVybmVkIElkIHdpbGwgYmUgZm9yIGxhc3QgaXRlbSBpbiBhcnJheVxuICAgICAgICAgICAgICAgICAgICAvLyB1c2VmdWwgdG8gbGF0ZXIgYWRkIHNpYmxpbmdzIHdpdGggJ2FmdGVyJyBrZXlcbiAgICAgICAgICAgICAgICBJZCA9IF8uZGlzcGxheVBhZ2VIIChwYXJlbnQsIGRpc3BPYiBbaV0pO1xuICAgIFxuICAgICAgICAgICAgfSAvLyBlbmQgZm9yICh2YXIgaSA9IDA7IGkgPCBkaXNwT2IubGVuZ3RoOyBpKyspXG4gICAgXG4gICAgICAgIH0gZWxzZSB7XG4gICAgXG4gICAgICAgICAgICBJZCA9IG51bGw7XG4gICAgICAgICAgICAgICAgLy8gY2FzZSBmb3IgZGlzcE9iIGFzIGFuIGVtcHR5IG9iamVjdCBvciBlbXB0eSBhcnJheVxuICAgIFxuICAgICAgICB9IC8vIGVuZCBpZiAoaXNORU9iamVjdClcblxuICAgIH0gLy8gZW5kIGlmIChfLnByaW1pdGl2ZVR5cGVzTm90TnVsbC5oYXNPd25Qcm9wZXJ0eSAoZGlzcE9iVHlwZSkpXG4gICAgXG4gICAgICAgIFxuICAgIHJldHVybiBJZDtcblxufTsgLy8gZW5kIF8uZGlzcGxheVBhZ2VIIFxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXy5lbGVtZW50TWFrZSA9ICh0YWcsIHBhcmVudE9yU2libCwgaW5zZXJ0TG9jYXRpb24sIGF0dHJzKSA9PiB7XG4gICAgXG4gICAgdmFyIGlkO1xuICAgIHZhciBhdHRyS2V5cyA9IE9iamVjdC5rZXlzIChhdHRycyk7XG4gICAgdmFyIGhhc0F0dHJzID0gYXR0cktleXMubGVuZ3RoID4gMDtcblxuICAgIGlmIChoYXNBdHRycyAmJiBhdHRycy5oYXNPd25Qcm9wZXJ0eSAoJ2lkJykpIHtcblxuICAgICAgICBpZCA9IGF0dHJzLmlkO1xuXG4gICAgfSBlbHNlIHtcblxuICAgICAgICBpZCA9IFAuZ2VuSWQgKCk7XG5cbiAgICB9IC8vIGVuZCBpZiAoaGFzQXR0cnMpXG4gICAgXG4gICAgdmFyIElkID0gJyMnICsgaWQ7XG4gICAgXG4gICAgdmFyIGRpdmVsID0gJzwnICsgdGFnICsgJyBpZD1cIicgKyBpZCArICdcIic7XG5cbiAgICB2YXIgdGFndHlwZSA9IF8uZ2V0VGFnVHlwZSAodGFnKTtcblxuICAgIGlmICh0YWd0eXBlID09IDEpIHtcblxuICAgICAgICBkaXZlbCArPSAnPic7XG5cbiAgICB9IGVsc2Uge1xuXG4gICAgICAgIGRpdmVsICs9ICc+PC8nICsgdGFnICsgJz4nO1xuXG4gICAgfSAvLyBlbmQgaWYgKHRhZ3R5cGUgPT0gMSlcblxuICAgICQocGFyZW50T3JTaWJsKVtpbnNlcnRMb2NhdGlvbl0gKGRpdmVsKTtcbiAgICBcbiAgICBpZiAoaGFzQXR0cnMpIHtcbiAgICAgICAgXG4gICAgICAgICQoSWQpXG4gICAgICAgIC5hdHRyIChhdHRycyk7XG5cbiAgICB9IC8vIGVuZCBpZiAoaGFzQXR0cnMpXG4gICAgXG4gICAgcmV0dXJuIElkO1xuXG59OyAvLyBlbmQgXy5lbGVtZW50TWFrZVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXy5nZXRUYWdUeXBlID0gKHRhZykgPT4ge1xuXG4gICAgICAgIC8vIDEgPT4gdm9pZCBlbGVtZW50cywgMiA9PiBoYXMgY29udGVudFxuICAgIHZhciB0YWdzID0geyBhcmVhOiAxLCBiYXNlOiAxLCBicjogMSwgY29sOiAxLCBlbWJlZDogMSwgaHI6IDEsIGltZzogMSwgaW5wdXQ6IDEsIGtleWdlbjogMSwgbGluazogMSwgbWV0YTogMSwgcGFyYW06IDEsIHNvdXJjZTogMSwgdHJhY2s6IDEsIHdicjogMSwgYTogMiwgYWJicjogMiwgYWRkcmVzczogMiwgYXJ0aWNsZTogMiwgYXNpZGU6IDIsIGF1ZGlvOiAyLCBiOiAyLCBiZGk6IDIsIGJkbzogMiwgYmxvY2txdW90ZTogMiwgYm9keTogMiwgYnV0dG9uOiAyLCBjYW52YXM6IDIsIGNhcHRpb246IDIsIGNpdGU6IDIsIGNvZGU6IDIsIGNvbGdyb3VwOiAyLCBkYXRhbGlzdDogMiwgZGQ6IDIsIGRlbDogMiwgZGV0YWlsczogMiwgZGZuOiAyLCBkaWFsb2c6IDIsIGRpdjogMiwgZGw6IDIsIGR0OiAyLCBlbTogMiwgZmllbGRzZXQ6IDIsIGZpZ2NhcHRpb246IDIsIGZpZ3VyZTogMiwgZm9vdGVyOiAyLCBmb3JtOiAyLCBoMTogMiwgaDI6IDIsIGgzOiAyLCBoNDogMiwgaDU6IDIsIGg2OiAyLCBoZWFkOiAyLCBoZWFkZXI6IDIsIGhncm91cDogMiwgaHRtbDogMiwgaTogMiwgaWZyYW1lOiAyLCBpbnM6IDIsIGtiZDogMiwgbGFiZWw6IDIsIGxlZ2VuZDogMiwgbGk6IDIsIG1hcDogMiwgbWFyazogMiwgbWVudTogMiwgbWV0ZXI6IDIsIG5hdjogMiwgbm9zY3JpcHQ6IDIsIG9iamVjdDogMiwgb2w6IDIsIG9wdGdyb3VwOiAyLCBvcHRpb246IDIsIG91dHB1dDogMiwgcDogMiwgcHJlOiAyLCBwcm9ncmVzczogMiwgcTogMiwgcnA6IDIsIHJ0OiAyLCBydWJ5OiAyLCBzOiAyLCBzYW1wOiAyLCBzY3JpcHQ6IDIsIHNlY3Rpb246IDIsIHNlbGVjdDogMiwgc21hbGw6IDIsIHNwYW46IDIsIHN0cm9uZzogMiwgc3R5bGU6IDIsIHN1YjogMiwgc3VtbWFyeTogMiwgc3VwOiAyLCBzdmc6IDIsIHRhYmxlOiAyLCB0Ym9keTogMiwgdGQ6IDIsIHRleHRhcmVhOiAyLCB0Zm9vdDogMiwgdGg6IDIsIHRoZWFkOiAyLCB0aW1lOiAyLCB0aXRsZTogMiwgdHI6IDIsIHU6IDIsIHVsOiAyLCAndmFyJzogMiwgdmlkZW86IDJ9O1xuXG4gICAgdGFncy50ZXh0ID0gMTsgIC8vIHNwZWNpYWwgdGFnOiAgdXNlcyBfLm1ha2VUZXh0ICgpXG4gICAgXG4gICAgcmV0dXJuIHRhZ3MuaGFzT3duUHJvcGVydHkodGFnKSA/IHRhZ3MgW3RhZ10gOiAwO1xuXG59OyAvLyBlbmQgXy5nZXRUYWdUeXBlIFxuXG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5fLnRleHRNYWtlID0gKHBhcmVudCwgcHJpbWl0aXZlLCBsb2NhdGlvbikgPT4ge1xuICAgIFxuICAgIGlmICh0eXBlb2YgcHJpbWl0aXZlID09PSAnc3RyaW5nJykge1xuICAgICAgICBcbiAgICAgICAgdmFyIHNpbmdsZXF1b3RlID0gJyYjeDAwMjc7JztcbiAgICAgICAgdmFyIGJhY2tzbGFzaCA9ICcmI3gwMDVjOyc7XG4gICAgICAgIHZhciBkb3VibGVxdW90ZSA9ICcmI3gwMDIyOyc7XG4gICAgICAgIHZhciBsdCA9ICcmbHQ7JztcbiAgICAgICAgXG4gICAgICAgIHByaW1pdGl2ZSA9IHByaW1pdGl2ZS5yZXBsYWNlICgvJy9nLCBzaW5nbGVxdW90ZSk7XG4gICAgICAgIHByaW1pdGl2ZSA9IHByaW1pdGl2ZS5yZXBsYWNlICgvXCIvZywgZG91YmxlcXVvdGUpO1xuICAgICAgICBwcmltaXRpdmUgPSBwcmltaXRpdmUucmVwbGFjZSAoL1xcXFwvZywgYmFja3NsYXNoKTtcbiAgICAgICAgcHJpbWl0aXZlID0gcHJpbWl0aXZlLnJlcGxhY2UgKC88L2csIGx0KTtcblxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHByaW1pdGl2ZSA9PT0gJ3N5bWJvbCcpIHtcblxuICAgICAgICBwcmltaXRpdmUgPSAnc3ltYm9sJztcbiAgICAgICAgICAgIC8vIG90aGVyd2lzZSBzdHJpbmdpZnkgd291bGQgcHJvZHVjZSAne30nIHdoaWNoIGlzIGxlc3MgdXNlZnVsXG5cbiAgICB9IGVsc2Uge1xuXG4gICAgICAgIHByaW1pdGl2ZSA9IEpTT04uc3RyaW5naWZ5IChwcmltaXRpdmUpO1xuXG4gICAgfSAvLyBlbmQgaWYgKHR5cGVvZiBwcmltaXRpdmUgPT09ICdzdHJpbmcnKVxuICAgIFxuXG4gICAgJChwYXJlbnQpIFtsb2NhdGlvbl0gKHByaW1pdGl2ZSk7XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgLy8gdGV4dCBvYnMgaGF2ZSBubyBpZCdzOiBvbmx5IHRleHQgaXMgYXBwZW5kZWQgd2l0aCBubyB3YXkgdG8gYWRkcmVzcyBpdFxuICAgICAgICAvLyBpZiBhZGRyZXNzaW5nIGlzIG5lY2Vzc2FyeSwgdXNlIHNwYW4gaW5zdGVhZCBvZiB0ZXh0XG5cbn07IC8vIGVuZCBfLnRleHRNYWtlIFxuXG5cblxuLy8gUFVCTElDIFByb3BlcnRpZXMvTWV0aG9kc1xudmFyIFAgPSB7fTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblAuZGlzcGxheVBhZ2UgPSAoZGlzcE9iKSA9PiB7XG4gICAgXG4gICAgdmFyIHBhcmVudCA9IGRpc3BPYi5oYXNPd25Qcm9wZXJ0eSAoJ3BhcmVudCcpID8gZGlzcE9iLnBhcmVudCA6ICdib2R5JztcbiAgICAgICAgLy8gaWYgcGFyZW50IG5vdCBmb3VuZCwgYXBwZW5kIHRvIGJvZHlcblxuICAgIHZhciBJZCA9IF8uZGlzcGxheVBhZ2VIIChwYXJlbnQsIGRpc3BPYik7XG5cbiAgICByZXR1cm4gSWQ7XG5cbn07IC8vIGVuZCBQLmRpc3BsYXlQYWdlIFxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuUC5nZW5JZCA9ICgpID0+IHtcblxuICAgIHZhciBpZCA9ICdpJyArIF8uaWQrKztcbiAgICByZXR1cm4gaWQ7XG5cbn07IC8vIGVuZCBQLmdlbklkXG5cblxuLy8gZW5kIFBVQkxJQyBzZWN0aW9uXG5cbnJldHVybiBQO1xuXG59KCkpO1xuXG5cblxuIiwiLy8gZ28tcG9waW5mby9pbmRleC5qc1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChkcCkge1xuXG4vLyBQUklWQVRFIFByb3BlcnRpZXMvTWV0aG9kc1xudmFyIF8gPSB7XG4gICAgZHBwOiBkcC5kaXNwbGF5UGFnZSxcbiAgICBnZW5JZDogZHAuZ2VuSWQsXG4gICAgYXJyb3dTaXplOiAxMCxcblxufTsgLy8gZW5kIFBSSVZBVEUgcHJvcGVydGllc1xuXG5fLmluaXQgPSAoKSA9PiB7XG5cbiAgICBfLnNldFBvcHVwU3R5bGUgKCk7XG59O1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXy5nZXRQb3NEaW0gPSAoanEpID0+IHtcbiAgICBcbiAgICB2YXIgcmVzID0ge307XG5cbiAgICB2YXIgb2Zmc2V0ID0gJChqcSkub2Zmc2V0ICgpO1xuICAgIHJlcy5sZWZ0ID0gb2Zmc2V0LmxlZnQ7XG4gICAgcmVzLnRvcCA9IG9mZnNldC50b3A7XG5cbiAgICByZXMud2lkdGggPSAkKGpxKS53aWR0aCAoKTtcbiAgICByZXMuaGVpZ2h0ID0gJChqcSkuaGVpZ2h0ICgpO1xuXG4gICAgcmV0dXJuIHJlcztcblxufTsgLy8gZW5kIF8uZ2V0UG9zRGltIFxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXy5zZXRQb3B1cFN0eWxlID0gKCkgPT4ge1xuICAgIFxuICAgIHZhciBhcyA9IF8uYXJyb3dTaXplO1xuXG4gICAgdmFyIHBvcHVwU3R5bGUgPSBbXG4gICAgICAgIHtybTogJyNzdHlsZXBvcGluZm8nfSxcbiAgICAgICAge3N0eWxlOiAnLnBvcHVwIHsnICtcbiAgICAgICAgJ3Bvc2l0aW9uOiByZWxhdGl2ZTsnICtcbiAgICAgICAgJ2Rpc3BsYXk6IGlubGluZS1ibG9jazsnICtcbiAgICAgICAgJ2JvcmRlcjogMXB4IHNvbGlkIGJsdWU7JyArXG4gICAgICAgICdib3JkZXItcmFkaXVzOiA0cHg7JyArXG4gICAgICAgICdiYWNrZ3JvdW5kLWNvbG9yOiAjZWJmMmYyOycgK1xuICAgICAgICAnZm9udC1zaXplOiAxMnB4OycgK1xuICAgICd9JyArXG4gICAgJy5wb3B1cHdyYXAgeycgK1xuICAgICAgICAncG9zaXRpb246IGFic29sdXRlOycgK1xuICAgICd9JyArXG4gICAgJy5wb3B1cG5vdmlzIHsnICtcbiAgICAgICAgJ2Rpc3BsYXk6IG5vbmU7JyArXG4gICAgJ30nICtcbiAgICAnLmFycm93IHsnICtcbiAgICAgICAgJ3Bvc2l0aW9uOiBhYnNvbHV0ZTsnICtcbiAgICAgICAgJ2Rpc3BsYXk6IGlubGluZS1ibG9jazsnICtcbiAgICAgICAgJ3dpZHRoOiAwOycgK1xuICAgICAgICAnaGVpZ2h0OiAwOycgK1xuICAgICAgICAnYm9yZGVyLXN0eWxlOiBzb2xpZDsnICtcbiAgICAgICAgJ2JveC1zaXppbmc6IGJvcmRlci1ib3g7JyArXG4gICAgJ30nICtcbiAgICAnLmFycm93Ym9yZGVyIHsnICtcbiAgICAgICAgJ2JvcmRlci13aWR0aDogJyArIChhcyAtIDEpICsgJ3B4OycgK1xuICAgICAgICAnYm9yZGVyLWNvbG9yOiBibHVlIHRyYW5zcGFyZW50IHRyYW5zcGFyZW50IHRyYW5zcGFyZW50OycgK1xuICAgICAgICAnYm90dG9tOiAtJyArICgyKmFzIC0gMikgKyAncHg7JyArXG4gICAgJ30nICtcbiAgICAnLmFycm93ZmlsbGVyIHsnICtcbiAgICAgICAgJ2JvcmRlci13aWR0aDogJysgKGFzIC0gMikgKyAncHg7JyArXG4gICAgICAgICdib3JkZXItY29sb3I6ICNlYmYyZjIgdHJhbnNwYXJlbnQgdHJhbnNwYXJlbnQgdHJhbnNwYXJlbnQ7JyArXG4gICAgICAgICdib3R0b206IC0nICsgKDIqYXMgLSA0KSArICdweDsnICtcbiAgICAgICAgJ3otaW5kZXg6IDE7JyArXG4gICAgJ30nLCBcbiAgICBpZDogJ3N0eWxlcG9waW5mbycsIHBhcmVudDogJ2hlYWQnfVxuICAgIF07XG5cbiAgICBfLmRwcCAocG9wdXBTdHlsZSk7XG5cbn07IC8vIGVuZCBfLnNldFBvcHVwU3R5bGVcblxuXG5cblxuXG4vLyBQVUJMSUMgUHJvcGVydGllcy9NZXRob2RzXG52YXIgUCA9IHt9O1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuUC5jcmVhdGVQb3B1cERpc3BsYXkgPSAoanFPYkluLCBkaXNwc3RyLCBvcHRpb25zKSA9PiB7XG4gICAgXG4gICAganFPYiA9IHR5cGVvZiBqcU9iSW4gPT09ICdzdHJpbmcnID8gJChqcU9iSW4pIDoganFPYkluO1xuICAgIElkanFPYiA9ICcjJyArIGpxT2IgWzBdLmlkO1xuXG4gICAgZGlzcFN0cnMgPSBkaXNwc3RyLnNwbGl0ICgnXFxuJyk7XG5cbiAgICB2YXIgZGlzcEEgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRpc3BTdHJzLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAgdmFyIGRpc3BTdHIgPSBkaXNwU3RycyBbaV07XG4gICAgICAgIGlmIChpID4gMCkge1xuXG4gICAgICAgICAgICBkaXNwQS5wdXNoICh7YnI6MH0pO1xuXG4gICAgICAgIH0gLy8gZW5kIGlmIChpID4gMClcbiAgICAgICAgXG4gICAgICAgIGRpc3BBLnB1c2ggKHtzcGFuOiBkaXNwU3RyLCBzdHlsZTogJ2Rpc3BsYXk6IGlubGluZS1ibG9jazsnfSk7XG5cblxuICAgIH0gLy8gZW5kIGZvciAodmFyIGkgPSAwOyBpIDwgZGlzcFN0cnM7IGkrKylcbiAgICBcbiAgICB2YXIgZGlzcE9iID0ge2RpdjogZGlzcEEsIHN0eWxlOiAnbWFyZ2luOiAycHg7J307XG4gICAgdmFyIHBvc0VsID0gXy5nZXRQb3NEaW0gKGpxT2IpO1xuXG4gICAgICAgIC8vIGZvcmNlcyBkaXYgd2lkdGggdG8gd2lkdGggb2YgY29udGVudFxuICAgICAgICAvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzQ1MDkwMy9ob3ctdG8tbWFrZS1kaXYtbm90LWxhcmdlci10aGFuLWl0cy1jb250ZW50c1xuXG4gICAgdmFyIGlkQWIgPSBfLmdlbklkICgpO1xuICAgIHZhciBpZEFmID0gXy5nZW5JZCAoKTtcblxuICAgIHZhciBkaXZBcnJvd0JvcmRlciA9IHtkaXY6IDAsIGlkOiBpZEFiLCBjbGFzczogJ2Fycm93IGFycm93Ym9yZGVyJ307XG4gICAgdmFyIGRpdkFycm93RmlsbGVyID0ge2RpdjogMCwgaWQ6IGlkQWYsIGNsYXNzOiAnYXJyb3cgYXJyb3dmaWxsZXInfTtcblxuICAgIGlkQWIgPSAnIycgKyBpZEFiO1xuICAgIGlkQWYgPSAnIycgKyBpZEFmO1xuXG4gICAgLy92YXIgcG9wT2IgPSB7ZGl2OiBbZGlzcE9iLCBkaXZBcnJvd0JvcmRlciwgZGl2QXJyb3dGaWxsZXJdLCBjbGFzczogJ3BvcHVwJywgYWZ0ZXI6IElkanFPYn07XG4gICAgdmFyIHBvcE9iUmVsID0ge2RpdjogW2Rpc3BPYiwgZGl2QXJyb3dCb3JkZXIsIGRpdkFycm93RmlsbGVyXSwgY2xhc3M6ICdwb3B1cCd9O1xuICAgIHZhciBwb3BPYiA9IHtkaXY6IHBvcE9iUmVsLCBjbGFzczogJ3BvcHVwd3JhcCd9O1xuICAgIHZhciBJZFBvcE9iID0gXy5kcHAgKHBvcE9iKTtcbiAgICB2YXIgcG9zUG9wdXAgPSBfLmdldFBvc0RpbSAoSWRQb3BPYik7XG5cbiAgICB2YXIgdG9wRE8gPSBwb3NFbC50b3AgLSBwb3NQb3B1cC5oZWlnaHQgLSBfLmFycm93U2l6ZTtcbiAgICB2YXIgbGVmdERPID0gcG9zRWwubGVmdCArIHBvc0VsLndpZHRoLzIgLSBwb3NQb3B1cC53aWR0aC8yO1xuXG4gICAgJChJZFBvcE9iKVxuICAgIC5vZmZzZXQgKHt0b3A6IHRvcERPLCBsZWZ0OiBsZWZ0RE99KTtcblxuICAgIHZhciBwb3NBYiA9IF8uZ2V0UG9zRGltIChpZEFiKTtcbiAgICB2YXIgcG9zQWYgPSBfLmdldFBvc0RpbSAoaWRBZik7XG5cbiAgICB2YXIgYXMgPSBfLmFycm93U2l6ZTtcbiAgICAkKGlkQWIpXG4gICAgLm9mZnNldCAoe3RvcDogcG9zQWIudG9wLCBsZWZ0OiBsZWZ0RE8gKyBwb3NQb3B1cC53aWR0aC8yIC0gYXMvMiAtIDJ9KTtcblxuICAgICQoaWRBZilcbiAgICAub2Zmc2V0ICh7dG9wOiBwb3NBZi50b3AsIGxlZnQ6IGxlZnRETyArIHBvc1BvcHVwLndpZHRoLzIgKyAxIC0gYXMvMiAtIDJ9KTtcblxuICAgICQoSWRQb3BPYilcbiAgICAuYWRkQ2xhc3MgKCdwb3B1cG5vdmlzJyk7XG5cbiAgICByZXR1cm4gSWRQb3BPYjtcbn07IC8vIGVuZCBQLmNyZWF0ZVBvcHVwRGlzcGxheSBcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblAuaGlkZVBvcHVwcyA9IChJZCkgPT4ge1xuICAgIFxuICAgIHZhciBzZWwgPSBJZCA/IElkIDogJy5wb3B1cHdyYXAnO1xuXG4gICAgJChzZWwpXG4gICAgLmFkZENsYXNzICgncG9wdXBub3ZpcycpO1xuXG5cbn07IC8vIGVuZCBQLmhpZGVQb3B1cHNcblxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuUC5zaG93UG9wdXBzID0gKElkKSA9PiB7XG4gICAgXG4gICAgdmFyIHNlbCA9IElkID8gSWQgOiAnLnBvcHVwd3JhcCc7XG5cbiAgICAkKHNlbClcbiAgICAucmVtb3ZlQ2xhc3MgKCdwb3B1cG5vdmlzJyk7XG5cblxufTsgLy8gZW5kIFAuc2hvd1BvcHVwc1xuXG5cblxuXG5cbi8vIGVuZCBQVUJMSUMgc2VjdGlvblxuXG5fLmluaXQgKCk7XG5cbnJldHVybiBQO1xuXG59O1xuXG5cblxuXG4iLCIvLyBnby1wb3BpbmZvL2luZGV4MC5qc1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG5cbi8vIFBSSVZBVEUgUHJvcGVydGllcy9NZXRob2RzXG52YXIgXyA9IHtcbn07IC8vIGVuZCBQUklWQVRFIHByb3BlcnRpZXNcblxuXy5pbml0ID0gKCkgPT4ge1xuICAgIFxuICAgIHZhciBjID0gcmVxdWlyZSAoJy4vdGVzdC5qcycpO1xuICAgIG5ldyBjICgpO1xufTtcblxuLy8gUFVCTElDIFByb3BlcnRpZXMvTWV0aG9kc1xudmFyIFAgPSB7fTtcblxuLy8gZW5kIFBVQkxJQyBzZWN0aW9uXG5cbihmdW5jdGlvbiAoKSB7XG5cbiAgICAkKGRvY3VtZW50KS5yZWFkeSAoXy5pbml0KTtcblxufSkgKCk7XG5cblxuXG5yZXR1cm4gUDtcblxufSkgKCk7XG5cblxuXG5cblxuIiwiLy8gZ28tcG9waW5mby90ZXN0LmpzXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuXG4vLyBQUklWQVRFIFByb3BlcnRpZXMvTWV0aG9kc1xudmFyIF8gPSB7XG4gICAgajJoOiByZXF1aXJlICgnZ28tanNvbjJodG1sJyksXG4gICAgcGk6IHJlcXVpcmUgKCdnby1wb3BpbmZvJylcblxufTsgLy8gZW5kIFBSSVZBVEUgcHJvcGVydGllc1xuXG5fLmluaXQgPSAoKSA9PiB7XG5cbiAgICBfLmRwcCA9IF8uajJoLmRpc3BsYXlQYWdlO1xuXG4gICAgXy5waSA9IG5ldyBfLnBpIChfLmoyaCk7XG5cbiAgICBfLmRwcCAoe2RpdjpbXG4gICAgICAgIHtwOiAnVGhlIGRlc2NyaXB0aW9uIGluc2lkZSBhIHBhcmFncmFwaCd9LCBcbiAgICAgICAge2JyOjB9LCBcbiAgICAgICAge3A6ICduZXcgcGFyYScsIFxuICAgICAgICAgICAgaWQ6ICdwYScsIHN0eWxlOiBcbiAgICAgICAgICAgICdkaXNwbGF5OmlubGluZS1ibG9jaydcbiAgICAgICAgfSwgXG4gICAgICAgIHticjowfSwgXG4gICAgICAgIHtwOiAnY2FybHRvbiBwcm9ncmFtbWVkJ31cbiAgICBdLCBzdHlsZTogJ2ZvbnQtc2l6ZTogNDBweCd9KTtcblxuICAgIHZhciBwID0gXy5kcHAgKHtkaXY6IDAsIFxuICAgICAgICBzdHlsZTogJ2xlZnQ6IDMwMHB4OyB0b3A6IDMwMHB4OyBtYXJnaW4tdG9wOiA4MHB4J1xuICAgIH0pO1xuXG4gICAgdmFyIElkID0gXy5kcHAgKHtkaXY6ICdzdHVmZiBpbnNpZGUnLCBcbiAgICAgICAgc3R5bGU6ICd3aWR0aDogMzAwcHg7IGhlaWdodDogMjAwcHg7Ym9yZGVyOiAxcHggc29saWQgYmxhY2s7JywgcGFyZW50OiBwfSk7XG5cbiAgICB2YXIgSWRQYXJhID0gXy5waS5jcmVhdGVQb3B1cERpc3BsYXkgKCcjcGEnLCBcInRoaXMgaXMgYSBwYXJhZ3JhcGhcXG53aXRoIG1vcmUgd29yZHNcXG50aGFuIGV2ZXIgYmVmb3JlXCIpO1xuICAgIC8vXy5waS5zaG93UG9wdXBzIChJZFBhcmEpO1xuXG4gICAgdmFyIElkQm94ID0gXy5waS5jcmVhdGVQb3B1cERpc3BsYXkgKElkLCBcInRoaXMgaXMgYSBwb3B1cFxcbndpdGggbW9yZSBleHBsYW5hdGlvblxcbnRoYW4gZXZlciBiZWZvcmVcIik7XG5cbiAgICBfLnBpLnNob3dQb3B1cHMgKCk7XG5cbiAgICAvKlxuICAgIHNldFRpbWVvdXQgKFxuICAgICAgICBmdW5jdGlvbiAoKSB7Xy5waS5oaWRlUG9wdXBzIChJZFBhcmEpfVxuICAgICwgMzAwMCk7XG4gICAgXG4gICAgc2V0VGltZW91dCAoXG4gICAgICAgIGZ1bmN0aW9uICgpIHtfLnBpLmhpZGVQb3B1cHMgKCl9XG4gICAgLCA1MDAwKTtcbiAgICAqL1xuXG4gICAgXG5cbn07XG5cbl8uaW5pdCAoKTtcblxufTtcbiJdfQ==
