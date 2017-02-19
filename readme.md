### go-popinfo

Popup tips with css arrows pointing to designated html elements

### Installation
```shell
$ npm install go-popinfo
```

### Example (test.js)

```js
var j2h = require ('go-json2html');
var popi = require ('go-popinfo');


var dpp = j2h.displayPage;

var pi = new popi (j2h);

dpp ({div:[
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

pi.showPopups ();

setTimeout (
    function () {pi.hidePopups (IdPara)}
, 3000);

setTimeout (
    function () {pi.hidePopups ()}
, 5000);

```

### Results

Observe two popups that are initially displayed. Then, one disappears after 3 seconds and the second one 2 seconds later by clicking <a href: >here</a>
