// go-popinfo/test.js
// outdated

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
