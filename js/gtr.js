/**
 * Relationship with css (bind objects and class names), string ressources 
 */
var gtr=
{
    /* Class Names */
    cnRq:"request",
    cnPage:"pagetag",
    cnClic:"clictag",
    cnOther:"othertag", 
    cnSite:"site",
    cnL2:"level2",
    cnUrl:"url",
    cnInfo:"info",
    cnDetail:"detail",
    cnAdvanced:"advanced",   
    cnActive:"active",
    cnReduced:"reduced",
        
    /* Visibility */
    vRow:"table-row",
    vNone:"none",
    vCell:"table-cell",
    
    /* Strings */
    sOther:"Other",
    sPage:"Page",
    sClick:"Event",
    sStop:"Stop recording",
    sResume:"Resume recording",
    sCopyDone:'Displayed tags have been copied in the clipboard,\r\nYou can paste in Excel.',
    sExpand:"Click to expand control bar",
    sDoubleclic:"double-click to show/hide all details",
    sUndeclared:"[Undeclared]",
    sClosed:"[Closed]",
    sNoL2:"Unclassified",
    sRedir:"redirect",
    /**
     * Bind to HTML objects
     */
    bind: function()
    {
        /* Nodes */
        gtr.cbPage=document.getElementById('page');
        gtr.cbClic=document.getElementById('clic');
        gtr.cbOther=document.getElementById('other');
        gtr.cbUrl=document.getElementById('url');
        gtr.cbDetails=document.getElementById('details');
        gtr.cbAdvanced=document.getElementById('advanced');       
        gtr.btCopy=document.getElementById('copy');   
        gtr.btClear=document.getElementById('clear'); 
        gtr.dRecord=document.getElementById('record');  
        gtr.dBar=document.getElementById('bar');
        gtr.dTags=document.getElementById('bodytags');   
        gtr.dContent=document.getElementById("container");
        gtr.dChevron=document.getElementById("reducebar");        
    }    
};