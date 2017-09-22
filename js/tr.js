/*jslint nomen: true, plusplus: true, regexp: true*/
/**
 * Tags resources strings 
 */
var trs=
{
    c:'en',
    
    page:"Page",
    cta:"CTA",
    other:"Other",
       
    stop:"Stop recording",
    resume:"Resume recording",
    copyDone:'Displayed tags have been copied in the clipboard,\r\nYou can paste in Excel.',
    expand:"Click to expand control bar",
    rowDoubleClic:"Double click to show/hide all tag parameters",
    doubleclic:"Double click to copy value",
    copied:'Copied',
       
    title:{
        page:"Show/Hide Page tags",
        cta:"Show/Hide CTA tags",
        other:"Show/Hide other tags",
        url:"Show/Hide URL on Page and Other tags",
        details:"Show/Hide main details",
        advanced:"Show/Hide all tag parameters",    
        clear:"Clear all recorded tags (or double click anywhere with right button)",
        copy:"Copy all displayed tags",
        chevron:"Collapse control bar",
        record:"Stop recording" 
    },
    clabel:{
        page:"Pages",
        cta:"CTA",
        other:"Others",
        url:"Page URL",
        details:"Details",
        advanced:"Advanced"
    }    
};
/**
 * Tags resources (bind objects and class names)
 */
var tr=
{
    /* Class Names */
    cnTag:"taghead",   
    cnType:"tagtype",
    cnPage:"typepage",
    cnCTA:"typecta",
    cnOther:"typeother", 
    cnSpace:"tagspace",
    cnSub:"tagsub",
    cnName:"tagname",
    cnUrl:"tagurl",
    cnTime:"tagtime",
    cnInfo:"info",
    cnDetail:"detail",
    cnCvar:"cvar",
    cnAdvanced:"advanced",   
    cnActive:"active",
    cnReduced:"reduced",
    

    acbx:[],
    /**
     * Bind to HTML objects
     */
    init: function()
    {
        /* Nodes */
        var i=0, node=null, id='';
        an=['cPage','cCTA','cOther','cUrl','cDetails','cAdvanced','bCopy','bClear','dRecord','dBar','dTags','dContent','dChevron','dMsg'];
        for (i=0;i<an.length;i++)
        {
            id=an[i].substr(1).toLowerCase();
            node=id?document.getElementById(id):null;
            if (node)
            {
                if (an[i].charAt(0)==='c')
                {
                    node.nextSibling.nextSibling.innerHTML=trs.clabel[id]||'';
                    tr.acbx.push(node);
                    node.parentNode.title=trs.title[id]||'';
                }
                else
                {
                    node.title=trs.title[id]||'';
                }
                tr[an[i]]=node;
            }
        }
    }    
};

