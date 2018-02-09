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
    copyDone:'# tags have been copied in the clipboard,\r\nYou can paste in Excel.',
    expand:"Click to expand control bar",
    rowDoubleClic:"Double click to show/hide all tag parameters",
    doubleclic:"Double click to copy value",
    tagurl:"Reopen page",
    copied:'Copied',
    credentials:'You need valid AT Internet credentials to display charts',
       
    title:{
        page:"Show/Hide Page tags",
        cta:"Show/Hide CTA tags",
        other:"Show/Hide other tags",
        url:"Show/Hide URL",
        details:"Show/Hide main details",
        advanced:"Show/Hide all tag parameters",    
        clear:"Clear all recorded tags (or double click anywhere with right button)",
        copy:"Copy all displayed tags",
        chevron:"Collapse control bar",
        record:"Stop recording", 
        view:"(setm) In-Page CTAs Spy",
        viewon:"Deactivate In-Page CTAs Spy",
        chart:"(setm) In-Page CTAs Charts",
        dash:"Contextual Dashboard (granted users)",
        charton:"Deactivate In-Page CTAs Charts",
        book:"Online guide",
        user:"User identification & settings (for CTAs charts)",
        useron:"Close user settings without validation",
        apply:"Record user settings changes",
        rowchart:"CTA Chart"
    }, 
    clabel:{
        page:"Pages",
        cta:"CTA",
        other:"Others",
        url:"Page URL",
        details:"Details",
        advanced:"Advanced",
        filter:"External traffic only"
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
    cnView:"view",
    

    acbx:[],
    /**
     * Bind to HTML objects
     */
    init: function()
    {
        /* Nodes */
        var i=0, node=null, id='',title='';
        an=['cPage','cCTA','cOther','cUrl','cDetails','cAdvanced','bView','bChart','bUser','bChevron','bCopy','bBook','bClear','bApply','dRecord','dBar','dTags','dContent','dMsg',
            'dHelp','dUserContent','fUserForm','tEmail','tPwd','sPeriod'];
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
                    title=trs.title[id];
                    if (title)
                    {
                        node.title=title;
                    }
                }
                tr[an[i]]=node;
            }
        }
    }    
};

