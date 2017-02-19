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
                .empty ();

            } else if (dispOb.hasOwnProperty ('content')) {

                _.displayPageH (parent, dispOb.content);

            } else if (dispOb.hasOwnProperty ('attr')) {

                $(parent)
                .attr (dispOb.attr);

            } else {
                
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

    var popupStyle = {style: 
    '.popup {' +
        'position: relative;' +
        'display: inline-block;' +
        'border: 1px solid blue;' +
        'border-radius: 4px;' +
        'background-color: #ebf2f2;' +
        'font-size: 12px;' +
    '}' +
    '.popupnovis {' +
        'visibility: hidden;' +
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
    '}'
    , parent: 'head'};

    _.dpp (popupStyle);

}; // end _.setPopupStyle





// PUBLIC Properties/Methods
var P = {};

//---------------------
P.createPopupDisplay = (jqOb, dispstr, options) => {
    
    jqOb = typeof jqOb === 'string' ? $(jqOb) : jqOb;

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

    var popOb = {div: [dispOb, divArrowBorder, divArrowFiller], class: 'popup'}
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
    
    var sel = Id ? Id : '.popup';

    $(sel)
    .addClass ('popupnovis');


}; // end P.hidePopups


//---------------------
P.showPopups = (Id) => {
    
    var sel = Id ? Id : '.popup';

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
    _.pi.showPopups (IdPara);

    var IdBox = _.pi.createPopupDisplay (Id, "this is a popup\nwith more explanation\nthan ever before");

    _.pi.showPopups ();

    setTimeout (
        function () {_.pi.hidePopups (IdPara)}
    , 3000);
    
    setTimeout (
        function () {_.pi.hidePopups ()}
    , 5000);

    

};

_.init ();

};




},{"go-json2html":1,"go-popinfo":2}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL25vZGVfbW9kdWxlc19nbG9iYWwvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi9nby1qc29uMmh0bWwvaW5kZXguanMiLCJpbmRleC5qcyIsImluZGV4MC5qcyIsInRlc3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gZ28tanNvbjJodG1sL2luZGV4LmpzXG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcblxuLy8gUFJJVkFURSBQcm9wZXJ0aWVzL01ldGhvZHNcbnZhciBfID0ge1xuXG4gICAgaWQ6IDAsXG4gICAgcHJpbWl0aXZlVHlwZXNOb3ROdWxsOiB7J3N0cmluZyc6MSwgJ3VuZGVmaW5lZCc6MSwgJ251bWJlcic6MSwgJ2Jvb2xlYW4nOjEsICdzeW1ib2wnOiAxfSxcbiAgICAgICAgLy8gc2luY2UgdHlwZW9mIG51bGwgeWllbGRzICdvYmplY3QnLCBpdCdzIGhhbmRsZWQgc2VwYXJhdGVseVxuXG59OyAvLyBlbmQgUFJJVkFURSBwcm9wZXJ0aWVzXG5cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbl8uZGlzcGxheVBhZ2VIID0gKHBhcmVudCwgZGlzcE9iKSA9PiB7XG4gICAgXG4gICAgaWYgKGRpc3BPYiA9PT0gMCkge1xuICAgICAgICAvLyBjYXNlIHdoZXJlIG5vIGNvbnRlbnQgaXMgZGVzaXJlZFxuICAgICAgICAvLyB0byBkaXNwbGF5IGFuIGFjdHVhbCB6ZXJvLCBtYWtlIGl0IGEgc3RyaW5nOiAgXCIwXCJcblxuICAgICAgICByZXR1cm47XG5cbiAgICB9IC8vIGVuZCBpZiAoZGlzcE9iID09PSAwKVxuICAgIFxuICAgIHZhciBkaXNwT2JUeXBlID0gdHlwZW9mIGRpc3BPYjtcbiAgICB2YXIgaXNQcmltaXRpdmUgPSBfLnByaW1pdGl2ZVR5cGVzTm90TnVsbC5oYXNPd25Qcm9wZXJ0eSAoZGlzcE9iVHlwZSkgfHwgZGlzcE9iID09PSBudWxsO1xuXG4gICAgaWYgKGlzUHJpbWl0aXZlKSB7XG5cbiAgICAgICAgSWQgPSBfLnRleHRNYWtlIChwYXJlbnQsIGRpc3BPYiwgJ2FwcGVuZCcpO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgICAgXG4gICAgICAgICAgICAvLyBORSA9PiBOb3QgRW1wdHlcbiAgICAgICAgdmFyIGlzTkVBcnJheSA9IEFycmF5LmlzQXJyYXkgKGRpc3BPYikgJiYgZGlzcE9iLmxlbmd0aCA+IDA7XG4gICAgICAgIHZhciBpc05FT2JqZWN0ID0gIUFycmF5LmlzQXJyYXkoZGlzcE9iKSAmJiBkaXNwT2JUeXBlID09ICdvYmplY3QnICYmIE9iamVjdC5rZXlzKGRpc3BPYikubGVuZ3RoID4gMDtcbiAgICAgICAgXG4gICAgICAgIHZhciBJZCA9IG51bGw7XG4gICAgICAgICAgICAvLyBjYXBpdGFsIElkIHRvIGluZGljYXRlIGlkIHdpdGggJyMnIHByZWZpeGluZyBpdFxuICAgIFxuICAgICAgICBpZiAoaXNORU9iamVjdCkge1xuICAgIFxuICAgICAgICAgICAgaWYgKGRpc3BPYi5oYXNPd25Qcm9wZXJ0eSAoJ3JtJykpIHtcblxuICAgICAgICAgICAgICAgIHZhciBzZWxlY3RvciA9IGRpc3BPYi5ybTtcbiAgICAgICAgICAgICAgICAkKHNlbGVjdG9yKVxuICAgICAgICAgICAgICAgIC5yZW1vdmUgKCk7XG5cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZGlzcE9iLmhhc093blByb3BlcnR5ICgnZW1wdHknKSkge1xuXG4gICAgICAgICAgICAgICAgdmFyIHNlbGVjdG9yID0gZGlzcE9iLmVtcHR5O1xuICAgICAgICAgICAgICAgICQoc2VsZWN0b3IpXG4gICAgICAgICAgICAgICAgLmVtcHR5ICgpO1xuXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGRpc3BPYi5oYXNPd25Qcm9wZXJ0eSAoJ2NvbnRlbnQnKSkge1xuXG4gICAgICAgICAgICAgICAgXy5kaXNwbGF5UGFnZUggKHBhcmVudCwgZGlzcE9iLmNvbnRlbnQpO1xuXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGRpc3BPYi5oYXNPd25Qcm9wZXJ0eSAoJ2F0dHInKSkge1xuXG4gICAgICAgICAgICAgICAgJChwYXJlbnQpXG4gICAgICAgICAgICAgICAgLmF0dHIgKGRpc3BPYi5hdHRyKTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB2YXIgYXR0cnMgPSB7fTtcbiAgICAgICAgICAgICAgICB2YXIgZWxlbWVudE5hbWUgPSBudWxsO1xuICAgICAgICAgICAgICAgIHZhciBjb250ZW50O1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyAoZGlzcE9iKTtcbiAgICAgICAgICAgICAgICB2YXIgaW5zZXJ0TG9jYXRpb24gPSAnYXBwZW5kJztcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHZhciBreSA9IGtleXMgW2ldO1xuICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRhZ1R5cGUgPSBfLmdldFRhZ1R5cGUgKGt5KTtcbiAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdHlsZUluSGVhZCA9IHBhcmVudCA9PT0gJ2hlYWQnICYmIGt5ID09PSAnc3R5bGUnO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc3R5bGUgaW4gaGVhZCA9PiBodG1sIGVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHN0eWxlIG5vdCBpbiBoZWFkID0+IGF0dHJpYnV0ZSBvZiBkaXNwT2JcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB2YXIgdGFnTm90U3R5bGUgPSB0YWdUeXBlICE9PSAwICYmIGt5ICE9PSAnc3R5bGUnO1xuICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRhZ05vdFN0eWxlIHx8IHN0eWxlSW5IZWFkKSB7XG4gICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudE5hbWUgPSBreTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQgPSBkaXNwT2IgW2VsZW1lbnROYW1lXTtcbiAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoa3kpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3BhcmVudCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBkbyBub3RoaW5nIC0tIFByZXZlbnRzICdwYXJlbnQnIGZyb20gYmVjb21pbmcgYW4gYXR0cmlidXRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3ByZXBlbmQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2FwcGVuZCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnYmVmb3JlJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdhZnRlcic6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc2VydExvY2F0aW9uID0ga3k7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudCA9IGRpc3BPYiBba3ldID09PSAxID8gcGFyZW50IDogZGlzcE9iIFtreV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiBhbnkgb2YgcHJlcGVuZCwgLi4uIGFyZSBzcGVjaWZpZWQsIGFuZCB0aGUgdmFsdWUgaXMgb3RoZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoYW4gYSAnMScsIG92ZXJyaWRlIHRoZSBwYXJlbnQgdmFsdWUgd2l0aCB0aGF0IHZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJzIFtreV0gPSBkaXNwT2IgW2t5XTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gLy8gZW5kIHN3aXRjaCAoa3kpXG4gICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB9IC8vIGVuZCBpZiAodGFnVHlwZSAhPT0gMClcbiAgICAgICAgXG4gICAgICAgICAgICAgICAgfSAvLyBlbmQgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzOyBpKyspXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAgICAgICAgIGlmICghZWxlbWVudE5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gZXJyb3IgY2FzZSAtLSBzZXQgYXMgdGV4dCBhbmQgZGlzcGxheSBlbnRpcmUgZGlzcE9iXG5cbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudE5hbWUgPSAndGV4dCc7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQgPSBKU09OLnN0cmluZ2lmeSAoZGlzcE9iKTtcblxuICAgICAgICAgICAgICAgIH0gLy8gZW5kIGlmICghZWxlbWVudE5hbWUpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnROYW1lID09PSAndGV4dCcpIHtcblxuICAgICAgICAgICAgICAgICAgICBJZCA9IF8udGV4dE1ha2UgKHBhcmVudCwgY29udGVudCwgaW5zZXJ0TG9jYXRpb24pO1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICBJZCA9IF8uZWxlbWVudE1ha2UgKGVsZW1lbnROYW1lLCBwYXJlbnQsIGluc2VydExvY2F0aW9uLCBhdHRycyk7XG5cbiAgICAgICAgICAgICAgICB9IC8vIGVuZCBpZiAoZWxlbWVudE5hbWUgPT09ICd0ZXh0JylcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiAoSWQgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gY2FzZSBmb3IgZWxlbWVudCBub3QgJ3RleHQnXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBfLmRpc3BsYXlQYWdlSCAoSWQsIGNvbnRlbnQpO1xuXG4gICAgICAgICAgICAgICAgfSAvLyBlbmQgaWYgKElkICE9PSBudWxsKVxuICAgICAgICAgICAgICAgIFxuXG4gICAgICAgICAgICB9IC8vIGVuZCBpZiAoZGlzcE9iLmhhc093blByb3BlcnR5ICgncm0nKSlcbiAgICAgICAgICAgIFxuICAgIFxuICAgICAgICB9IGVsc2UgaWYgKGlzTkVBcnJheSkge1xuICAgIFxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkaXNwT2IubGVuZ3RoOyBpKyspIHtcbiAgICBcbiAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuZWQgSWQgd2lsbCBiZSBmb3IgbGFzdCBpdGVtIGluIGFycmF5XG4gICAgICAgICAgICAgICAgICAgIC8vIHVzZWZ1bCB0byBsYXRlciBhZGQgc2libGluZ3Mgd2l0aCAnYWZ0ZXInIGtleVxuICAgICAgICAgICAgICAgIElkID0gXy5kaXNwbGF5UGFnZUggKHBhcmVudCwgZGlzcE9iIFtpXSk7XG4gICAgXG4gICAgICAgICAgICB9IC8vIGVuZCBmb3IgKHZhciBpID0gMDsgaSA8IGRpc3BPYi5sZW5ndGg7IGkrKylcbiAgICBcbiAgICAgICAgfSBlbHNlIHtcbiAgICBcbiAgICAgICAgICAgIElkID0gbnVsbDtcbiAgICAgICAgICAgICAgICAvLyBjYXNlIGZvciBkaXNwT2IgYXMgYW4gZW1wdHkgb2JqZWN0IG9yIGVtcHR5IGFycmF5XG4gICAgXG4gICAgICAgIH0gLy8gZW5kIGlmIChpc05FT2JqZWN0KVxuXG4gICAgfSAvLyBlbmQgaWYgKF8ucHJpbWl0aXZlVHlwZXNOb3ROdWxsLmhhc093blByb3BlcnR5IChkaXNwT2JUeXBlKSlcbiAgICBcbiAgICAgICAgXG4gICAgcmV0dXJuIElkO1xuXG59OyAvLyBlbmQgXy5kaXNwbGF5UGFnZUggXG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5fLmVsZW1lbnRNYWtlID0gKHRhZywgcGFyZW50T3JTaWJsLCBpbnNlcnRMb2NhdGlvbiwgYXR0cnMpID0+IHtcbiAgICBcbiAgICB2YXIgaWQ7XG4gICAgdmFyIGF0dHJLZXlzID0gT2JqZWN0LmtleXMgKGF0dHJzKTtcbiAgICB2YXIgaGFzQXR0cnMgPSBhdHRyS2V5cy5sZW5ndGggPiAwO1xuXG4gICAgaWYgKGhhc0F0dHJzICYmIGF0dHJzLmhhc093blByb3BlcnR5ICgnaWQnKSkge1xuXG4gICAgICAgIGlkID0gYXR0cnMuaWQ7XG5cbiAgICB9IGVsc2Uge1xuXG4gICAgICAgIGlkID0gUC5nZW5JZCAoKTtcblxuICAgIH0gLy8gZW5kIGlmIChoYXNBdHRycylcbiAgICBcbiAgICB2YXIgSWQgPSAnIycgKyBpZDtcbiAgICBcbiAgICB2YXIgZGl2ZWwgPSAnPCcgKyB0YWcgKyAnIGlkPVwiJyArIGlkICsgJ1wiJztcblxuICAgIHZhciB0YWd0eXBlID0gXy5nZXRUYWdUeXBlICh0YWcpO1xuXG4gICAgaWYgKHRhZ3R5cGUgPT0gMSkge1xuXG4gICAgICAgIGRpdmVsICs9ICc+JztcblxuICAgIH0gZWxzZSB7XG5cbiAgICAgICAgZGl2ZWwgKz0gJz48LycgKyB0YWcgKyAnPic7XG5cbiAgICB9IC8vIGVuZCBpZiAodGFndHlwZSA9PSAxKVxuXG4gICAgJChwYXJlbnRPclNpYmwpW2luc2VydExvY2F0aW9uXSAoZGl2ZWwpO1xuICAgIFxuICAgIGlmIChoYXNBdHRycykge1xuICAgICAgICBcbiAgICAgICAgJChJZClcbiAgICAgICAgLmF0dHIgKGF0dHJzKTtcblxuICAgIH0gLy8gZW5kIGlmIChoYXNBdHRycylcbiAgICBcbiAgICByZXR1cm4gSWQ7XG5cbn07IC8vIGVuZCBfLmVsZW1lbnRNYWtlXG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5fLmdldFRhZ1R5cGUgPSAodGFnKSA9PiB7XG5cbiAgICAgICAgLy8gMSA9PiB2b2lkIGVsZW1lbnRzLCAyID0+IGhhcyBjb250ZW50XG4gICAgdmFyIHRhZ3MgPSB7IGFyZWE6IDEsIGJhc2U6IDEsIGJyOiAxLCBjb2w6IDEsIGVtYmVkOiAxLCBocjogMSwgaW1nOiAxLCBpbnB1dDogMSwga2V5Z2VuOiAxLCBsaW5rOiAxLCBtZXRhOiAxLCBwYXJhbTogMSwgc291cmNlOiAxLCB0cmFjazogMSwgd2JyOiAxLCBhOiAyLCBhYmJyOiAyLCBhZGRyZXNzOiAyLCBhcnRpY2xlOiAyLCBhc2lkZTogMiwgYXVkaW86IDIsIGI6IDIsIGJkaTogMiwgYmRvOiAyLCBibG9ja3F1b3RlOiAyLCBib2R5OiAyLCBidXR0b246IDIsIGNhbnZhczogMiwgY2FwdGlvbjogMiwgY2l0ZTogMiwgY29kZTogMiwgY29sZ3JvdXA6IDIsIGRhdGFsaXN0OiAyLCBkZDogMiwgZGVsOiAyLCBkZXRhaWxzOiAyLCBkZm46IDIsIGRpYWxvZzogMiwgZGl2OiAyLCBkbDogMiwgZHQ6IDIsIGVtOiAyLCBmaWVsZHNldDogMiwgZmlnY2FwdGlvbjogMiwgZmlndXJlOiAyLCBmb290ZXI6IDIsIGZvcm06IDIsIGgxOiAyLCBoMjogMiwgaDM6IDIsIGg0OiAyLCBoNTogMiwgaDY6IDIsIGhlYWQ6IDIsIGhlYWRlcjogMiwgaGdyb3VwOiAyLCBodG1sOiAyLCBpOiAyLCBpZnJhbWU6IDIsIGluczogMiwga2JkOiAyLCBsYWJlbDogMiwgbGVnZW5kOiAyLCBsaTogMiwgbWFwOiAyLCBtYXJrOiAyLCBtZW51OiAyLCBtZXRlcjogMiwgbmF2OiAyLCBub3NjcmlwdDogMiwgb2JqZWN0OiAyLCBvbDogMiwgb3B0Z3JvdXA6IDIsIG9wdGlvbjogMiwgb3V0cHV0OiAyLCBwOiAyLCBwcmU6IDIsIHByb2dyZXNzOiAyLCBxOiAyLCBycDogMiwgcnQ6IDIsIHJ1Ynk6IDIsIHM6IDIsIHNhbXA6IDIsIHNjcmlwdDogMiwgc2VjdGlvbjogMiwgc2VsZWN0OiAyLCBzbWFsbDogMiwgc3BhbjogMiwgc3Ryb25nOiAyLCBzdHlsZTogMiwgc3ViOiAyLCBzdW1tYXJ5OiAyLCBzdXA6IDIsIHN2ZzogMiwgdGFibGU6IDIsIHRib2R5OiAyLCB0ZDogMiwgdGV4dGFyZWE6IDIsIHRmb290OiAyLCB0aDogMiwgdGhlYWQ6IDIsIHRpbWU6IDIsIHRpdGxlOiAyLCB0cjogMiwgdTogMiwgdWw6IDIsICd2YXInOiAyLCB2aWRlbzogMn07XG5cbiAgICB0YWdzLnRleHQgPSAxOyAgLy8gc3BlY2lhbCB0YWc6ICB1c2VzIF8ubWFrZVRleHQgKClcbiAgICBcbiAgICByZXR1cm4gdGFncy5oYXNPd25Qcm9wZXJ0eSh0YWcpID8gdGFncyBbdGFnXSA6IDA7XG5cbn07IC8vIGVuZCBfLmdldFRhZ1R5cGUgXG5cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbl8udGV4dE1ha2UgPSAocGFyZW50LCBwcmltaXRpdmUsIGxvY2F0aW9uKSA9PiB7XG4gICAgXG4gICAgaWYgKHR5cGVvZiBwcmltaXRpdmUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIFxuICAgICAgICB2YXIgc2luZ2xlcXVvdGUgPSAnJiN4MDAyNzsnO1xuICAgICAgICB2YXIgYmFja3NsYXNoID0gJyYjeDAwNWM7JztcbiAgICAgICAgdmFyIGRvdWJsZXF1b3RlID0gJyYjeDAwMjI7JztcbiAgICAgICAgdmFyIGx0ID0gJyZsdDsnO1xuICAgICAgICBcbiAgICAgICAgcHJpbWl0aXZlID0gcHJpbWl0aXZlLnJlcGxhY2UgKC8nL2csIHNpbmdsZXF1b3RlKTtcbiAgICAgICAgcHJpbWl0aXZlID0gcHJpbWl0aXZlLnJlcGxhY2UgKC9cIi9nLCBkb3VibGVxdW90ZSk7XG4gICAgICAgIHByaW1pdGl2ZSA9IHByaW1pdGl2ZS5yZXBsYWNlICgvXFxcXC9nLCBiYWNrc2xhc2gpO1xuICAgICAgICBwcmltaXRpdmUgPSBwcmltaXRpdmUucmVwbGFjZSAoLzwvZywgbHQpO1xuXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgcHJpbWl0aXZlID09PSAnc3ltYm9sJykge1xuXG4gICAgICAgIHByaW1pdGl2ZSA9ICdzeW1ib2wnO1xuICAgICAgICAgICAgLy8gb3RoZXJ3aXNlIHN0cmluZ2lmeSB3b3VsZCBwcm9kdWNlICd7fScgd2hpY2ggaXMgbGVzcyB1c2VmdWxcblxuICAgIH0gZWxzZSB7XG5cbiAgICAgICAgcHJpbWl0aXZlID0gSlNPTi5zdHJpbmdpZnkgKHByaW1pdGl2ZSk7XG5cbiAgICB9IC8vIGVuZCBpZiAodHlwZW9mIHByaW1pdGl2ZSA9PT0gJ3N0cmluZycpXG4gICAgXG5cbiAgICAkKHBhcmVudCkgW2xvY2F0aW9uXSAocHJpbWl0aXZlKTtcblxuICAgIHJldHVybiBudWxsO1xuICAgICAgICAvLyB0ZXh0IG9icyBoYXZlIG5vIGlkJ3M6IG9ubHkgdGV4dCBpcyBhcHBlbmRlZCB3aXRoIG5vIHdheSB0byBhZGRyZXNzIGl0XG4gICAgICAgIC8vIGlmIGFkZHJlc3NpbmcgaXMgbmVjZXNzYXJ5LCB1c2Ugc3BhbiBpbnN0ZWFkIG9mIHRleHRcblxufTsgLy8gZW5kIF8udGV4dE1ha2UgXG5cblxuXG4vLyBQVUJMSUMgUHJvcGVydGllcy9NZXRob2RzXG52YXIgUCA9IHt9O1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuUC5kaXNwbGF5UGFnZSA9IChkaXNwT2IpID0+IHtcbiAgICBcbiAgICB2YXIgcGFyZW50ID0gZGlzcE9iLmhhc093blByb3BlcnR5ICgncGFyZW50JykgPyBkaXNwT2IucGFyZW50IDogJ2JvZHknO1xuICAgICAgICAvLyBpZiBwYXJlbnQgbm90IGZvdW5kLCBhcHBlbmQgdG8gYm9keVxuXG4gICAgdmFyIElkID0gXy5kaXNwbGF5UGFnZUggKHBhcmVudCwgZGlzcE9iKTtcblxuICAgIHJldHVybiBJZDtcblxufTsgLy8gZW5kIFAuZGlzcGxheVBhZ2UgXG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5QLmdlbklkID0gKCkgPT4ge1xuXG4gICAgdmFyIGlkID0gJ2knICsgXy5pZCsrO1xuICAgIHJldHVybiBpZDtcblxufTsgLy8gZW5kIFAuZ2VuSWRcblxuXG4vLyBlbmQgUFVCTElDIHNlY3Rpb25cblxucmV0dXJuIFA7XG5cbn0oKSk7XG5cblxuXG4iLCIvLyBnby1wb3BpbmZvL2luZGV4LmpzXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGRwKSB7XG5cbi8vIFBSSVZBVEUgUHJvcGVydGllcy9NZXRob2RzXG52YXIgXyA9IHtcbiAgICBkcHA6IGRwLmRpc3BsYXlQYWdlLFxuICAgIGdlbklkOiBkcC5nZW5JZCxcbiAgICBhcnJvd1NpemU6IDEwLFxuXG59OyAvLyBlbmQgUFJJVkFURSBwcm9wZXJ0aWVzXG5cbl8uaW5pdCA9ICgpID0+IHtcblxuICAgIF8uc2V0UG9wdXBTdHlsZSAoKTtcbn07XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5fLmdldFBvc0RpbSA9IChqcSkgPT4ge1xuICAgIFxuICAgIHZhciByZXMgPSB7fTtcblxuICAgIHZhciBvZmZzZXQgPSAkKGpxKS5vZmZzZXQgKCk7XG4gICAgcmVzLmxlZnQgPSBvZmZzZXQubGVmdDtcbiAgICByZXMudG9wID0gb2Zmc2V0LnRvcDtcblxuICAgIHJlcy53aWR0aCA9ICQoanEpLndpZHRoICgpO1xuICAgIHJlcy5oZWlnaHQgPSAkKGpxKS5oZWlnaHQgKCk7XG5cbiAgICByZXR1cm4gcmVzO1xuXG59OyAvLyBlbmQgXy5nZXRQb3NEaW0gXG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5fLnNldFBvcHVwU3R5bGUgPSAoKSA9PiB7XG4gICAgXG4gICAgdmFyIGFzID0gXy5hcnJvd1NpemU7XG5cbiAgICB2YXIgcG9wdXBTdHlsZSA9IHtzdHlsZTogXG4gICAgJy5wb3B1cCB7JyArXG4gICAgICAgICdwb3NpdGlvbjogcmVsYXRpdmU7JyArXG4gICAgICAgICdkaXNwbGF5OiBpbmxpbmUtYmxvY2s7JyArXG4gICAgICAgICdib3JkZXI6IDFweCBzb2xpZCBibHVlOycgK1xuICAgICAgICAnYm9yZGVyLXJhZGl1czogNHB4OycgK1xuICAgICAgICAnYmFja2dyb3VuZC1jb2xvcjogI2ViZjJmMjsnICtcbiAgICAgICAgJ2ZvbnQtc2l6ZTogMTJweDsnICtcbiAgICAnfScgK1xuICAgICcucG9wdXBub3ZpcyB7JyArXG4gICAgICAgICd2aXNpYmlsaXR5OiBoaWRkZW47JyArXG4gICAgJ30nICtcbiAgICAnLmFycm93IHsnICtcbiAgICAgICAgJ3Bvc2l0aW9uOiBhYnNvbHV0ZTsnICtcbiAgICAgICAgJ2Rpc3BsYXk6IGlubGluZS1ibG9jazsnICtcbiAgICAgICAgJ3dpZHRoOiAwOycgK1xuICAgICAgICAnaGVpZ2h0OiAwOycgK1xuICAgICAgICAnYm9yZGVyLXN0eWxlOiBzb2xpZDsnICtcbiAgICAgICAgJ2JveC1zaXppbmc6IGJvcmRlci1ib3g7JyArXG4gICAgJ30nICtcbiAgICAnLmFycm93Ym9yZGVyIHsnICtcbiAgICAgICAgJ2JvcmRlci13aWR0aDogJyArIChhcyAtIDEpICsgJ3B4OycgK1xuICAgICAgICAnYm9yZGVyLWNvbG9yOiBibHVlIHRyYW5zcGFyZW50IHRyYW5zcGFyZW50IHRyYW5zcGFyZW50OycgK1xuICAgICAgICAnYm90dG9tOiAtJyArICgyKmFzIC0gMikgKyAncHg7JyArXG4gICAgJ30nICtcbiAgICAnLmFycm93ZmlsbGVyIHsnICtcbiAgICAgICAgJ2JvcmRlci13aWR0aDogJysgKGFzIC0gMikgKyAncHg7JyArXG4gICAgICAgICdib3JkZXItY29sb3I6ICNlYmYyZjIgdHJhbnNwYXJlbnQgdHJhbnNwYXJlbnQgdHJhbnNwYXJlbnQ7JyArXG4gICAgICAgICdib3R0b206IC0nICsgKDIqYXMgLSA0KSArICdweDsnICtcbiAgICAgICAgJ3otaW5kZXg6IDE7JyArXG4gICAgJ30nXG4gICAgLCBwYXJlbnQ6ICdoZWFkJ307XG5cbiAgICBfLmRwcCAocG9wdXBTdHlsZSk7XG5cbn07IC8vIGVuZCBfLnNldFBvcHVwU3R5bGVcblxuXG5cblxuXG4vLyBQVUJMSUMgUHJvcGVydGllcy9NZXRob2RzXG52YXIgUCA9IHt9O1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuUC5jcmVhdGVQb3B1cERpc3BsYXkgPSAoanFPYiwgZGlzcHN0ciwgb3B0aW9ucykgPT4ge1xuICAgIFxuICAgIGpxT2IgPSB0eXBlb2YganFPYiA9PT0gJ3N0cmluZycgPyAkKGpxT2IpIDoganFPYjtcblxuICAgIGRpc3BTdHJzID0gZGlzcHN0ci5zcGxpdCAoJ1xcbicpO1xuXG4gICAgdmFyIGRpc3BBID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkaXNwU3Rycy5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgIHZhciBkaXNwU3RyID0gZGlzcFN0cnMgW2ldO1xuICAgICAgICBpZiAoaSA+IDApIHtcblxuICAgICAgICAgICAgZGlzcEEucHVzaCAoe2JyOjB9KTtcblxuICAgICAgICB9IC8vIGVuZCBpZiAoaSA+IDApXG4gICAgICAgIFxuICAgICAgICBkaXNwQS5wdXNoICh7c3BhbjogZGlzcFN0ciwgc3R5bGU6ICdkaXNwbGF5OiBpbmxpbmUtYmxvY2s7J30pO1xuXG5cbiAgICB9IC8vIGVuZCBmb3IgKHZhciBpID0gMDsgaSA8IGRpc3BTdHJzOyBpKyspXG4gICAgXG4gICAgdmFyIGRpc3BPYiA9IHtkaXY6IGRpc3BBLCBzdHlsZTogJ21hcmdpbjogMnB4Oyd9O1xuICAgIHZhciBwb3NFbCA9IF8uZ2V0UG9zRGltIChqcU9iKTtcblxuICAgICAgICAvLyBmb3JjZXMgZGl2IHdpZHRoIHRvIHdpZHRoIG9mIGNvbnRlbnRcbiAgICAgICAgLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy80NTA5MDMvaG93LXRvLW1ha2UtZGl2LW5vdC1sYXJnZXItdGhhbi1pdHMtY29udGVudHNcblxuICAgIHZhciBpZEFiID0gXy5nZW5JZCAoKTtcbiAgICB2YXIgaWRBZiA9IF8uZ2VuSWQgKCk7XG5cbiAgICB2YXIgZGl2QXJyb3dCb3JkZXIgPSB7ZGl2OiAwLCBpZDogaWRBYiwgY2xhc3M6ICdhcnJvdyBhcnJvd2JvcmRlcid9O1xuICAgIHZhciBkaXZBcnJvd0ZpbGxlciA9IHtkaXY6IDAsIGlkOiBpZEFmLCBjbGFzczogJ2Fycm93IGFycm93ZmlsbGVyJ307XG5cbiAgICBpZEFiID0gJyMnICsgaWRBYjtcbiAgICBpZEFmID0gJyMnICsgaWRBZjtcblxuICAgIHZhciBwb3BPYiA9IHtkaXY6IFtkaXNwT2IsIGRpdkFycm93Qm9yZGVyLCBkaXZBcnJvd0ZpbGxlcl0sIGNsYXNzOiAncG9wdXAnfVxuICAgIHZhciBJZFBvcE9iID0gXy5kcHAgKHBvcE9iKTtcbiAgICB2YXIgcG9zUG9wdXAgPSBfLmdldFBvc0RpbSAoSWRQb3BPYik7XG5cbiAgICB2YXIgdG9wRE8gPSBwb3NFbC50b3AgLSBwb3NQb3B1cC5oZWlnaHQgLSBfLmFycm93U2l6ZTtcbiAgICB2YXIgbGVmdERPID0gcG9zRWwubGVmdCArIHBvc0VsLndpZHRoLzIgLSBwb3NQb3B1cC53aWR0aC8yO1xuXG4gICAgJChJZFBvcE9iKVxuICAgIC5vZmZzZXQgKHt0b3A6IHRvcERPLCBsZWZ0OiBsZWZ0RE99KTtcblxuICAgIHZhciBwb3NBYiA9IF8uZ2V0UG9zRGltIChpZEFiKTtcbiAgICB2YXIgcG9zQWYgPSBfLmdldFBvc0RpbSAoaWRBZik7XG5cbiAgICB2YXIgYXMgPSBfLmFycm93U2l6ZTtcbiAgICAkKGlkQWIpXG4gICAgLm9mZnNldCAoe3RvcDogcG9zQWIudG9wLCBsZWZ0OiBsZWZ0RE8gKyBwb3NQb3B1cC53aWR0aC8yIC0gYXMvMiAtIDJ9KTtcblxuICAgICQoaWRBZilcbiAgICAub2Zmc2V0ICh7dG9wOiBwb3NBZi50b3AsIGxlZnQ6IGxlZnRETyArIHBvc1BvcHVwLndpZHRoLzIgKyAxIC0gYXMvMiAtIDJ9KTtcblxuICAgICQoSWRQb3BPYilcbiAgICAuYWRkQ2xhc3MgKCdwb3B1cG5vdmlzJyk7XG5cbiAgICByZXR1cm4gSWRQb3BPYjtcbn07IC8vIGVuZCBQLmNyZWF0ZVBvcHVwRGlzcGxheSBcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblAuaGlkZVBvcHVwcyA9IChJZCkgPT4ge1xuICAgIFxuICAgIHZhciBzZWwgPSBJZCA/IElkIDogJy5wb3B1cCc7XG5cbiAgICAkKHNlbClcbiAgICAuYWRkQ2xhc3MgKCdwb3B1cG5vdmlzJyk7XG5cblxufTsgLy8gZW5kIFAuaGlkZVBvcHVwc1xuXG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5QLnNob3dQb3B1cHMgPSAoSWQpID0+IHtcbiAgICBcbiAgICB2YXIgc2VsID0gSWQgPyBJZCA6ICcucG9wdXAnO1xuXG4gICAgJChzZWwpXG4gICAgLnJlbW92ZUNsYXNzICgncG9wdXBub3ZpcycpO1xuXG5cbn07IC8vIGVuZCBQLnNob3dQb3B1cHNcblxuXG5cblxuXG4vLyBlbmQgUFVCTElDIHNlY3Rpb25cblxuXy5pbml0ICgpO1xuXG5yZXR1cm4gUDtcblxufTtcblxuXG5cblxuIiwiLy8gZ28tcG9waW5mby9pbmRleDAuanNcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuXG4vLyBQUklWQVRFIFByb3BlcnRpZXMvTWV0aG9kc1xudmFyIF8gPSB7XG59OyAvLyBlbmQgUFJJVkFURSBwcm9wZXJ0aWVzXG5cbl8uaW5pdCA9ICgpID0+IHtcbiAgICBcbiAgICB2YXIgYyA9IHJlcXVpcmUgKCcuL3Rlc3QuanMnKTtcbiAgICBuZXcgYyAoKTtcbn07XG5cbi8vIFBVQkxJQyBQcm9wZXJ0aWVzL01ldGhvZHNcbnZhciBQID0ge307XG5cbi8vIGVuZCBQVUJMSUMgc2VjdGlvblxuXG4oZnVuY3Rpb24gKCkge1xuXG4gICAgJChkb2N1bWVudCkucmVhZHkgKF8uaW5pdCk7XG5cbn0pICgpO1xuXG5cblxucmV0dXJuIFA7XG5cbn0pICgpO1xuXG5cblxuXG5cbiIsIi8vIGdvLXBvcGluZm8vdGVzdC5qc1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcblxuLy8gUFJJVkFURSBQcm9wZXJ0aWVzL01ldGhvZHNcbnZhciBfID0ge1xuICAgIGoyaDogcmVxdWlyZSAoJ2dvLWpzb24yaHRtbCcpLFxuICAgIHBpOiByZXF1aXJlICgnZ28tcG9waW5mbycpXG5cbn07IC8vIGVuZCBQUklWQVRFIHByb3BlcnRpZXNcblxuXy5pbml0ID0gKCkgPT4ge1xuXG4gICAgXy5kcHAgPSBfLmoyaC5kaXNwbGF5UGFnZTtcblxuICAgIF8ucGkgPSBuZXcgXy5waSAoXy5qMmgpO1xuXG4gICAgXy5kcHAgKHtkaXY6W1xuICAgICAgICB7cDogJ1RoZSBkZXNjcmlwdGlvbiBpbnNpZGUgYSBwYXJhZ3JhcGgnfSwgXG4gICAgICAgIHticjowfSwgXG4gICAgICAgIHtwOiAnbmV3IHBhcmEnLCBcbiAgICAgICAgICAgIGlkOiAncGEnLCBzdHlsZTogXG4gICAgICAgICAgICAnZGlzcGxheTppbmxpbmUtYmxvY2snXG4gICAgICAgIH0sIFxuICAgICAgICB7YnI6MH0sIFxuICAgICAgICB7cDogJ2Nhcmx0b24gcHJvZ3JhbW1lZCd9XG4gICAgXSwgc3R5bGU6ICdmb250LXNpemU6IDQwcHgnfSk7XG5cbiAgICB2YXIgcCA9IF8uZHBwICh7ZGl2OiAwLCBcbiAgICAgICAgc3R5bGU6ICdsZWZ0OiAzMDBweDsgdG9wOiAzMDBweDsgbWFyZ2luLXRvcDogODBweCdcbiAgICB9KTtcblxuICAgIHZhciBJZCA9IF8uZHBwICh7ZGl2OiAnc3R1ZmYgaW5zaWRlJywgXG4gICAgICAgIHN0eWxlOiAnd2lkdGg6IDMwMHB4OyBoZWlnaHQ6IDIwMHB4O2JvcmRlcjogMXB4IHNvbGlkIGJsYWNrOycsIHBhcmVudDogcH0pO1xuXG4gICAgdmFyIElkUGFyYSA9IF8ucGkuY3JlYXRlUG9wdXBEaXNwbGF5ICgnI3BhJywgXCJ0aGlzIGlzIGEgcGFyYWdyYXBoXFxud2l0aCBtb3JlIHdvcmRzXFxudGhhbiBldmVyIGJlZm9yZVwiKTtcbiAgICBfLnBpLnNob3dQb3B1cHMgKElkUGFyYSk7XG5cbiAgICB2YXIgSWRCb3ggPSBfLnBpLmNyZWF0ZVBvcHVwRGlzcGxheSAoSWQsIFwidGhpcyBpcyBhIHBvcHVwXFxud2l0aCBtb3JlIGV4cGxhbmF0aW9uXFxudGhhbiBldmVyIGJlZm9yZVwiKTtcblxuICAgIF8ucGkuc2hvd1BvcHVwcyAoKTtcblxuICAgIHNldFRpbWVvdXQgKFxuICAgICAgICBmdW5jdGlvbiAoKSB7Xy5waS5oaWRlUG9wdXBzIChJZFBhcmEpfVxuICAgICwgMzAwMCk7XG4gICAgXG4gICAgc2V0VGltZW91dCAoXG4gICAgICAgIGZ1bmN0aW9uICgpIHtfLnBpLmhpZGVQb3B1cHMgKCl9XG4gICAgLCA1MDAwKTtcblxuICAgIFxuXG59O1xuXG5fLmluaXQgKCk7XG5cbn07XG5cblxuXG4iXX0=
